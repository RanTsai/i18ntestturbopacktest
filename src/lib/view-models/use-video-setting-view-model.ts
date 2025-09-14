// lib/view-models/use-video-setting-view-model.ts
"use client";

import VideoSettingStore from "../global-store/upload-store";
import { ITags } from "@/lib/schema/user-channel-schema";

export const useVideoSettingViewModel = () => {
  const {
    video_type,
    tags,
    titles,
    title,
    selectedTitle,
    topic,
    theme,
    description,
    niche,
    setVideoType,
    setTags,
    setTitles,
    setTitle,
    setSelectedTitle,
    setTopic,
    setTheme,
    setNiche,
    setDescription,
    reset,
  } = VideoSettingStore();

  /**
   * ✅ 計算屬性 (ViewModel 額外提供的功能)
   */
  const hasTags = tags.length > 0;
  const hasTitles = titles.length > 0;
  const isReadyToSubmit =
    video_type !== "" && title !== "" && topic !== "" && niche !== "";

  return {
    // State
    video_type,
    tags,
    titles,
    title,
    selectedTitle,
    topic,
    theme,
    description,
    niche,

    // Actions
    setVideoType,
    setTags,
    setTitles,
    setTitle,
    setSelectedTitle,
    setTopic,
    setTheme,
    setNiche,
    setDescription,
    reset,

    // Computed
    hasTags,
    hasTitles,
    isReadyToSubmit,
  };
};
