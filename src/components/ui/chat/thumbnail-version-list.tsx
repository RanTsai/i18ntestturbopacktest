// components/ui/chat/thumbnail-version-list.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import ThumbnailCard from "../review/thumbnail-card";
import ReviewCard from "../review/reviewcard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog"; // shadcn dialog


export interface ThumbnailVersion {
  id: string;
  versionLabel: string;
  title: string;
  date: string;
  rating: number;
  description: string;
  imageUrl: string;
  linkedMessageId?: string;
}

interface Props {
  versions: ThumbnailVersion[];
  onSelect?: (version: ThumbnailVersion) => void;
  selectedId?: string;
}

export default function ThumbnailVersionList({ versions, onSelect, selectedId }: Props) {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [reviewDialogOpen, setReviewDialogOpen] = React.useState(false);
    const [reviewData, setReviewData] = React.useState<{
      thumbnailUrl: string;
      title: string;
      score: number;
      aspects: number[];
      aiMarkdown: string;
    } | null>(null);

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDownload = (id: string) => {
    const version = versions.find((v) => v.id === id);
    if (!version) return;
    const link = document.createElement("a");
    link.href = version.imageUrl;
    link.download = `${version.versionLabel}.png`;
    link.click();
  };

  const handleReview = (id: string) => {
    const version = versions.find((v) => v.id === id);
    if (version) {
      setReviewData({
      thumbnailUrl: version.imageUrl,
      title: version.title ?? `Thumbnail ${id}`,
      score: 4.2,
      aspects: [4.1, 3.8, 4.5, 3.9, 4.0],
      aiMarkdown: "AI thinks this thumbnail could be more eye-catching.",
    });

    setReviewDialogOpen(true);
    }
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {versions.map((version) => (
        <div
          key={version.id}
          className={`border rounded-lg shadow-md bg-muted text-white hover:border-primary transition cursor-pointer ${
            selectedId === version.id ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => onSelect?.(version)}
        >
          {/* 修正：使用 aspect-ratio 保持圖片比例 */}
          <div className="relative w-full aspect-[16/9]">
            <ThumbnailCard
              key={version.id}
              id={version.id}
              imageUrl={version.imageUrl}
              versionLabel={version.versionLabel}
              isSelected={selectedId === version.id}
              isFavorite={favorites[version.id] || false}
              highlightType={null}
              onSelect={(id, selected) => {
                if (selected) {
                  onSelect?.(version);
                } else {
                  onSelect?.({ ...version, id: "" }); // 取消選擇
                }
              }}
              onToggleFavorite={handleToggleFavorite}
              onDownload={handleDownload}
              onReview={handleReview}
            />
          </div>

          {/* 下方文字與評分區塊 */}
          <div className="p-3 space-y-1">
            <div className="text-sm font-semibold truncate">
              {version.title}
            </div>
            <div className="text-xs text-gray-400">{version.date}</div>
            <div className="text-xs text-gray-300 line-clamp-2">
              {version.description}
            </div>
            <div className="flex gap-1 pt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < version.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-600"
                  }
                />
              ))}
            </div>
          </div>
        </div>
      ))}

       <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
              <DialogContent className="max-w-3xl bg-black border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-white text-lg">Thumbnail Review</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    AI-generated feedback on the selected thumbnail
                  </DialogDescription>
                </DialogHeader>
      
                {reviewData && (
                  <ReviewCard
                    thumbnailUrl={reviewData.thumbnailUrl}
                    title={reviewData.title}
                    score={reviewData.score}
                    aspects={reviewData.aspects}
                    aiMarkdown={reviewData.aiMarkdown}
                  />
                )}
              </DialogContent>
            </Dialog>
            
    </div>
  );
}