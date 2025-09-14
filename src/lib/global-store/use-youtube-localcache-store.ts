// lib/stores/video-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { YoutubeVideo } from "@/lib/schema/youtube-video-schema";

interface VideoState {
  videos: YoutubeVideo[];
  shortVideos: YoutubeVideo[];   // ✅ 新增短影片
  lastSearchTerm: string;

  setVideos: (term: string, videos: YoutubeVideo[]) => void;
  setShortVideos: (term: string, shorts: YoutubeVideo[]) => void;
  setLastSearchTerm: (term: string) => void;
  clearVideos: () => void;
}

export const useYoutubeLocalCacheStore = create<VideoState>()(
  persist(
    (set) => ({
      videos: [],
      shortVideos: [],   // ✅ 預設空陣列
      lastSearchTerm: "",

      setVideos: (term, videos) => set({ lastSearchTerm: term, videos }),
      setShortVideos: (term, shorts) => set({ lastSearchTerm: term, shortVideos: shorts }),
      setLastSearchTerm: (term) => set({ lastSearchTerm: term }),
      clearVideos: () => set({ lastSearchTerm: "", videos: [], shortVideos: [] }),
    }),
    {
      name: "youtube-localcache", 
      partialize: (state) => ({ lastSearchTerm: state.lastSearchTerm }), 
    }
  )
);
