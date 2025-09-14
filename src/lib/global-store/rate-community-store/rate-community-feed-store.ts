import { create } from "zustand";
import type { HumanReviewCardDTO } from "@/lib/view-models/rate-community/types";

interface RateCommunityFeedState {
  // Data
  items: HumanReviewCardDTO[];
  cursor: string | null;
  hasNext: boolean;

  // Loading
  loadingInitial: boolean;
  loadingMore: boolean;
  error?: string;

  // Derived (for UI)
  unreviewedCount: number;
  reviewedCount: number;

  // Internals (no async logic here)
  lastQueryHash?: string;
  limit: number;

  // ===== Mutations (純同步) =====
  setItems: (items: HumanReviewCardDTO[]) => void;
  appendItems: (next: HumanReviewCardDTO[]) => void;
  setCursor: (cursor: string | null) => void;
  setHasNext: (v: boolean) => void;

  setLoadingInitial: (v: boolean) => void;
  setLoadingMore: (v: boolean) => void;
  setError: (msg?: string) => void;

  setCounts: (items: HumanReviewCardDTO[]) => void;
  setLastQueryHash: (h: string | undefined) => void;
  setLimit: (n: number) => void;

  resetForNewQuery: (h: string) => void;
  replaceAll: (items: HumanReviewCardDTO[], cursor: string | null) => void;

  markReviewedInState: (human_review_id: string) => void;
  invalidate: () => void;
}

export const useRateCommunityFeedStore = create<RateCommunityFeedState>((set, get) => ({
  items: [],
  cursor: null,
  hasNext: true,

  loadingInitial: false,
  loadingMore: false,
  error: undefined,

  unreviewedCount: 0,
  reviewedCount: 0,

  lastQueryKey: undefined,
  limit: 24,

  setItems: (items) => set({ items }),
  appendItems: (next) => {
    const merged = [...get().items, ...next];
    set({ items: merged });
  },
  setCursor: (cursor) => set({ cursor }),
  setHasNext: (v) => set({ hasNext: v }),

  setLoadingInitial: (v) => set({ loadingInitial: v }),
  setLoadingMore: (v) => set({ loadingMore: v }),
  setError: (msg) => set({ error: msg }),

  setCounts: (items) =>
    set({
      unreviewedCount: items.filter((x) => !x.reviewedByMe).length,
      reviewedCount: items.filter((x) => x.reviewedByMe).length,
    }),

  setLastQueryHash: (h) => {
    console.log("[useRateCommunityStore] setLastQueryHash called:", h);
    set({ lastQueryHash: h });
    console.log("[useRateCommunityStore] lastQueryHash (after set):", get().lastQueryHash);
  },
  setLimit: (n) => set({ limit: n }),

  resetForNewQuery: (h) =>
    set({
      items: [],
      cursor: null,
      hasNext: true,
      error: undefined,
      lastQueryHash: h,
    }),

  replaceAll: (items, cursor) =>
    set({
      items,
      cursor,
      hasNext: !!cursor && items.length > 0,
      error: undefined,
      unreviewedCount: items.filter((x) => !x.reviewedByMe).length,
      reviewedCount: items.filter((x) => x.reviewedByMe).length,
    }),

  markReviewedInState: (human_review_public_id) => {
    const next = get().items.map((it) =>
      it.public_id === human_review_public_id ? { ...it, reviewedByMe: true } : it
    );
    set({
      items: next,
      unreviewedCount: next.filter((x) => !x.reviewedByMe).length,
      reviewedCount: next.filter((x) => x.reviewedByMe).length,
    });
  },

  invalidate: () => set({ cursor: null, hasNext: true }),
}));
