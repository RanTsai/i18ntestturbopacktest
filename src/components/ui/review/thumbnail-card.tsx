"use client";
import React, { useState } from "react";
import { Star, Download, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";


export interface ThumbnailCardProps {
  id: string;
  imageUrl: string;
  versionLabel: string;
  isSelected: boolean;
  isFavorite: boolean;
  highlightType?: "user" | "ai" | null;
  onSelect: (id: string, selected: boolean) => void;
  onToggleFavorite: (id: string) => void;
  onDownload: (id: string) => void;
  onReview: (id: string) => void;
}

const ThumbnailCard: React.FC<ThumbnailCardProps> = ({
  id,
  imageUrl,
  versionLabel,
  isSelected,
  isFavorite,
  highlightType = null,
  onSelect,
  onToggleFavorite,
  onDownload,
  onReview,
}) => {
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [hoverTopRight, setHoverTopRight] = useState(false);
  const [hoverBottomLeft, setHoverBottomLeft] = useState(false);
  const [hoverBottomRight, setHoverBottomRight] = useState(false);

  const borderClass = isSelected
    ? "border-purple-500"
    : highlightType === "ai"
      ? "border-yellow-500"
      : "border-gray-300";

  return (
    <div
      className={`relative w-full h-full rounded overflow-hidden border-2 cursor-pointer ${borderClass}`}
      onMouseEnter={() => setIsHoveringCard(true)}
      onMouseLeave={() => setIsHoveringCard(false)}
      onClick={() => onSelect(id, !isSelected)} // 整張圖片選擇
    >
      {/* 圖片本體 */}
      <Image
        src={imageUrl}
        alt={`Thumbnail ${id}`}
        fill   // 取代 w-full h-full
        className={`object-cover transition duration-300 ${isHoveringCard ? "blur-sm brightness-75" : ""
          }`}
      />

      {/* 提示標籤：用戶選擇 / AI選擇 */}
      {isSelected && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-purple-700 bg-opacity-80 text-white text-xs px-3 py-1 rounded z-10 pointer-events-none">
          You are referring to this
        </div>
      )}
      {highlightType === "ai" && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-yellow-500 bg-opacity-80 text-black text-xs px-3 py-1 rounded z-10 pointer-events-none">
          AI is referring to this
        </div>
      )}

      {/* 左上角版本號 */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
        V{versionLabel}
      </div>

      {/* 右上角選擇框 */}
      <div
        className="absolute top-2 right-2 w-6 h-6"
        onMouseEnter={() => setHoverTopRight(true)}
        onMouseLeave={() => setHoverTopRight(false)}
      >
        {hoverTopRight && (
          <button
            className="bg-white rounded p-1"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(id, !isSelected);
            }}
          >
            {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
          </button>
        )}
      </div>

      {/* 左下角下載 */}
      <div
        className="absolute bottom-2 left-2 w-6 h-6"
        onMouseEnter={() => setHoverBottomLeft(true)}
        onMouseLeave={() => setHoverBottomLeft(false)}
      >
        {hoverBottomLeft && (
          <button
            className="bg-white rounded-full p-1"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(id);
            }}
          >
            <Download size={16} />
          </button>
        )}
      </div>

      {/* 右下角收藏 */}
      <div
        className="absolute bottom-2 right-2 w-6 h-6"
        onMouseEnter={() => setHoverBottomRight(true)}
        onMouseLeave={() => setHoverBottomRight(false)}
      >
        {hoverBottomRight && (
          <button
            className="bg-white rounded-full p-1 text-yellow-400"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(id);
            }}
          >
            <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      {/* Hover時 Review 按鈕（圖片中下方） */}
      {isHoveringCard && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <Button
            size="sm"
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              onReview(id);
            }}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Review
          </Button>
        </div>
      )}
    </div>
  );
};

export default ThumbnailCard;
