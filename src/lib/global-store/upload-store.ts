"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ITags } from "../schema/user-channel-schema";

export interface IVideoSettingStore {
  video_type: string;
  tags: ITags[];
  titles: string[];
  title: string;
  topic: string;
  theme: string;
  description: string;
  niche: string;
  selectedTitle:string;

  setVideoType: (type: string) => void;
  setTags: (tags: ITags[]) => void;
  setTitles: (titles: string[]) => void;
  setTitle: (title: string) => void;
  setSelectedTitle: (selectedTitle: string) => void;
  setTopic: (topic: string) => void;
  setTheme: (theme: string) => void;
  setNiche: (niche: string) => void;
  setDescription: (desc: string) => void;

  reset: () => void;
}

const VideoSettingStore = create<IVideoSettingStore>()(
  persist(
    (set) => ({
      video_type: "",
      tags: [],
      titles: [],
      title: "",
      selectedTitle: "",
      topic: "",
      theme: "",
      description: "",
      niche: "",

      setVideoType: (type) => set({ video_type: type }),
      setTags: (tags) => set({ tags }),
      setTitles: (titles) => set({ titles }),
      setTitle: (title) => set({ title }),
      setSelectedTitle: (selectedTitle) => set({selectedTitle}),
      setTopic: (topic) => set({ topic }),
      setTheme: (theme) => set({ theme }),
      setNiche: (niche) => set({ niche }),
      setDescription: (desc) => set({ description: desc }),

      reset: () =>{
          localStorage.removeItem("video-settings");

        set({
          video_type: "",
          tags: [],
          titles: [],
          topic: "",
          title: "",
          selectedTitle: "",
          theme: "",
          niche: "",
          description: "",
        });
      }
    }),
    {
      name: "video-settings", // storage key
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          localStorage.removeItem(name);
        },
      },
    }
  )
);

export default VideoSettingStore;
