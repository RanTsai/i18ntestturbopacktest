//application/youtube-home-mock.tsx
"use client";
import React from "react";
import { YoutubeVideo } from "@/lib/schema/youtube-video-schema";
import VideoCard from "@/components/ui/review/video-card";


export default function YouTubeHomeMock() {
    const [videos, setVideos] = React.useState<YoutubeVideo[]>([]);

    // 🔹 一進入頁面就從後端 API 拉資料
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/youtube?q=trending");
                if (!res.ok) throw new Error("Failed to fetch videos");
                const data = await res.json();

                // 這裡假設 API 回傳的資料是陣列，每筆有 title / thumbnail
                const mappedVideos: YoutubeVideo[] = data.map((item: any, idx: number) => ({
                    id: item.id || String(idx),
                    title: item.title,
                    thumbnail: item.thumbnail,
                    channelLogo: item.channelLogo,
                    channelName: item.channelName,
                    views: item.views,
                    uploadedAt: item.uploadedAt,
                    length: item.length
                }));

                setVideos(mappedVideos);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    return (
    <div className="bg-black min-h-screen text-white p-4">
      <h1 className="text-2xl font-bold mb-4">YouTube Home</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((item) => (
          <VideoCard key={item.id} video={item} />
        ))}
      </div>

      {videos.length === 0 && (
        <p className="text-center text-gray-500 mt-10">Loading videos...</p>
      )}
    </div>
  );
}