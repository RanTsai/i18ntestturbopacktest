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

export default function TabletYouTubeHome({ videos,shorts }: Props) {
  const { selectedVideos, addVideo, removeVideo } = useVideoSelectionStore();

  const mainVideo = videos[0];
  const recommended = videos.slice(1, 13); // 顯示 12 個推薦影片
  const hasShorts = videos.length > 7;

  // ✅ 判斷是否已選取
  const isVideoSelected = (thumbnail: string) =>
    selectedVideos.some((v) => v.thumbnail === thumbnail);

  // ✅ 處理選取邏輯
  const handleSelect = (video: { title: string; thumbnail: string }) => {
    if (isVideoSelected(video.thumbnail)) {
      removeVideo(video.thumbnail);
    } else {
      addVideo(video);
    }
  };

  return (
    <div className="bg-background text-foreground p-4 space-y-6">
      {/* Main Area: 大影片 + 右側推薦清單 */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 左：主影片區塊 */}
        <div className="flex-1 min-w-0">
          {mainVideo ? (
            <div
              className="w-full aspect-video bg-muted rounded-lg overflow-hidden shadow-md cursor-pointer"
              onClick={() =>
                handleSelect({
                  title: mainVideo.title,
                  thumbnail: mainVideo.thumbnail,
                })
              }
            >
              <VideoCard
                video={mainVideo}
                isSelected={isVideoSelected(mainVideo.thumbnail)}
              />
            </div>
          ) : (
            <div className="w-full aspect-video bg-muted rounded-lg animate-pulse" />
          )}
          <h2 className="text-lg font-semibold mt-2">{mainVideo?.title}</h2>
          <p className="text-sm text-muted-foreground">
            {mainVideo?.channelName} • {mainVideo?.views}
          </p>
        </div>

        {/* 右：推薦影片清單 */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3">
          {hasShorts && (
            <ShortsSection variant="horizontal" shorts={shorts} />
          )}
          {recommended.map((video) => (
            <div
              key={video.id}
              onClick={() =>
                handleSelect({
                  title: video.title,
                  thumbnail: video.thumbnail,
                })
              }
              className="cursor-pointer"
            >
              <VideoCard
                video={video}
                variant="horizontal"
                isSelected={isVideoSelected(video.thumbnail)}
              />
            </div>
          ))}
        </div>
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
