// lib/global-store/review-filter-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SortMode = "trending" | "latest";

interface ReviewFilterStore {
  selectedMyChannelId: number | null;
  selectedFollowingChannelId: number | null;
  activeFilterGroup: "myChannels" | "following" | null;

  selectedTags: string[];
  keyword: string;
  sortMode: SortMode;

  setMyChannel: (id: number | null) => void;
  setFollowingChannel: (id: number | null) => void;
  setTags: (tags: string[]) => void;
  setKeyword: (keyword: string) => void;
  setSortMode: (mode: SortMode) => void;
  resetFilters: () => void;
}

const useReviewFilterStore = create<ReviewFilterStore>()(
  persist(
    (set) => ({
      selectedMyChannelId: null,
      selectedFollowingChannelId: null,
      activeFilterGroup: null,

      selectedTags: [],
      keyword: "",
      sortMode: "latest",

      setMyChannel: (id) =>
        set({
          selectedMyChannelId: id,
          selectedFollowingChannelId: null,
          activeFilterGroup: id ? "myChannels" : null,
        }),

      setFollowingChannel: (id) =>
        set({
          selectedFollowingChannelId: id,
          selectedMyChannelId: null,
          activeFilterGroup: id ? "following" : null,
        }),

      setTags: (tags) => set({ selectedTags: tags }),
      setKeyword: (keyword) => set({ keyword }),
      setSortMode: (mode) => set({ sortMode: mode }),

      resetFilters: () =>
        set({
          selectedMyChannelId: null,
          selectedFollowingChannelId: null,
          activeFilterGroup: null,
          selectedTags: [],
          keyword: "",
          sortMode: "latest",
        }),
    }),
    {
      name: "review-filter-store",
    }
  )
);

export default useReviewFilterStore;

// const {
//   selectedTags,
//   keyword,
//   selectedMyChannelId,
//   selectedFollowingChannelId,
//   setTags,
//   setKeyword,
//   setMyChannel,
//   setFollowingChannel,
//   sortMode,
// } = useReviewFilterStore();