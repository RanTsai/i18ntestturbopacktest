//aspectBarList.tsx
"use client";

import React from "react";

interface AspectBarListProps {
  aspects: {
    label: string;
    value: number;
  }[];
}

const colors = [
  "bg-green-400", // Visual
  "bg-blue-400",  // Clarity
  "bg-yellow-400", // Relevance
  "bg-purple-400", // Click-Through
  "bg-red-400",    // Branding
];

export default function AspectBarList({ aspects }: AspectBarListProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-white">Aspect Ratings:</h4>
      {aspects.map((aspect, idx) => (
        <div key={idx} className="text-sm text-white">
          <div className="flex justify-between">
            <span>{aspect.label}</span>
            <span>{aspect.value.toFixed(1)}</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded">
            <div
              className={`${colors[idx]} h-2 rounded`}
              style={{ width: `${(aspect.value / 5) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}