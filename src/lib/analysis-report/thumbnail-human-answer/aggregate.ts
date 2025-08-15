// lib/analysis/aggregate.ts
import type { Question } from "@/lib/schema/questionaire-schema";
import type { IHumanAnswer } from "@/lib/schema/human-review-schema";
import type {
  ChoiceLikeQuestionType,
  SummaryQuestion,
  QuestionAnswers,
} from "./view-models";

/* --------------------------------- Helpers -------------------------------- */

const CHOICE_LIKE_TYPES: Record<string, true> = {
  "image-select": true,
  "title-select": true,
  radio: true,
  checkbox: true,
};

function isChoiceLikeQuestion(type: Question["type"]): type is ChoiceLikeQuestionType {
  return !!CHOICE_LIKE_TYPES[type ?? ""];
}

/** 把未知型別的答案規範成字串陣列（供單選/複選統一處理） */
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string") as string[];
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
}

/** 由題目的 options 建立 value→label 的索引 */
function buildOptionIndex(question: Question | undefined) {
  const index = new Map<string, string>();
  if (!question?.options) return index;
  for (const option of question.options) {
    index.set(option.value, option.label ?? "");
  }
  return index;
}

/* ----------------------------- Summary Builder ---------------------------- */

/**
 * 建立 Summary 資料：對所有「會產生選項統計」的題目做彙整
 * - image-select/title-select/radio/checkbox → 產生 options 統計
 * - 其它題型 → 只計算 totalAnswers/skippedCount（不會有 options）
 */
export function buildSummaryFromAnswers(
  templateQuestions: Question[],
  allRaterAnswers: IHumanAnswer[],
): SummaryQuestion[] {
  const totalRaters = allRaterAnswers.length;

  const summaryByQuestionId = new Map<string, SummaryQuestion>();
  const optionCountBuckets = new Map<string, Map<string, number>>(); // qid -> (optionValue -> count)

  // 初始化每題
  for (const template of templateQuestions) {
    summaryByQuestionId.set(template.id, {
      questionId: template.id,
      type: template.type,
      title: template.label,
      totalAnswers: 0,
      skippedCount: 0,
      options: isChoiceLikeQuestion(template.type) ? [] : undefined,
    });
    if (isChoiceLikeQuestion(template.type)) {
      optionCountBuckets.set(template.id, new Map());
    }
  }

  // 彙整作答
  for (const raterAnswer of allRaterAnswers) {
    const answeredQuestions = raterAnswer.questionaire || [];

    for (const answered of answeredQuestions) {
      const summary = summaryByQuestionId.get(answered.id);
      if (!summary) continue; // 不是這次模板題目，忽略

      // 非統計題：只算 answered / skipped
      if (!isChoiceLikeQuestion(summary.type)) {
        const rawValue = (answered as { answer?: unknown }).answer;
        const hasValue =
          (typeof rawValue === "string" && rawValue.length > 0) ||
          (Array.isArray(rawValue) && rawValue.length > 0) ||
          (typeof rawValue === "number" && !Number.isNaN(rawValue));
        if (hasValue) summary.totalAnswers += 1;
        continue;
      }

      // 統計題：以 option value 聚合
      const values = toStringArray((answered as { answer?: unknown }).answer);
      if (values.length === 0) {
        // 未答；稍後以 totalRaters - totalAnswers 算 skipped
        continue;
      }
      summary.totalAnswers += 1;

      const bucket = optionCountBuckets.get(summary.questionId)!;
      const template = templateQuestions.find((q) => q.id === summary.questionId);
      const optionIndex = buildOptionIndex(template);

      for (const value of values) {
        const key = optionIndex.has(value) ? value : "__unknown__";
        bucket.set(key, (bucket.get(key) ?? 0) + 1);
      }
    }
  }

  // 收尾：計算 skipped、組裝 options、算 ratio、排序
  for (const [questionId, summary] of summaryByQuestionId.entries()) {
    summary.skippedCount = Math.max(0, totalRaters - summary.totalAnswers);

    if (!isChoiceLikeQuestion(summary.type)) continue;

    const template = templateQuestions.find((q) => q.id === questionId);
    const optionIndex = buildOptionIndex(template);
    const bucket = optionCountBuckets.get(questionId)!;
    const total = summary.totalAnswers || 0;

    const options = [] as NonNullable<SummaryQuestion["options"]>;

    // 先列出模板裡的所有選項（即使 0 次）
    if (template?.options) {
      for (const option of template.options) {
        const count = bucket.get(option.value) ?? 0;
        const ratio = total > 0 ? count / total : 0;

        const optionSummary: NonNullable<SummaryQuestion["options"]>[number] = {
          value: option.value,
          label: option.label,
          count,
          ratio,
          ...(summary.type === "image-select" ? { imageUrl: option.label } : {}),
        };

        options.push(optionSummary);
      }
    }

    // 如果有未知值，補一個 Unknown
    const unknownCount = bucket.get("__unknown__");
    if (unknownCount && unknownCount > 0) {
      options.push({
        value: "__unknown__",
        label: "(Unknown)",
        count: unknownCount,
        ratio: total > 0 ? unknownCount / total : 0,
      });
    }

    // 依 count 由大到小
    options.sort((a, b) => b.count - a.count);
    summary.options = options;
  }

  return Array.from(summaryByQuestionId.values());
}

/* --------------------------- Answers List Builder ------------------------- */

/**
 * 建立 Questions 區資料：逐題列出所有答題者的原始答案（不做統計）
 * - image-select/title-select/radio/checkbox：提供對應的顯示文字/圖片
 * - 其它題型：直接顯示原始值
 */
export function buildAnswersPerQuestion(
  templateQuestions: Question[],
  allRaterAnswers: IHumanAnswer[],
): QuestionAnswers[] {
  const answersByQuestionId = new Map<string, QuestionAnswers>();
  const templateMap = new Map(templateQuestions.map((q) => [q.id, q]));

  // 初始化每題
  for (const template of templateQuestions) {
    answersByQuestionId.set(template.id, {
      questionId: template.id,
      type: template.type,
      title: template.label,
      answers: [],
    });
  }

  // 累積每位 rater 的回答
  for (const raterAnswer of allRaterAnswers) {
    const answeredQuestions = raterAnswer.questionaire || [];

    for (const answered of answeredQuestions) {
      const questionAnswers = answersByQuestionId.get(answered.id);
      if (!questionAnswers) continue;

      const template = templateMap.get(answered.id);
      const rawValue: unknown = (answered as { answer?: unknown }).answer;

      // 是否為複選（以模板為主，無模板則回退 answered.type）
      const isCheckbox = (template?.type === "checkbox") || (answered.type === "checkbox");

      // 正規化為明確的 string 或 string[]
      const normalizedValue: string | string[] = isCheckbox
        ? toStringArray(rawValue)                         // checkbox → string[]
        : (typeof rawValue === "string" ? rawValue : ""); // 其他 → string

      // 轉成對應的顯示資訊（label / image）
      let display: QuestionAnswers["answers"][number]["display"] | undefined;
      if (template?.options?.length) {
        const optionIndex = new Map(template.options.map((o) => [o.value, o.label]));

        if (template.type === "checkbox") {
          const texts = (normalizedValue as string[]).map((v) => optionIndex.get(v) ?? v);
          display = { texts };
        } else if (template.type === "image-select") {
          const v = normalizedValue as string;
          display = { imageUrl: optionIndex.get(v) };
        } else if (template.type === "title-select" || template.type === "radio") {
          const v = normalizedValue as string;
          display = { text: optionIndex.get(v) ?? v };
        }
      }

      questionAnswers.answers.push({
        answerId: raterAnswer.human_answer_id,
        reviewerId: raterAnswer.reviewer_clerk_id,
        createdAt: raterAnswer.created_at,
        value: normalizedValue,
        display,
      });
    }
  }

  // 依 createdAt 新→舊排序
  for (const qa of answersByQuestionId.values()) {
    qa.answers.sort((a, b) => {
      const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
      const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
      return tb - ta;
    });
  }

  return Array.from(answersByQuestionId.values());
}
