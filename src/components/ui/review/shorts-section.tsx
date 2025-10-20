"use client";
import React from "react";
import { MoreVertical } from "lucide-react";
import { YoutubeVideo } from "@/lib/schema/youtube-video-schema";
import Image from "next/image";

interface ShortsSectionProps {
  variant?: "mobile" | "horizontal"; // ← 改名，避免誤會 "horizontal" 是橫向滾動
  shorts: YoutubeVideo[];
}

export default function ShortsSection({
  variant = "horizontal",
  shorts,
}: ShortsSectionProps) {
  return (
    <div className="text-white px-[clamp(6px,1.4vw,16px)] py-[clamp(6px,1.2vw,12px)] rounded-lg">
      <div className="flex items-center gap-2 mb-[clamp(6px,1.2vw,12px)]">
        <span className="text-red-500 font-bold">▶</span>
        <p className="font-semibold">Shorts</p>
      </div>

      {variant === "mobile" ? (
        <div className="grid grid-cols-2 gap-[clamp(6px,1.2vw,12px)]">
          {shorts.slice(0, 4).map((s) => (
            <ShortCard key={s.id} short={s} />
          ))}
        </div>
      ) : (
        // ✅ 固定 6 欄，不捲動；隨外層舞台縮放但排版不變
        <div className="grid grid-cols-6 gap-[clamp(8px,1.2vw,16px)]">
          {/* 若不足 6 個，slice 會顯示有的，版型仍然固定 */}
          {shorts.slice(0, 6).map((s) => (
            <ShortCard key={s.id} short={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function ShortCard({ short }: { short: YoutubeVideo }) {
  return (
    <div className="group flex flex-col w-full">
      {/* 縮圖：9:16 裁切 */}
      <div className="relative aspect-[9/16] w-full rounded-md overflow-hidden bg-zinc-900">
        <Image
          src={short.thumbnailhigh || short.thumbnail}
          alt={short.title}
          fill
          className="object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-105"
          sizes="(max-width: 1800px) 12vw, 220px"
          priority={false}
        />
        <div className="absolute top-1 left-1 text-[10px] bg-gray-500/80 rounded px-1">
          New
        </div>
        <div className="absolute top-1 right-1">
          <MoreVertical className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* 標題 + Views（縮圖下方） */}
      <div className="mt-2 px-1">
        <p className="text-sm font-medium line-clamp-2">{short.title}</p>
        <p className="text-xs text-muted-foreground">{short.views}</p>
      </div>
    </div>
  );
}
