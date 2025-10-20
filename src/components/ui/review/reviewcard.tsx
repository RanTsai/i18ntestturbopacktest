// components/review/reviewcard.tsx
"use client";
import { StarRating } from "./starrating";
import ReactMarkdown from "react-markdown";
import AspectBarList from "./aspectbarlist";
import { Button } from "../button";
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
//import Link from "next/link";
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
  score,
  aspects,
  aiMarkdown,
}: ReviewCardProps) {

  console.log("ai markdown:", aiMarkdown);
  return (
    <div className="bg-[#0d0d0d] rounded-lg p-6 shadow-md space-y-4 w-full">

      {/* ⭐ Rating */}
      <div className="flex items-center justify-between">
        <StarRating score={score} />
      </div>

      {/* 📊 Dynamic Aspect Scores */}
      <AspectBarList aspects={aspects} />

      {/* 💬 AI Feedback */}
     <div>         
        <ReactMarkdown
  components={{
    h3: ({...props}) => (
      <h3 className="mt-4 mb-1 text-yellow-400 font-semibold text-base">
        {props.children}
      </h3>
    ),
    p: ({...props}) => (
      <p className="text-gray-300 leading-relaxed mb-3">
        {props.children}
      </p>
    ),
    strong: ({...props}) => (
      <strong className="text-yellow-300 font-semibold">{props.children}</strong>
    ),
  }}
>
  {aiMarkdown}
</ReactMarkdown>
      </div>

      {/* 🧠 Chat Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex justify-center">
            <Button
              variant="default"
              size="sm"
              disabled
              className="bg-blue-500 text-white opacity-70 cursor-not-allowed flex items-center gap-1"
            >
              Chat With AI
              <span className="text-xs text-gray-300">(Coming Soon)</span>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm">
          Chat with AI to Analyse improvement (Coming Soon)
        </TooltipContent>
      </Tooltip>

    </div>
  );
}