// /stores/useAnalysisReportViewModel.ts
import { useMemo, useCallback } from "react";
import { useAnalysisReportStore } from "@/lib/global-store/analysis-report/human-reviews-with-answers-store";
import type { Question } from "@/lib/schema/questionaire-schema";

/** --- 小工具 --- */
const CHOICE = new Set(["image-select", "title-select", "radio", "checkbox"] as const);
const isChoice = (t?: Question["type"]) => !!t && CHOICE.has(t as any);
const toStrArr = (v: unknown) =>
  Array.isArray(v) ? v.filter((x) => typeof x === "string") : typeof v === "string" && v ? [v] : [];

/** 由題目的 options 建立 value→label 的索引 */
const optionIndex = (q?: Question) => {
  const m = new Map<string, string>();
  q?.options?.forEach((o) => m.set(o.value, o.label ?? ""));
  return m;
};

/** A. 彙總（summary） */
function buildSummary(questions: Question[], answers: any[]) {
  const totalRaters = answers.length;
  const qMap = new Map(questions.map((q) => [q.id, q]));
  const buckets = new Map<string, Map<string, number>>();
  const summary = new Map<
    string,
    {
      questionId: string;
      type?: Question["type"];
      title: string;
      totalAnswers: number;
      skippedCount: number;
      options?: { value: string; label?: string; count: number; ratio: number; imageUrl?: string }[];
    }
  >();

  // init
  questions.forEach((q) => {
    summary.set(q.id, {
      questionId: q.id,
      type: q.type,
      title: q.label,
      totalAnswers: 0,
      skippedCount: 0,
      options: isChoice(q.type) ? [] : undefined,
    });
    if (isChoice(q.type)) buckets.set(q.id, new Map());
  });

  // fold
  for (const one of answers) {
    const qs: Question[] = (one?.questionnaire as any[]) ?? [];
    for (const a of qs) {
      const s = summary.get(a.id);
      if (!s) continue;

      if (!isChoice(s.type)) {
        const v: any = (a as any).answer;
        const has =
          (typeof v === "string" && v) ||
          (Array.isArray(v) && v.length > 0) ||
          (typeof v === "number" && !Number.isNaN(v));
        if (has) s.totalAnswers += 1;
        continue;
      }

      const values = toStrArr((a as any).answer);
      if (values.length === 0) continue;
      s.totalAnswers += 1;

      const idx = optionIndex(qMap.get(s.questionId));
      const b = buckets.get(s.questionId)!;
      for (const val of values) {
        const key = idx.has(val) ? val : "__unknown__";
        b.set(key, (b.get(key) ?? 0) + 1);
      }
    }
  }

  // finalize
  for (const [qid, s] of summary) {
    s.skippedCount = Math.max(0, totalRaters - s.totalAnswers);
    if (!isChoice(s.type)) continue;

    const tmpl = qMap.get(qid);
    const b = buckets.get(qid)!;
    const total = s.totalAnswers || 0;
    const opts: NonNullable<typeof s.options> = [];

    tmpl?.options?.forEach((o) => {
      const count = b.get(o.value) ?? 0;
      const ratio = total > 0 ? count / total : 0;
      opts.push({
        value: o.value,
        label: o.label,
        count,
        ratio,
        ...(s.type === "image-select" ? { imageUrl: o.label } : {}),
      });
    });

    const unk = b.get("__unknown__");
    if (unk) {
      opts.push({ value: "__unknown__", label: "(Unknown)", count: unk, ratio: total > 0 ? unk / total : 0 });
    }

    opts.sort((a, b) => b.count - a.count);
    s.options = opts;
  }

  return Array.from(summary.values());
}

/** B. 逐題作答列表（perQuestion） */
function buildPerQuestion(questions: Question[], answers: any[]) {
  const qMap = new Map(questions.map((q) => [q.id, q]));
  const res = new Map<
    string,
    {
      questionId: string;
      type?: Question["type"];
      title: string;
      answers: {
        createdAt?: string;
        reviewerName?: string | null;
        reviewerAvatarUrl?: string | null;
        value: string | string[];
        display?: { text?: string; texts?: string[]; imageUrl?: string };
      }[];
    }
  >();

  questions.forEach((q) => res.set(q.id, { questionId: q.id, type: q.type, title: q.label, answers: [] }));

  for (const one of answers) {
    const qs: Question[] = (one?.questionnaire as any[]) ?? [];
    for (const a of qs) {
      const bucket = res.get(a.id);
      if (!bucket) continue;

      const tmpl = qMap.get(a.id);
      const raw: any = (a as any).answer;
      const isCheckbox = tmpl?.type === "checkbox" || (a as any)?.type === "checkbox";
      const normalized: string | string[] = isCheckbox ? toStrArr(raw) : typeof raw === "string" ? raw : "";

      let display: { text?: string; texts?: string[]; imageUrl?: string } | undefined;
      if (tmpl?.options?.length) {
        const idx = new Map(tmpl.options.map((o) => [o.value, o.label]));
        if (tmpl.type === "checkbox") {
          const texts = (normalized as string[]).map((v) => idx.get(v) ?? v);
          display = { texts };
        } else if (tmpl.type === "image-select") {
          display = { imageUrl: idx.get(normalized as string) };
        } else if (tmpl.type === "title-select" || tmpl.type === "radio") {
          display = { text: idx.get(normalized as string) ?? (normalized as string) };
        }
      }

      bucket.answers.push({
        createdAt: one?.created_at,
        reviewerName: one?.rater?.username ?? null,
        reviewerAvatarUrl: one?.rater?.profile_pic_url ?? null,
        value: normalized,
        display,
      });
    }
  }

  for (const b of res.values()) {
    b.answers.sort((a, b) => Date.parse(b.createdAt || "0") - Date.parse(a.createdAt || "0"));
  }

  return Array.from(res.values());
}

/** --- VM Hook --- */
export function useThumbnailAnalysisReportViewModel() {
  const versions = useAnalysisReportStore((s) => s.versions);
  const activeVersionNumber = useAnalysisReportStore((s) => s.activeVersionNumber);

  // ===== 版本清單（提供 UI 顯示） =====
  const versionList = useMemo(() => {
    return (versions ?? [])
      .slice()
      .sort((a, b) => {
        const av = a.version_number ?? -Infinity;
        const bv = b.version_number ?? -Infinity;
        if (av === bv) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return bv - av;
      })
      .map((v) => ({
        versionNumber: v.version_number ?? null,
        createdAt: v.created_at,
        display: v.version_number != null ? `v${v.version_number}` : `v? (${new Date(v.created_at).toLocaleString()})`,
        language: v.language ?? undefined,
      }));
  }, [versions]);

  const hasMultipleVersions = versionList.length > 1;

  // 提供可切換的版本集合（UI 可用來 disable 無效項）
  const canSwitchTo = useMemo(() => {
    return new Set<number | null>((versions ?? []).map((v) => v.version_number ?? null));
  }, [versions]);

  // 排序後的版本號清單（用於 next/prev）
  const sortedVersionNumbers = useMemo(() => {
    return versionList.map((v) => v.versionNumber).filter((v) => v != null) as number[];
  }, [versionList]);

  // ===== 當前版本 =====
  const activeVersion = useMemo(() => {
    if (!versions?.length) return null;
    if (activeVersionNumber != null) {
      return versions.find((v) => v.version_number === activeVersionNumber) ?? versions[0];
    }
    return versions[0];
  }, [versions, activeVersionNumber]);

  const questions = activeVersion?.questions ?? ([] as Question[]);
  const answers = activeVersion?.answers ?? ([] as any[]);

  // ===== 衍生（summary / perQuestion / kpi 等） =====
  const summaryViewModel = useMemo(() => buildSummary(questions, answers), [questions, answers]);
  const perQuestionViewModel = useMemo(() => buildPerQuestion(questions, answers), [questions, answers]);

  const imageSummary = useMemo(
    () => summaryViewModel.find((q: any) => q.type === "image-select") ?? null,
    [summaryViewModel]
  );
  const titleSummary = useMemo(
    () => summaryViewModel.find((q: any) => q.type === "title-select") ?? null,
    [summaryViewModel]
  );
  const radioSummaries = useMemo(() => summaryViewModel.filter((q: any) => q.type === "radio"), [summaryViewModel]);
  const checkboxSummaries = useMemo(
    () => summaryViewModel.filter((q: any) => q.type === "checkbox"),
    [summaryViewModel]
  );

  const totalRaters = answers.length;
  const kpi = useMemo(
    () => ({
      wantedRatingCount: activeVersion?.wanted_rating_count ?? 0,
      rateCount: activeVersion?.rate_count ?? 0,
      likeCount: activeVersion?.like_count ?? 0,
      viewCount: activeVersion?.view_count ?? 0,
    }),
    [activeVersion]
  );

  // raterMap（有時 UI 會用到）
  const raterMap = useMemo(() => {
    const m = new Map<string, { username?: string | null; profile_pic_url?: string | null }>();
    answers.forEach((a, i) => {
      const key = a?.rater?.username ?? `#${i}-${a?.created_at}`;
      m.set(key, {
        username: a?.rater?.username ?? null,
        profile_pic_url: a?.rater?.profile_pic_url ?? null,
      });
    });
    return m;
  }, [answers]);

  // ===== 版本操作（包在 VM，UI 不直接碰 store） =====
  const _setActiveVersion = useAnalysisReportStore((s) => s.setActiveVersion);

  const setActiveVersion = useCallback(
    (v: number | null) => {
      if (v == null || canSwitchTo.has(v)) _setActiveVersion(v);
      // 若要在切版本後做事（例如自動捲動到頂），可以在 UI 那邊呼叫後處理
    },
    [_setActiveVersion, canSwitchTo]
  );

  const selectLatest = useCallback(() => {
    if (!versionList.length) return;
    setActiveVersion(versionList[0].versionNumber); // versionList 已由新→舊排序
  }, [versionList, setActiveVersion]);

  const selectPrev = useCallback(() => {
    if (sortedVersionNumbers.length === 0 || activeVersionNumber == null) return;
    const idx = sortedVersionNumbers.indexOf(activeVersionNumber);
    if (idx < 0) return;
    const nextIdx = idx + 1;
    if (nextIdx < sortedVersionNumbers.length) {
      setActiveVersion(sortedVersionNumbers[nextIdx]);
    }
  }, [sortedVersionNumbers, activeVersionNumber, setActiveVersion]);

  const selectNext = useCallback(() => {
    if (sortedVersionNumbers.length === 0 || activeVersionNumber == null) return;
    const idx = sortedVersionNumbers.indexOf(activeVersionNumber);
    if (idx <= 0) return;
    const prevIdx = idx - 1;
    if (prevIdx >= 0) {
      setActiveVersion(sortedVersionNumbers[prevIdx]);
    }
  }, [sortedVersionNumbers, activeVersionNumber, setActiveVersion]);

  return {
    // 版本
    versionList,
    activeVersion,
    activeVersionNumber,
    hasMultipleVersions,
    canSwitchTo,

    // 版本操作（提供給 UI）
    setActiveVersion,
    selectLatest,
    selectPrev,
    selectNext,

    // 當前資料
    questions,
    answers,

    // KPI / 統計
    totalRaters,
    kpi,

    // 聚合 VM
    summaryViewModel,
    perQuestionViewModel,
    imageSummary,
    titleSummary,
    radioSummaries,
    checkboxSummaries,
    raterMap,
  };
}

/** --- 型別（沿用你的定義，放在這裡方便 import type） --- */
export interface IHumanAnswersAnalysisReport {
  success: boolean;
  code?: string | null;
  message?: string | null;
  data: {
    meta: {
      public_id: string;
      created_at: string;
      closedate: string | null;
      is_closed: boolean;
      status: string | null;
      approve_method: string | null;
      current_version: number | null;
    };
    versions: Array<{
      version_number: number | null;
      created_at: string;
      language: string | null;
      channel_logo: string | null;
      channel_name: string | null;
      channel_description: string | null;
      platform: string | null;
      wanted_rating_count: number;
      rate_count: number;
      like_count: number;
      view_count: number;
      questions: any;
      answers: Array<{
        created_at: string;
        is_public: boolean | null;
        accept_reward: boolean | null;
        message_to_creator: string | null;
        follow_creator: boolean | null;
        support_creator_credit: number | null;
        like_count: number | null;
        questionnaire: any;
        rater: {
          username: string | null;
          profile_pic_url: string | null;
        } | null;
      }>;
    }>;
  };
}
