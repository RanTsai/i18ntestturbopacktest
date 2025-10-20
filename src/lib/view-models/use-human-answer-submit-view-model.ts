// src/lib/view-models/use-human-answer-submit-vm.ts
"use client";
import type { Question, QuestionnaireAnswer } from "@/lib/schema/questionaire-schema";
import { useCallback, useMemo } from "react";
import { insertHumanAnswersToSupabaseRPC } from "@/actions/supabase/supabase-human-reviews";
import { useQuestionnaireStore } from "@/lib/global-store/human-review-questionaire-store";
import { getErrorMessage } from "../utils/message-utils";

/**
 * 前端在「提交當下」組裝好的輸入。
 * - questionnaire 只包含 Questions[]（每題含 answer）
 * - GeneralQuestionnaire 的答案映射到 top-level 欄位（見下方欄位）
 * - reviewer_supabase_id / created_at / like_count / deleted_* 皆由後端處理
 */
export interface IInsertHumanAnswerInput {
  human_reviews_public_id: string;
  questionnaire: Question[];
  is_public: boolean;
  accept_reward: boolean;
  message_to_creator: string;
  follow_creator: boolean;
  support_creator_credit: number;
}

export const HUMAN_ANSWER_DRAFT_KEY = "human_answer_draft";

export type HumanAnswerSubmitErrorCode =
  | "INVALID_VERSION"
  | "EMPTY_QUESTIONNAIRE"
  | "RPC_FAILED";

export interface HumanAnswerSubmitResult {
  ok: boolean;
  human_answer_id?: number;
  code?: HumanAnswerSubmitErrorCode;
  message?: string;
}

export interface BuildPayloadParams {
  humanReviewsPublicId: string;
  /** GeneralQuestionnaire 的扁平值（RHF.getValues()） */
  formValues: QuestionnaireAnswer;
  /** 若不想用 store，也可覆蓋傳入題目 */
  questionsOverride?: Question[];
}

function yes(v: unknown) { return String(v ?? "").toLowerCase() === "yes"; }
function toNonNegativeInt(v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n) || Number.isNaN(n)) return 0;
  return n < 0 ? 0 : Math.floor(n);
}
function mapFormValuesToTopFields(formValues: QuestionnaireAnswer) {
  return {
    is_public: yes(formValues?.allow_public_display),
    accept_reward: yes(formValues?.accept_reward),
    message_to_creator: String(formValues?.message_to_creator ?? ""),
    follow_creator: yes(formValues?.follow_creator_for_future),
    support_creator_credit: toNonNegativeInt(formValues?.support_creator_credit),
  };
}


export function clearHumanAnswerDraft() {
  try {
    localStorage.removeItem(HUMAN_ANSWER_DRAFT_KEY);
  } catch {
    // ignore
  }
}
type AnswerValue = QuestionnaireAnswer[keyof QuestionnaireAnswer];

export function useHumanAnswerSubmitViewModel() {
  const questionsStore = useQuestionnaireStore((s) => s.questions);

  const buildPayload = useCallback(
    (params: BuildPayloadParams): IInsertHumanAnswerInput => {
      const publicId = params.humanReviewsPublicId?.trim();
      if (!publicId) throw new Error("human_reviews_public_id is required");

      const formValues = params.formValues ?? {};
      const rawQuestions = Array.isArray(params.questionsOverride)
        ? params.questionsOverride
        : questionsStore;

      // ★ 關鍵修正：把 RHF 的值寫進每題的 answer，一起送到 DB
        const questionsWithAnswers: Question[] = rawQuestions.map((q) => {
        const hasValue = Object.prototype.hasOwnProperty.call(formValues, q.id);
        const existing = (q as { answer?: AnswerValue | null }).answer ?? null;

        return {
          ...q,
          // 明確告訴 TS 這是 AnswerValue | null
          answer: (hasValue ? (formValues[q.id] as AnswerValue) : existing), 
          // ↑ 若你已把 Question.answer 改成 union，可去掉最後的 `as unknown as any`
          //   並直接寫：answer: hasValue ? (formValues[q.id] as AnswerValue) : existing,
        };
      });

      const top = mapFormValuesToTopFields(formValues);

      const payload: IInsertHumanAnswerInput = {
        human_reviews_public_id: publicId,      // ★ 傳 public_id
        questionnaire: questionsWithAnswers,    // ★ 帶 answer 的題目
        is_public: top.is_public,
        accept_reward: top.accept_reward,
        message_to_creator: top.message_to_creator,
        follow_creator: top.follow_creator,
        support_creator_credit: top.support_creator_credit,
      };
      return payload;
    },
    [questionsStore]
  );

  const submit = useCallback(
    async (payload: IInsertHumanAnswerInput): Promise<HumanAnswerSubmitResult> => {
      try {
        const res = await insertHumanAnswersToSupabaseRPC(payload);
        if (!res?.success || !res?.data) {
          return {
            ok: false,
            code: "RPC_FAILED",
            message: res?.message ?? "RPC failed",
          };
        }

        const newId: number | undefined =
          typeof res.data?.human_answer_id === "number"
            ? res.data.human_answer_id
            : (res.data?.[0]?.human_answer_id as number | undefined);

        return { ok: true, human_answer_id: newId };
      } catch (err: unknown) {
        return {
          ok: false,
          code: "RPC_FAILED",
          message: getErrorMessage(err) ?? "RPC exception",
        };
      }
    },
    []
  );

  const clearDraft = useCallback(() => {
    clearHumanAnswerDraft();
  }, []);

  const snapshot = useMemo(
    () => ({
      questions: questionsStore,
    }),
    [questionsStore]
  );

  return {
    draftKey: HUMAN_ANSWER_DRAFT_KEY,
    snapshot,
    buildPayload,
    submit,
    clearDraft,
  };
}
