"use client";

import React from "react";
import VideoCard from "@/components/ui/review/video-card";
import ShortsSection from "@/components/ui/review/shorts-section";
import useVideoSelectionStore from "@/lib/global-store/video-selection-store";
import { YoutubeVideo } from "@/lib/schema/youtube-video-schema";

interface Props {
  videos: YoutubeVideo[];
  shorts: YoutubeVideo[];
}

export default function YouTubeHomeMock({ videos,shorts }: Props) {
  const { selectedVideos, addVideo, removeVideo } = useVideoSelectionStore();

  const firstRow = videos.slice(0, 4);
  const remaining = videos.slice(4);

  const isVideoSelected = (thumbnail: string) =>
    selectedVideos.some((v) => v.thumbnail === thumbnail);

  const handleSelect = (video: { title: string; thumbnail: string }) => {
    if (isVideoSelected(video.thumbnail)) {
      removeVideo(video.thumbnail);
    } else {
      addVideo(video);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 space-y-4">
      {/* 🔹 第一排影片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {firstRow.map((item) => (
          <div
            key={item.id}
            onClick={() =>
              handleSelect({ title: item.title, thumbnail: item.thumbnail })
            }
            className="cursor-pointer"
          >
            <VideoCard
              video={item}
              isSelected={isVideoSelected(item.thumbnail)}
            />
          </div>
        ))}
      </div>

      {/* 🔹 Shorts 區塊 */}
      <ShortsSection variant="horizontal" shorts={shorts} />

      {/* 🔹 剩下的影片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {remaining.map((item) => (
          <div
            key={item.id}
            onClick={() =>
              handleSelect({ title: item.title, thumbnail: item.thumbnail })
            }
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
