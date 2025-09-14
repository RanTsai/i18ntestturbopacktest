// components/ui/chat/AttachmentsBar.tsx
"use client";

import React from "react";
import { X, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

export type AttachmentItem = {
  id: string;              // 本地臨時 id
  name: string;
  size?: number;
  type?: string;           // mime
  previewUrl?: string;     // 本地 objectURL 或已上傳 URL
  progress?: number;       // 0–100
  status?: "uploading" | "done" | "error";
};

export default function AttachmentsBar({
  items,
  onRemove,
  className,
  max = 6,
  thumbSize = 120, // 縮圖尺寸（px）
  showProgress = true,
}: {
  items: AttachmentItem[];
  onRemove?: (id: string) => void;
  className?: string;
  max?: number;
  thumbSize?: number;
  showProgress?: boolean;
}) {
  if (!items?.length) return null;

  return (
    <div
      className={clsx(
        "mb-2 rounded-lg border border-border bg-secondary px-3 py-2",
        "flex items-center gap-3 overflow-x-auto",
        className
      )}
      role="region"
      aria-label="Attachments"
    >
      <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
        {items.length}/{max}
      </div>

      <div className="flex items-center gap-3">
        {items.map((it) => {
          const p = Math.min(100, Math.max(0, it.progress ?? 0));
          const isUploading = it.status === "uploading";
          const isDone = it.status === "done";
          const isError = it.status === "error";

          return (
            <div
              key={it.id}
              className={clsx(
                "relative rounded-lg overflow-hidden border border-border shrink-0 group",
                "bg-muted"
              )}
              style={{ width: thumbSize, height: thumbSize }}
              title={it.name}
            >
              {/* 縮圖 */}
              {it.previewUrl ? (
                <img
                  src={it.previewUrl}
                  alt={it.name}
                  className={clsx(
                    "w-full h-full object-cover pointer-events-none select-none",
                    isUploading && "opacity-90",
                    isError && "opacity-60"
                  )}
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-[10px] text-muted-foreground">
                  File
                </div>
              )}

              {/* 左上角：進度徽章 / 成功 / 失敗 */}
              {showProgress && (
                <div className="absolute top-1 left-1">
                  {isUploading && (
                    <CircularBadgeProgress percent={p} />
                  )}
                  {isDone && (
                    <div className="h-6 w-6 rounded-full bg-green-500 grid place-items-center">
                      <Check className="size-4 text-white" />
                    </div>
                  )}
                  {isError && (
                    <div className="h-6 w-6 rounded-full bg-red-500 grid place-items-center">
                      <AlertCircle className="size-4 text-white" />
                    </div>
                  )}
                </div>
              )}

              {/* Hover Overlay：檔名與移除 */}
              <div
                className={clsx(
                  "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-150 flex flex-col justify-end"
                )}
              >
                <div className="p-2 text-[11px] leading-tight text-white line-clamp-2">
                  {it.name}
                </div>
                <div className="absolute top-1 right-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 bg-background/70 hover:bg-background/90"
                    aria-label={`Remove ${it.name}`}
                    onClick={() => onRemove?.(it.id)}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 小圓形進度徽章（SVG） */
function CircularBadgeProgress({ percent }: { percent: number }) {
  const size = 24;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
      aria-label={`Uploading ${percent}%`}
    >
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="white"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="green"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${circ}`}
        />
      </svg>
      <span className="absolute text-[9px] leading-none text-blue-500 rotate-0">
        {Math.max(0, Math.min(99, Math.floor(percent)))}
      </span>
    </div>
  );
}
