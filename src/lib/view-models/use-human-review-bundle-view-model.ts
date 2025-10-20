"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useHumanReviewBundleStore, HumanReviewBundle } from "@/lib/global-store/use-human-review-bundle-store";

/** 工具：把 bundle + index 轉為 RHF 預設值（跟你現有的 toFormValues 類似） */
function toDateInput(ts?: string | null): string | null {
  if (!ts) return null;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toFormValues(bundle: HumanReviewBundle, idx: number) {
  const review = bundle.review;
  const th = bundle.thumbnail ?? null;
  const ver = bundle.versions?.[idx];

  return {
    review_audience_visibility: review?.is_public ? "public" : "private",
    review_deadline_date: toDateInput(review?.closedate) ?? "",
    rater_credit_reward: ver?.credit_reward ?? 0,
    wanted_rating_count: ver?.wanted_rating_count ?? 1,
    additional_message_to_rater: ver?.creator_message_to_raters ?? "",
    display_channel_detail: "Yes",
    user_channel_name: th?.user_channel_name ?? "",
  };
}

/** 工具：把 bundle + index 轉為問題陣列（你現有的 toEditorQuestions 類似） */
function toEditorQuestions(bundle: HumanReviewBundle, idx: number) {
  const ver = bundle.versions?.[idx];
  const qs = ver?.questionnaire;
  if (Array.isArray(qs)) return qs;
  return [];
}

export function useHumanReviewBundleViewModel() {
  const searchParams = useSearchParams();

  const {
    bundle,
    versions,
    activeVersionIndex,
    headIndex,
    loadingVersions,
    hasMoreVersions,
    dirtyLatest,

    hydrate,
    selectVersion,
    openLatest,
    loadMoreVersions,
    forkFromVersion,
    setDirtyLatest,
    ensureEditableHeadFrom,
  } = useHumanReviewBundleStore();

  

  // ===== URL ↔ version 同步 =====
  const currentVersionNumberInURL = useMemo(() => {
    const v = searchParams?.get("version");
    return v ? Number(v) : null;
  }, [searchParams]);


  /** 在 Page 首次拿到 bundle 後呼叫：會依 URL version 決定 active */
  const initWithBundle = useCallback((b: HumanReviewBundle | null) => {
    if (!b) return;
    hydrate(b, currentVersionNumberInURL);
  }, [hydrate, currentVersionNumberInURL]);

  // ===== Sidebar 結構 =====
  const versionsUI = useMemo(() => {
    return versions.map((v, idx) => ({
      ...v,
      isActive: activeVersionIndex === idx,
      dateLabel: new Date(v.created_at).toLocaleDateString(),
    }));
  }, [versions, activeVersionIndex]);

  // ===== 事件：Sidebar 用 =====
  const onSelectVersion = useCallback((index: number) => {
    selectVersion(index);
    
  }, [selectVersion]);

  const onOpenLatest = useCallback(() => {
    openLatest();
   
  }, [openLatest]);

  // ===== Builder 觀察/資料 =====
  const currentVersion = useMemo(() => {
    if (!bundle || activeVersionIndex == null) return null;
    return bundle.versions[activeVersionIndex] ?? null;
  }, [bundle, activeVersionIndex]);

  const questionsForActive = useMemo(() => {
    if (!bundle || activeVersionIndex == null) return [];
    return toEditorQuestions(bundle, activeVersionIndex);
  }, [bundle, activeVersionIndex]);

  const formValuesForActive = useMemo(() => {
    if (!bundle || activeVersionIndex == null) return {};
    return toFormValues(bundle, activeVersionIndex);
  }, [bundle, activeVersionIndex]);


  return {
    // 原始資料
    bundle,
    activeVersionIndex,
    headIndex,
    dirtyLatest,

    // Sidebar
    versionsUI,
    loadingVersions,
    hasMoreVersions,
    onSelectVersion,
    onOpenLatest,
    loadMoreVersions,
    forkFromVersion,

    // Builder
    currentVersion,
    questionsForActive,
    formValuesForActive,
    ensureEditableHeadFrom,
    

    // 初始化
    initWithBundle,
    setDirtyLatest,
  };
}

