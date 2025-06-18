// components/ui/image/image-annotation-layer.tsx
"use client";

import React from "react";

interface Annotation {
  id: string;
  type: "box" | "arrow" | "highlight";
  x: number;
  y: number;
  width: number;
  height: number;
  message: string;
}

interface Props {
  annotations: Annotation[];
}

export default function ImageAnnotationLayer({ annotations }: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {annotations.map((a) => (
        <div
          key={a.id}
          className="absolute border-2 border-red-500 rounded-sm bg-red-500/10"
          style={{
            left: `${a.x * 100}%`,
            top: `${a.y * 100}%`,
            width: `${a.width * 100}%`,
            height: `${a.height * 100}%`,
          }}
        >
          <div
            className="absolute left-0 top-full mt-1 px-2 py-1 bg-black text-white text-xs rounded shadow-lg pointer-events-auto"
            style={{ whiteSpace: "nowrap" }}
          >
            {a.message}
          </div>
        </div>
      ))}
    </div>
  );
}