"use client";

import React from "react";
import {
  Bell,
  Cast,
  Search,
  Home,
  Play,
  PlusCircle,
  Users,
  Library,
} from "lucide-react";
import { ArrowRight } from "lucide-react"; // ✅ ExternalLink
import Link from "next/link";
import VideoCard from "@/components/ui/review/video-card";
import ShortsSection from "@/components/ui/review/shorts-section";
import useVideoSelectionStore from "@/lib/global-store/video-selection-store";
import { YoutubeVideo } from "@/lib/schema/youtube-video-schema";
import YoutubeHomeHowToUse from "../how-to-use-dialogue/youtubehome-how-to-use";

interface Props {
  videos: YoutubeVideo[];
  shorts: YoutubeVideo[];
}

export default function YouTubeMobile({ videos, shorts }: Props) {
  const { selectedVideos, addVideo, removeVideo } = useVideoSelectionStore();

  const beforeShorts = videos.slice(0, 4);
  const afterShorts = videos.slice(4);
  const [helpOpen, setHelpOpen] = React.useState(false); // ✅ 新增：控制說明 Dialog 的開關
   const [hasSeenCta, setHasSeenCta] = React.useState(true);
  React.useEffect(() => {
    try {
      const seen = localStorage.getItem("howtoMobileCtaSeen") === "1";
      setHasSeenCta(seen);
    } catch {}
  }, []);
  const markSeen = () => {
    try { localStorage.setItem("howtoMobileCtaSeen", "1"); } catch {}
    setHasSeenCta(true);
  };


  // ✅ 判斷是否選取
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
      <main className="max-w-3xl mx-auto px-6 py-16 text-foreground">

      {/* Header */}
      <section className="text-center space-y-4">            

        {/* ✅ 新增：主 CTA（首次脈衝）—— 連到實際 Live Preview 工具 */}
        <div className="mt-3">
          <Link
            href="/new/youtube-preview"
            target="_blank"
            rel="noopener noreferrer"
            onClick={markSeen}
            className={[
              "inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition",
              hasSeenCta
                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                : "bg-yellow-500 text-black hover:bg-yellow-400 animate-pulse shadow-[0_0_14px_rgba(234,179,8,0.35)]"
            ].join(" ")}
          >
            How to use?
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    <div className="w-full flex justify-center py-4">
  
</div>
    <div className="bg-background text-foreground flex justify-center">
      <div className="relative w-full max-w-xs h-[660px] flex flex-col border-4 border-border overflow-hidden overflow-y-auto rounded-4xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* 🔺 Topbar */}
        <div className="flex justify-between items-center px-4 py-2 border-b border-border">
          <div className="text-xl font-semibold text-red-500">Premium</div>
          <div className="flex space-x-3 items-center text-foreground">
            <Cast className="w-5 h-5" />
            <div className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-[0.6rem] px-[0.15rem] rounded-full text-background">
                9+
              </span>
            </div>
            <Search className="w-5 h-5" />
          </div>
        </div>

        {/* 🔺 Filter tags */}
        <div className="flex px-2 py-2 space-x-2 border-b border-border">
          <span className="bg-foreground text-background px-3 py-1 rounded-full text-xs font-semibold">
            All
          </span>
          <span className="bg-muted px-3 py-1 rounded-full text-xs">Gaming</span>
          <span className="bg-muted px-3 py-1 rounded-full text-xs whitespace-nowrap">
            Movie
          </span>
          <span className="bg-muted px-3 py-1 rounded-full text-xs whitespace-nowrap">
            Music
          </span>
          <span className="bg-muted px-3 py-1 rounded-full text-xs whitespace-nowrap">
            Shorts
          </span>
        </div>

        {/* 🔺 Video List */}
        <div className="flex-1 p-2 space-y-4">
          {beforeShorts.map((video) => (
            <div
              key={video.id}
              onClick={() =>
                handleSelect({ title: video.title, thumbnail: video.thumbnail })
              }
              className="cursor-pointer"
            >
              <VideoCard
                video={video}
                isSelected={isVideoSelected(video.thumbnail)}
              />
            </div>
          ))}

          <ShortsSection variant="mobile" shorts={shorts} />

          {afterShorts.map((video) => (
            <div
              key={video.id}
              onClick={() =>
                handleSelect({ title: video.title, thumbnail: video.thumbnail })
              }
              className="cursor-pointer"
            >
              <VideoCard
                video={video}
                isSelected={isVideoSelected(video.thumbnail)}
              />
            </div>
          ))}

          {videos.length === 0 && (
            <p className="text-center text-muted-foreground mt-10">
              No videos found.
            </p>
          )}
        </div>

        {/* 🔺 Bottom Navigation */}
        <div className="flex justify-around py-2 border-t border-border bg-background text-muted-foreground">
          <div className="flex flex-col items-center text-[0.4rem]">
            <Home className="w-5 h-5" />
            Home
          </div>
          <div className="flex flex-col items-center text-[0.4rem]">
            <Play className="w-5 h-5" />
            Shorts
          </div>
          <div className="flex flex-col items-center text-[0.4rem]">
            <PlusCircle className="w-8 h-8" />
          </div>
          <div className="flex flex-col items-center text-[0.4rem]">
            <Users className="w-5 h-5" />
            Subscriptions
          </div>
          <div className="flex flex-col items-center text-[0.4rem]">
            <Library className="w-5 h-5" />
            Library
          </div>
        </div>
      </div>
        <YoutubeHomeHowToUse
              helpOpen={helpOpen}
              setHelpOpen={setHelpOpen}
            />
    </div>
    
   </main>

  );
}
