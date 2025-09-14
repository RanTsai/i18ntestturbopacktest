import { create } from "zustand";
import type { ReviewState, SortMode } from "@/lib/view-models/rate-community/types";

export interface RateCommunityFilterState {
  // 原始狀態
  sourceChannel: string | null;   // 由 Channel VM 單向注入
  reviewState: ReviewState;       // "unreviewed" | "reviewed" | "all"
  tags: string[];                 // UI 選中的 tags
  keyword: string;                // 立即值（不做 debounce）
  sort: SortMode;                 // "latest" | "trending"
  locale: string;                 // 切快取片用

  // 純同步 setters（不藏任何邏輯）
  setSourceChannel: (name: string | null) => void;
  setReviewState: (v: ReviewState) => void;
  setTags: (next: string[]) => void;
  addTagRaw: (tag: string) => void;         // 只 push，不做限制
  removeTagRaw: (tag: string) => void;
  clearTagsRaw: () => void;

  setKeywordRaw: (q: string) => void;
  setSort: (v: SortMode) => void;
  setLocale: (loc: string) => void;

  // 重置（可選）
  resetToDefaults: () => void;
}

export const useRateCommunityFilterStore = create<RateCommunityFilterState>((set, get) => ({
  sourceChannel: null,
  reviewState: "unreviewed",
  tags: [],
  keyword: "",
  sort: "latest",
  locale: "en",

  setSourceChannel: (name) => set({ sourceChannel: name }),
  setReviewState: (v) => set({ reviewState: v }),
  setTags: (next) => set({ tags: next }),

  addTagRaw: (tag) => set({ tags: [...get().tags, tag] }),
  removeTagRaw: (tag) => set({ tags: get().tags.filter((t) => t !== tag) }),
  clearTagsRaw: () => set({ tags: [] }),

  setKeywordRaw: (q) => set({ keyword: q }),
  setSort: (v) => set({ sort: v }),
  setLocale: (loc) => set({ locale: loc }),

  resetToDefaults: () =>
    set({
      sourceChannel: null,
      reviewState: "unreviewed",
      tags: [],
      keyword: "",
      sort: "latest",
      // locale: 保持原值：常由頁面注入
    }),
}));
