// components/ImageFeedbackDisplay.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ImageAnnotation = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  suggestion?: string;
  severity?: "low" | "medium" | "high";
};

export type ImageFeedback = {
  imageUrl: string;
  width: number; // image display width in px
  height: number; // image display height in px
  annotations: ImageAnnotation[];
};

export default function ImageFeedbackDisplay({
  imageUrl,
  width,
  height,
  annotations,
}: ImageFeedback) {
  const [activeAnnotation, setActiveAnnotation] = useState<ImageAnnotation | null>(null);

  return (
    <TooltipProvider>
      <div
        className="relative rounded overflow-hidden"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <Image
          src={imageUrl}
          alt="AI Feedback Thumbnail"
          width={width}
          height={height}
          className="rounded object-cover"
        />

        {annotations.map((a) => (
          <Tooltip key={a.id}>
            <TooltipTrigger asChild>
              <div
                className={`absolute rounded border-2 cursor-pointer transition-all duration-200
                  ${a.severity === "high" ? "border-red-500" :
                    a.severity === "medium" ? "border-yellow-400" : "border-blue-400"}`}
                style={{
                  top: a.y,
                  left: a.x,
                  width: a.width,
                  height: a.height,
                }}
                onClick={() => setActiveAnnotation(a)}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm font-semibold">{a.label}</p>
              {a.suggestion && <p className="text-xs text-muted-foreground">{a.suggestion}</p>}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Dialog for Annotation Detail */}
        {activeAnnotation && (
          <Dialog open={!!activeAnnotation} onOpenChange={() => setActiveAnnotation(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{activeAnnotation.label}</DialogTitle>
                <DialogDescription>{activeAnnotation.suggestion}</DialogDescription>
              </DialogHeader>
              <div className="mt-4 text-sm">
                <p><strong>Severity:</strong> {activeAnnotation.severity}</p>
                <p><strong>Area:</strong> {`x: ${activeAnnotation.x}, y: ${activeAnnotation.y}, width: ${activeAnnotation.width}, height: ${activeAnnotation.height}`}</p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
}