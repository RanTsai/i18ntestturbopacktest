"use client";
import React from "react";
import { Bell, Cast, Search, Home, Play, PlusCircle, Users, MoreVertical, Library } from "lucide-react";
import { YoutubeVideo } from "@/lib/schema/youtube-video-schema";
import VideoCard from "@/components/ui/review/video-card";
import ShortsSection from "@/components/ui/review/shorts-section";



export default function MobileYouTubeHomeMock() {
  const [videos, setVideos] = React.useState<YoutubeVideo[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/youtube?q=trending");
        if (!res.ok) throw new Error("Failed to fetch videos");
        const data = await res.json();

        const mappedVideos: YoutubeVideo[] = data.map((item: any, idx: number) => ({
          id: item.id || String(idx),
          title: item.title,
          thumbnail: item.thumbnail,
          channelLogo: item.channelLogo,
          channelName: item.channelName,
          views: item.views,
          uploadedAt: item.uploadedAt,
          length: item.length,
        }));

        setVideos(mappedVideos);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // 拆分影片
  const beforeShorts = videos.slice(0, 4);
  const afterShorts = videos.slice(4);

  return (
    <div className="bg-black text-white flex justify-center">
      <div className="relative w-full max-w-xs h-[660px] flex flex-col border-x border-gray-700 overflow-hidden overflow-y-auto rounded-4xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Topbar */}
        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
          <div className="text-xl font-semibold text-red-500">Premium</div>
          <div className="flex space-x-3 items-center">
            <Cast className="w-5 h-5" />
            <div className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-[0.6rem] px-[0.15rem] rounded-full">9+</span>
            </div>
            <Search className="w-5 h-5" />
          </div>
        </div>

        {/* Filter tags */}
        <div className="flex px-2 py-2 space-x-2 border-b border-gray-700">
          <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-semibold">All</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full text-xs">Gaming</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full text-xs whitespace-nowrap">Movie</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full text-xs whitespace-nowrap">Music</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full text-xs whitespace-nowrap">Shorts</span>
        </div>

        {/* 影片列表 */}
        <div className="flex-1 p-2 space-y-4">
          {beforeShorts.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
          <ShortsSection />
          {afterShorts.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-around py-2 border-t border-gray-700 bg-black">
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
    </div>
  );
}
