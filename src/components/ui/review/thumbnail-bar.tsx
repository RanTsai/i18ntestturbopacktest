"use client";
import React, { useState } from "react";
import ThumbnailCard from "./thumbnail-card";

const mockData = [
  { id: "t1", imageUrl: "/thumbnail1.png", version: "V1" },
  { id: "t2", imageUrl: "/thumbnail2.png", version: "V2" },
  { id: "t3", imageUrl: "/thumbnail3.png", version: "V3" },
];

export default function ThumbnailGallery() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      selected ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDownload = (id: string) => {
    console.log("下載", id);
  };

  const handleReview = (id: string) => {
    console.log("進入 Review 模式", id);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {mockData.map((thumb) => (
        <ThumbnailCard
          key={thumb.id}
          id={thumb.id}
          imageUrl={thumb.imageUrl}
          versionLabel={thumb.imageUrl}
          isSelected={selectedIds.has(thumb.id)}
          isFavorite={favorites.has(thumb.id)}
          onSelect={handleSelect}
          onToggleFavorite={handleToggleFavorite}
          onDownload={handleDownload}
          onReview={handleReview}
        />
      ))}
    </div>
  );
}
