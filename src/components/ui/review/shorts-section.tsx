"use client";
import React from "react";
import { MoreVertical } from "lucide-react";
import { YoutubeVideo } from "@/lib/schema/youtube-video-schema";

interface ShortsSectionProps {
  variant?: "mobile" | "horizontal";
  shorts: YoutubeVideo[]; // ✅ 強制外部傳入
}

export default function ShortsSection({
  variant = "mobile",
  shorts,
}: ShortsSectionProps) {
  return (
    <div className="bg-black text-white px-2 py-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-red-500 font-bold">▶</span>
        <p className="font-semibold">Shorts</p>
      </div>

      {variant === "mobile" ? (
        <div className="grid grid-cols-2 gap-2">
          {shorts.slice(0, 4).map((short) => (
            <ShortCard key={short.id} short={short} />
          ))}
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {shorts.map((short) => (
            <div key={short.id} className="min-w-[160px] aspect-[9/16]">
              <ShortCard short={short} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ShortCard({ short }: { short: YoutubeVideo }) {
  return (
    <div className="relative flex flex-col bg-zinc-900 rounded-md overflow-hidden aspect-[9/16] w-full">
      <img
        src={short.thumbnail}
        alt={short.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute top-1 left-1 text-xs bg-gray-500 rounded px-1">
        New
      </div>
      <div className="absolute top-1 right-1">
        <MoreVertical className="w-4 h-4 text-white" />
      </div>
      <div className="absolute bottom-1 left-1 text-xs font-normal px-1 rounded text-shadow">
        {short.title}
      </div>
    </div>
  );
}
