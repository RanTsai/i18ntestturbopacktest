"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { YoutubeVideo } from "@/lib/schema/youtube-video-schema";

type VideoGroupKey = string;

type VideoState = {
  [key: string]: YoutubeVideo[];
};

type VideoContextType = {
  videoGroups: VideoState;
  setVideosByKey: (key: VideoGroupKey, videos: YoutubeVideo[]) => void;
  getVideosByKey: (key: VideoGroupKey) => YoutubeVideo[];
  removeKey: (key: VideoGroupKey) => void;

  // 主動控制目前顯示哪一組影片
  activeKey: string;
  setActiveKey: (key: string) => void;
  videos: YoutubeVideo[]; // 根據 activeKey 自動取得

  searchTerm: string;
  setSearchTerm: (term: string) => void;
};

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const useVideoContext = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideoContext must be used within a VideoProvider");
  }
  return context;
};

export const VideoProvider = ({ children }: { children: React.ReactNode }) => {
  const [videoGroups, setVideoGroups] = useState<VideoState>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeKey, setActiveKey] = useState<string>("search");

  // 從 sessionStorage 還原
  useEffect(() => {
    const savedGroups = sessionStorage.getItem("videoGroups");
    const savedSearch = sessionStorage.getItem("searchTerm");
    const savedKey = sessionStorage.getItem("activeKey");

    if (savedGroups) {
      try {
        setVideoGroups(JSON.parse(savedGroups));
      } catch (err) {
        console.error("Error parsing saved videoGroups", err);
      }
    }
    if (savedSearch) setSearchTerm(savedSearch);
    if (savedKey) setActiveKey(savedKey);
  }, []);

  // 自動儲存
  useEffect(() => {
    sessionStorage.setItem("videoGroups", JSON.stringify(videoGroups));
  }, [videoGroups]);

  useEffect(() => {
    sessionStorage.setItem("searchTerm", searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    sessionStorage.setItem("activeKey", activeKey);
  }, [activeKey]);

  const setVideosByKey = (key: VideoGroupKey, videos: YoutubeVideo[]) => {
    setVideoGroups((prev) => ({
      ...prev,
      [key]: videos,
    }));
  };

  const getVideosByKey = (key: VideoGroupKey): YoutubeVideo[] => {
    return videoGroups[key] || [];
  };

  const removeKey = (key: VideoGroupKey) => {
    setVideoGroups((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const videos = videoGroups[activeKey] || [];

  return (
    <VideoContext.Provider
      value={{
        videoGroups,
        setVideosByKey,
        getVideosByKey,
        removeKey,
        activeKey,
        setActiveKey,
        videos,
        searchTerm,
        setSearchTerm,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};
