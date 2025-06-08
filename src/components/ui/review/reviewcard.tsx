// components/review/reviewcard.tsx
"use client";

import Image from "next/image";
import { StarRating } from "./starrating";
import RadarChart from "./radarchart";
import MarkDown from "react-markdown";
import AspectBarList from "./aspectbarlist";


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
      {/* Image */}
      {/* <div className="w-full">
        <Image
          src={thumbnailUrl}
          width={600}
          height={400}
          alt="Thumbnail"
          className="rounded-md w-full h-auto"
        />
      </div> */}

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
    </div>
  );
}
