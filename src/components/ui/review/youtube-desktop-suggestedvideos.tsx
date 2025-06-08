// components/SuggestedVideos.tsx
"use client";
import React from "react";

interface SuggestedVideo {
  id: string;
  thumbnail: string;
  title: string;
  channel: string;
  views: string;
  uploadDate: string;
}

export default function SuggestedVideos() {
  // 先用假資料
  const dummyVideos: SuggestedVideo[] = new Array(10).fill(null).map((_, idx) => ({
    id: String(idx),
    thumbnail: `/thumbnail.png?sig=${idx}`,
    title: `Suggested Video ${idx + 1} - Must Watch!`,
    channel: `Channel ${idx + 1}`,
    views: `${(Math.random() * 100).toFixed(1)}K views`,
    uploadDate: `${Math.floor(Math.random() * 10) + 1} days ago`,
  }));

  return (
    <div className="flex flex-col gap-3 p-2 bg-black text-white w-[320px]">
      {dummyVideos.map((video) => (
        <div key={video.id} className="flex gap-2 cursor-pointer">
          <div className="w-40 h-24 bg-gray-800 rounded overflow-hidden">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover rounded"
            />
          </div>
          <div className="flex flex-col flex-1">
            <p className="text-xs font-semibold line-clamp-2">{video.title}</p>
            <p className="text-xs text-gray-400">{video.channel}</p>
            <p className="text-xs text-gray-400">
              {video.views} • {video.uploadDate}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
