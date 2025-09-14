// components/ui/chat/SubdialogSwitcher.tsx
"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

export default function SubdialogSwitcher({
  current,
  total,
  onPrev,
  onNext,
  className,
}: {
  current: number; // 1-based
  total: number;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
}) {
  if (total <= 0) return null;
  return (
    <div
      className={clsx(
        "flex items-center gap-2 text-xs text-muted-foreground",
        className
      )}
      role="region"
      aria-label="Subdialog switcher"
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label="Previous version"
        onClick={onPrev}
        disabled={total <= 1}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <div className="min-w-[60px] text-center">{current} / {total}</div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Next version"
        onClick={onNext}
        disabled={total <= 1}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
