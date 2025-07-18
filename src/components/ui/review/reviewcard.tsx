// components/review/reviewcard.tsx
"use client";


import { StarRating } from "./starrating";
import { useCallback, useState } from "react";

import MarkDown from "react-markdown";
import AspectBarList from "./aspectbarlist";
import { Button } from "../button";
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import Link from "next/link";
import { IAspectScore } from "@/lib/schema/aiscore-schema"; // 假設你有定義這個類型
interface ReviewCardProps {
  thumbnailUrl: string;
  title: string;
  score: number;
  aspects: IAspectScore[]; // ← 支援動態
  aiMarkdown: string;
  onImageReplace?: (file: File, previewUrl: string) => void;
}

export default function ReviewCard({
  thumbnailUrl,
  title,
  score,
  aspects,
  aiMarkdown,
  onImageReplace,
}: ReviewCardProps) {
 
  return (
    <div className="bg-[#0d0d0d] rounded-lg p-6 shadow-md space-y-4 w-full">
      
      {/* ⭐ Rating */}
      <div className="flex items-center justify-between">
        <StarRating score={score} />
      </div>

      {/* 📊 Dynamic Aspect Scores */}
      <AspectBarList aspects={aspects} />

      {/* 💬 AI Feedback */}
      <div className="text-sm text-gray-300 leading-6">
        <MarkDown>{aiMarkdown}</MarkDown>
      </div>

      {/* 🧠 Chat Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/aichat" className="flex justify-center">
            <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-800 hover:text-black">
              Chat With AI
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm">
          Chat with AI to Analyse improvement
        </TooltipContent>
      </Tooltip>
    </div>
  );
}