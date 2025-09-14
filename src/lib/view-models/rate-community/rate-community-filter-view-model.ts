import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRateCommunityFilterStore } from "@/lib/global-store/rate-community-store/rate-community-filter-store";
import type { ReviewState, SortMode } from "./types";

// === 常數（放在 VM，非 store）===
const TAGS_LIMIT = 10;
const KEYWORD_DEBOUNCE_MS = 300;

// === sessionStorage helpers ===
function safeGetSession(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSetSession(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // ignore quota / privacy mode errors
  }
}

// === VM：把邏輯集中在這裡 ===
export function useRateCommunityFilterViewModel() {
  // 讀取狀態（Zustand 僅儲存，不含邏輯）
  const state = useRateCommunityFilterStore();
  const {
    sourceChannel, reviewState, tags, keyword, sort, locale,
    setSourceChannel, setReviewState, setTags,
    // 原始 setters（僅在 VM 內部使用）
    setKeywordRaw, setSort, setLocale, resetToDefaults,
  } = state;

  // ============ Keyword Debounce（放 VM）===========
  const keywordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setKeywordDebounced = useCallback((q: string) => {
    if (keywordTimerRef.current) clearTimeout(keywordTimerRef.current);
    keywordTimerRef.current = setTimeout(() => {
      setKeywordRaw(q);
      keywordTimerRef.current = null;
    }, KEYWORD_DEBOUNCE_MS);
  }, [setKeywordRaw]);

  // ============ Tags 操作（放 VM：限制/去重）===========
  const addTag = useCallback((tag: string) => {
    const uniq = new Set(tags);
    uniq.add(tag);
    const next = Array.from(uniq).slice(0, TAGS_LIMIT);
    setTags(next);
  }, [tags, setTags]);

  const removeTag = useCallback((tag: string) => {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
  }, [tags, setTags]);

  const clearTags = useCallback(() => {
    setTags([]);
  }, [setTags]);

  // ============ Query Hash（放 VM，避免 store 內含邏輯）===========
  const getQueryKey = useCallback(() : string | null => {
     if (!locale) return null;
    const q = (keyword ?? "").trim().toLowerCase();
    const ch = sourceChannel ?? "";
    return `ch=${ch}|q=${q}|loc=${locale}`;
  }, [sourceChannel, keyword, locale]);

  // ============ sessionStorage 持久化（Local-first）===========

  // 產生 sessionStorage key（依使用者與 locale）：
  const storageKey = useMemo(() => {
    let uid = "anon";
    try {
      uid = (typeof window !== "undefined" && window.localStorage.getItem("clerk_user_id")) || "anon";
    } catch {}
    return `filter:v1:user=${uid}|loc=${locale}`;
  }, [locale]);

  type FilterCachePayload = {
    version: number;
    updatedAt: number;
    value: {
      sourceChannel: string | null;
      reviewState: ReviewState;
      tags: string[];
      keyword: string;
      sort: SortMode;
      locale: string;
    };
  };

  // 首次載入：從 sessionStorage 還原（若頁面未先注水）
  // useEffect(() => {
  //   let mounted = true;
  //   const raw = safeGetSession(storageKey);
  //   if (!mounted || !raw) return;

  //   try {
  //     const cached = JSON.parse(raw) as FilterCachePayload;
  //     if (!cached?.value) return;
  //     const v = cached.value;

  //     // 同步回 store（不走 debounce）
  //     setSourceChannel(v.sourceChannel);
  //     setReviewState(v.reviewState);
  //     setTags(Array.from(new Set(v.tags)).slice(0, TAGS_LIMIT));
  //     setKeywordRaw(v.keyword);
  //     setSort(v.sort);
  //     // locale 由頁面注入，通常不覆蓋
  //   } catch {
  //     // ignore corrupted JSON
  //   }

  //   return () => { mounted = false; };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [storageKey]);

  // 狀態變更 → 寫回 sessionStorage（以 requestIdleCallback 節流）
  const persistRef = useRef<number | null>(null);
  // useEffect(() => {
  //   const payload: FilterCachePayload = {
  //     version: 1,
  //     updatedAt: Date.now(),
  //     value: { sourceChannel, reviewState, tags, keyword, sort, locale },
  //   };

  //   const write = () => safeSetSession(storageKey, JSON.stringify(payload));

  //   // 在空閒時寫入（fallback setTimeout）
  //   const schedule =
  //     typeof window !== "undefined" && "requestIdleCallback" in window
  //       ? (cb: () => void) => (window as any).requestIdleCallback(cb)
  //       : (cb: () => void) => setTimeout(cb, 0);

  //   const cancel =
  //     typeof window !== "undefined" && "cancelIdleCallback" in window
  //       ? (id: number) => (window as any).cancelIdleCallback(id)
  //       : (id: number) => clearTimeout(id);

  //   if (persistRef.current) cancel(persistRef.current);
  //   persistRef.current = schedule(write);

  //   return () => {
  //     if (persistRef.current) cancel(persistRef.current);
  //     persistRef.current = null;
  //   };
  // }, [storageKey, sourceChannel, reviewState, tags, keyword, sort, locale]);

  // ============ 封裝對外 API（供頁面使用）===========
  const resetFilters = useCallback(() => {
    // 回到「未評論 + latest + 清空 tags/keyword」，locale 不動
    resetToDefaults();
    setSort("latest");
    setReviewState("unreviewed");
  }, [resetToDefaults, setSort, setReviewState]);

  return {
    // 狀態
    sourceChannel, reviewState, tags, keyword, sort, locale,

    // setters（原樣暴露）
    setSourceChannel,
    setReviewState,
    setTags,
    setKeywordRaw,  // 若需要立即寫入
    setSort,
    setLocale,

    // VM 提供的高層 API（建議頁面優先用這些）
    setKeywordDebounced,
    addTag,
    removeTag,
    clearTags,
    getQueryKey,
    resetFilters,
  };
}
