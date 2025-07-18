import { create } from "zustand";

export interface SelectedVideo {
  id?: string; // optional，如果你未來要支援用 id 判斷也可以
  title: string;
  thumbnail: string;
}

interface VideoSelectionStore {
  selectedVideos: SelectedVideo[];
  addVideo: (video: SelectedVideo) => void;
  removeVideo: (thumbnail: string) => void;
  clearAll: () => void;
}

const useVideoSelectionStore = create<VideoSelectionStore>((set) => ({
  selectedVideos: [],

  addVideo: (video) =>
    set((state) => {
      const alreadyExists = state.selectedVideos.some(
        (v) => v.thumbnail === video.thumbnail // ✅ 改成用 thumbnail 做唯一判斷
      );
      if (alreadyExists) return state;

      const updated = [video, ...state.selectedVideos].slice(0, 6); // 最多保留 6 個選取
      return { selectedVideos: updated };
    }),

  removeVideo: (thumbnail) =>
    set((state) => ({
      selectedVideos: state.selectedVideos.filter(
        (v) => v.thumbnail !== thumbnail // ✅ 根據 thumbnail 移除
      ),
    })),

  clearAll: () => set({ selectedVideos: [] }),
}));

export default useVideoSelectionStore;
