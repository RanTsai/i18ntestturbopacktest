//application/youtube-home-mock.tsx
"use client";
import React from "react";
import { Video } from "@/lib/schema/video";


export default function YouTubeHomeMock() {
    const [videos, setVideos] = React.useState<Video[]>([]);

    // 🔹 一進入頁面就從後端 API 拉資料
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/youtube?q=trending");
                if (!res.ok) throw new Error("Failed to fetch videos");
                const data = await res.json();

                // 這裡假設 API 回傳的資料是陣列，每筆有 title / thumbnail
                const mappedVideos: Video[] = data.map((item: any, idx: number) => ({
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
                    <div
                        key={item.id}
                        className="flex flex-col gap-2 cursor-pointer group"
                    >
                        {/* Thumbnail */}
                        <div className="relative rounded overflow-hidden group aspect-video">
                            <img
                                src={item.thumbnail}
                                alt="Video Thumbnail"
                                className="w-full max-h-40 object-cover rounded transform transition-transform duration-300 ease-in-out group-hover:scale-105"
                            />
                            <span className="absolute bottom-1 right-1 bg-black/70 text-xs px-1 rounded">
                                {item.length}
                            </span>
                        </div>

                        {/* Channel Info */}
                        <div className="flex gap-2 items-start">
                            <img
                                src={item.channelLogo}
                                alt="Channel Logo"
                                className="w-9 h-9 rounded-full object-cover"
                            />
                            <div className="flex flex-col">
                                <p className="text-sm font-semibold line-clamp-2">
                                    {item.title}
                                </p>
                                <p className="text-xs text-gray-400">{item.channelName}</p>
                                <p className="text-xs text-gray-400">
                                    {item.views} • {item.uploadedAt}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {videos.length === 0 && (
                <p className="text-center text-gray-500 mt-10">Loading videos...</p>
            )}
        </div>
    );
}
