"use client";

import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AspectScore {
  label: string;
  value: number;
  color?: string; // 可選：自定義顏色
  tooltip?: string; // 可選：顯示提示文字
}

interface AspectBarListProps {
  aspects: AspectScore[];
}

// 預設 fallback 顏色陣列（可按順序覆蓋）
const fallbackColors = [
  "bg-green-400",
  "bg-blue-400",
  "bg-yellow-400",
  "bg-purple-400",
  "bg-red-400",
];

export default function AspectBarList({ aspects }: AspectBarListProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-white">Aspect Ratings:</h4>
      {aspects.map((aspect, idx) => {
        const barWidth = `${(aspect.value / 5) * 100}%`;
        const barColor = aspect.color
          ? aspect.color
          : fallbackColors[idx % fallbackColors.length];

        return (
          <div key={idx} className="text-sm text-white space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{aspect.label}</span>
                {aspect.tooltip && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-gray-400 cursor-help">🛈</span>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs max-w-xs">
                      {aspect.tooltip}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <span>{aspect.value.toFixed(1)}</span>
            </div>

            <div className="w-full h-2 bg-gray-800 rounded overflow-hidden">
              <div
                className={`h-2 rounded ${!aspect.color ? barColor : ""}`}
                style={{ width: barWidth, backgroundColor: aspect.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
