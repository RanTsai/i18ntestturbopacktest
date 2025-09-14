// lib/global-store/review-filter-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SortMode = "trending" | "latest";

interface ReviewFilterStore {
  selectedMyChannelName: string | null;
  selectedFollowingChannelName: string | null;
  activeFilterGroup: "myChannels" | "following" | null;

  selectedTags: string[];
  keyword: string;
  sortMode: SortMode;

  setMyChannel: (channel_name: string | null) => void;
  setFollowingChannel: (channel_name: string | null) => void;
  setTags: (tags: string[]) => void;
  setKeyword: (keyword: string) => void;
  setSortMode: (mode: SortMode) => void;
  resetFilters: () => void;
}

const useReviewFilterStore = create<ReviewFilterStore>()(
  persist(
    (set) => ({
      selectedMyChannelName: null,
      selectedFollowingChannelName: null,
      activeFilterGroup: null,

      selectedTags: [],
      keyword: "",
      sortMode: "latest",

      setMyChannel: (id) =>
        set({
          selectedMyChannelName: id,
          selectedFollowingChannelName: null,
          activeFilterGroup: id ? "myChannels" : null,
        }),

      setFollowingChannel: (id) =>
        set({
          selectedFollowingChannelName: id,
          selectedMyChannelName: null,
          activeFilterGroup: id ? "following" : null,
        }),

      setTags: (tags) => set({ selectedTags: tags }),
      setKeyword: (keyword) => set({ keyword }),
      setSortMode: (mode) => set({ sortMode: mode }),

      resetFilters: () =>
        set({
          selectedMyChannelName: null,
          selectedFollowingChannelName: null,
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
//   selectedMyChannelName,
//   selectedFollowingChannelName,
//   setTags,
//   setKeyword,
//   setMyChannel,
//   setFollowingChannel,
//   sortMode,
// } = useReviewFilterStore();