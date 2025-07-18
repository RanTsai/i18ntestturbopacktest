// // lib/global-store/review-data-store.ts
// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import { IHumanReview } from "@/lib/schema/human-review-schema";

// interface ReviewDataStore {
//   data: IHumanReview[];
//   isLoading: boolean;
//   lastFetchedPage: number;
//   hasMore: boolean;

//   setData: (reviews: IHumanReview[]) => void;
//   appendData: (reviews: IHumanReview[]) => void;
//   clearData: () => void;
//   setLoading: (loading: boolean) => void;
//   setLastFetchedPage: (page: number) => void;
//   setHasMore: (hasMore: boolean) => void;

//   selectById: (id: string) => IHumanReview | undefined;
// }

// const useReviewDataStore = create<ReviewDataStore>()(
//   persist(
//     (set, get) => ({
//       data: [],
//       isLoading: false,
//       lastFetchedPage: 0,
//       hasMore: true,

//       setData: (reviews) =>
//         set({
//           data: reviews,
//           lastFetchedPage: 1,
//           hasMore: reviews.length > 0,
//         }),

//       appendData: (reviews) =>
//         set((state) => ({
//           data: [...state.data, ...reviews],
//           lastFetchedPage: state.lastFetchedPage + 1,
//           hasMore: reviews.length > 0,
//         })),

//       clearData: () =>
//         set({
//           data: [],
//           isLoading: false,
//           lastFetchedPage: 0,
//           hasMore: true,
//         }),

//       setLoading: (loading) => set({ isLoading: loading }),
//       setLastFetchedPage: (page) => set({ lastFetchedPage: page }),
//       setHasMore: (hasMore) => set({ hasMore }),

//       selectById: (id: string) => {
//         return get().data.find((item) => item.created_at === id); // or use item.id if available
//       },
//     }),
//     {
//       name: "review-data-store",
//       partialize: (state) => ({
//         data: state.data,
//         lastFetchedPage: state.lastFetchedPage,
//         hasMore: state.hasMore,
//       }),
//     }
//   )
// );

// export default useReviewDataStore;
import { create } from "zustand";
import { IHumanReview } from "@/lib/schema/human-review-schema";

interface ReviewDataStore {
  data: IHumanReview[];
  isLoading: boolean;
  lastFetchedPage: number;
  hasMore: boolean;

  setData: (reviews: IHumanReview[]) => void;
  appendData: (reviews: IHumanReview[]) => void;
  clearData: () => void;
  setLoading: (loading: boolean) => void;
  setLastFetchedPage: (page: number) => void;
  setHasMore: (hasMore: boolean) => void;

  selectById: (id: string) => IHumanReview | undefined;
}

const useReviewDataStore = create<ReviewDataStore>((set, get) => ({
  data: [],
  isLoading: false,
  lastFetchedPage: 0,
  hasMore: true,

  setData: (reviews) =>
    set({
      data: reviews,
      lastFetchedPage: 1,
      hasMore: reviews.length > 0,
    }),

  appendData: (reviews) =>
    set((state) => ({
      data: [...state.data, ...reviews],
      lastFetchedPage: state.lastFetchedPage + 1,
      hasMore: reviews.length > 0,
    })),

  clearData: () =>
    set({
      data: [],
      isLoading: false,
      lastFetchedPage: 0,
      hasMore: true,
    }),

  setLoading: (loading) => set({ isLoading: loading }),
  setLastFetchedPage: (page) => set({ lastFetchedPage: page }),
  setHasMore: (hasMore) => set({ hasMore }),

  selectById: (id: string) => {
    return get().data.find((item) => item.created_at === id); // or item.id
  },
}));

export default useReviewDataStore;
