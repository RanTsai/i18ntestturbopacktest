"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHumanReviewBundleStore, VersionListItem, HumanReviewBundle } from "@/lib/global-store/use-human-review-bundle-store";

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
  const qs = (ver?.questionnaire as any)?.questions;
  if (Array.isArray(qs)) return qs;
  return [];
}

export function useHumanReviewBundleViewModel() {
  const router = useRouter();
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
    applyLatestMetaEdits
  } = useHumanReviewBundleStore();

  

  // ===== URL ↔ version 同步 =====
  const currentVersionNumberInURL = useMemo(() => {
    const v = searchParams?.get("version");
    return v ? Number(v) : null;
  }, [searchParams]);

  const setURLVersion = useCallback((_v: number | null) => {
    /* intentionally no-op while editing */
  }, []);

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

  /** Builder 的「編輯入口」：
   *  - 若正在看舊版：自動 fork 成最新並切過去，再套用修改
   *  - 若正在看最新：直接套用修改
   */
const beginEditOnActive = useCallback((updater: (prevQuestionnaire: any) => any) => {
  const s = useHumanReviewBundleStore.getState();
  if (s.activeVersionIndex == null || !s.bundle) return;

  const hasLocalUnsaved =
    s.dirtyLatest === true &&
    s.headIndex != null &&
    s.bundle.versions?.[s.headIndex] &&
    s.bundle.versions[s.headIndex].version_number === null;

  if (hasLocalUnsaved) {
    // ✅ 已有 Unsaved：不 fork、直接把變更套用到 head
    useHumanReviewBundleStore.getState().applyLatestEdits(updater);
    return;
  }

  const isOnHead = s.headIndex != null && s.activeVersionIndex === s.headIndex;

  if (!isOnHead) {
    // 從舊版開始編輯 → fork 一次
    s.ensureEditableHeadFrom(s.activeVersionIndex);
    useHumanReviewBundleStore.getState().applyLatestEdits(updater);
    return;
  }

  // 在最新，但尚未 dirty → fork 一次
  if (!s.dirtyLatest) {
    s.ensureEditableHeadFrom(s.activeVersionIndex);
  }
  useHumanReviewBundleStore.getState().applyLatestEdits(updater);
}, []);

 const beginMetaEditOnActive = useCallback((patch: {
    review?: any; thumbnail?: any; version?: any;
  }) => {
    const s = useHumanReviewBundleStore.getState();
    if (s.activeVersionIndex == null || !s.bundle) return;

    const isOnHead = s.headIndex != null && s.activeVersionIndex === s.headIndex;

    if (!isOnHead) {
      // 從舊版開始編輯 → 先 fork 成 head draft
      s.ensureEditableHeadFrom(s.activeVersionIndex);
      useHumanReviewBundleStore.getState().applyLatestMetaEdits(patch);
      // URL 指到最新

      return;
    }

    // 已在 head
    if (!s.dirtyLatest) {
      // 第一次變更 → 先 fork 一份 draft
      s.ensureEditableHeadFrom(s.activeVersionIndex);
    }

    useHumanReviewBundleStore.getState().applyLatestMetaEdits(patch);
  }, []);

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
    beginEditOnActive,
    ensureEditableHeadFrom,
    beginMetaEditOnActive,
    

    // 初始化
    initWithBundle,
    setDirtyLatest,
  };
}




export interface IUpsertHumanReviewNewVersionInput {
  version: {
    questionnaire: any;
    credit_reward?: number;
    wanted_rating_count?: number;
    language?: string;
    creator_message_to_raters?: string;
    is_latest?: boolean;
    channel_logo?: string;
    channel_name?: string;
    channel_description?: string;
    platform?: string;
    view_count?: number;
    cancel_count?: number;
    rate_count?: number;
  };
  metadata: {
    is_public?: boolean;
    closedate?: string;
    status?: string;
  };
  thumbnail: {
    thumbnails?: any;
    titles?: string[];
    tags?: any;
    niche?: any;
    platform?: string;
    user_channel_name: string;
    target_audience?: number[];
  };
}
