// components/review/reviewcard.tsx
"use client";

import Image from "next/image";
import { StarRating } from "./starrating";
import RadarChart from "./radarchart";
import MarkDown from "react-markdown";
import AspectBarList from "./aspectbarlist";
import { Button } from "../button";
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import Link from "next/link";

interface ReviewCardProps {
  thumbnailUrl: string;
  title: string;
  score: number; // e.g., 4.3
  aspects: number[]; // [Visual, Clarity, Relevance, CTR, Branding]
  aiMarkdown: string;
}

export default function ReviewCard({
  thumbnailUrl,
  title,
  score,
  aspects,
  aiMarkdown,
}: ReviewCardProps) {
  return (
    <div className="bg-[#0d0d0d] rounded-lg p-6 shadow-md space-y-4 w-full">
       {/* Title */}
      <input
        type="text"
        value={title}
        readOnly
        className="w-full p-2 text-white bg-black border border-gray-700 rounded"
      />

      {/* Star Rating & View link */}
      <div className="flex items-center justify-between">
        <StarRating score={score} />
        <button className="text-sm text-indigo-400 hover:underline">
          View Detailed Ratings
        </button>
      </div>

      {/* Radar Chart */}
      <RadarChart data={aspects} />

      {/* Aspect Bar List */}
      <AspectBarList
        aspects={[
          { label: "Visual", value: aspects[0] },
          { label: "Clarity", value: aspects[1] },
          { label: "Relevance", value: aspects[2] },
          { label: "CTR", value: aspects[3] },
          { label: "Branding", value: aspects[4] },
        ]}
      />

      {/* AI Feedback */}
      <div className="text-sm text-gray-300 leading-6">
        <MarkDown>{aiMarkdown}</MarkDown>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/aichat" className="flex justify-center">

          {/* <div className="flex justify-between bg-secondary p-2 rounded cursor-pointer hover:bg-accent transition-all"> */}
          {/* <Button variant="default" size="sm" className="outline cursor-pointer transition-colors bg-blue-500 hover:bg-blue-800 hover:text-black">Chat With AI</Button> */}
          {/*   </div> */}
          </Link>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm">
          Chat with AI to Analyse improvement
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
