"use client";

import React from "react";
import VideoCard from "@/components/ui/review/video-card";
import ShortsSection from "@/components/ui/review/shorts-section";
import { useVideoContext } from "@/context/youtube-video-provider";
import useVideoSelectionStore from "@/lib/global-store/video-selection-store"; // ✅ 你定義的 GlobalStore

export default function YouTubeHomeMock() {
  const { videos, searchTerm } = useVideoContext();
  const { selectedVideos, addVideo, removeVideo } = useVideoSelectionStore(); // ✅

  const firstRow = videos.slice(0, 4);
  const remaining = videos.slice(4);

  // 判斷是否已選取
const isVideoSelected = (thumbnail: string) => {
  return selectedVideos.some((v) => v.thumbnail === thumbnail);
};

// 點擊時處理選取與取消選取
const handleSelect = (video: { title: string; thumbnail: string }) => {
  if (isVideoSelected(video.thumbnail)) {
    removeVideo(video.thumbnail);
  } else {
    addVideo(video); // 不需要其他 key，只要 title + thumbnail
  }
};
  return (
    <div className="min-h-screen bg-background text-foreground p-4 space-y-4">
      {/* 🔹 第一排影片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {firstRow.map((item) => (
          <div
            key={item.id}
            onClick={() => handleSelect({ title: item.title, thumbnail: item.thumbnail })}
            className="cursor-pointer"
          >
            <VideoCard
              video={item}
              isSelected={isVideoSelected(item.thumbnail)}
            />
          </div>
        ))}
      </div>

      {/* 🔹 Shorts 區塊（mobile 版本） */}
      <ShortsSection variant="horizontal" keyword={searchTerm} />

      {/* 🔹 剩下的影片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {remaining.map((item) => (
          <div
            key={item.id}
            onClick={() => handleSelect({ title: item.title, thumbnail: item.thumbnail })}
            className="cursor-pointer"
          >
            <VideoCard
              video={item}
              isSelected={isVideoSelected(item.thumbnail)}
            />
          </div>
        ))}
      </div>

      {/* 無資料提示 */}
      {videos.length === 0 && (
        <p className="text-center text-muted-foreground mt-10">
          No videos found. Try searching something else.
        </p>
      )}
    </div>
  );
}
