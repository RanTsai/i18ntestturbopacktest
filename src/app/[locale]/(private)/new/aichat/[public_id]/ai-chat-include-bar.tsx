// components/ui/chat/IncludeBar.tsx
"use client";

import { X, User as UserIcon, Bot as BotIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import clsx from "clsx";

export type IncludedMeta = {
  id: string | null;
  role: "user" | "assistant";
  preview: string;
};

export default function IncludeBar({
  included,
  onClear,
  className,
}: {
  included?: IncludedMeta | null;
  onClear?: () => void;
  className?: string;
}) {
  if (!included) return null;

  const Icon = included.role === "user" ? UserIcon : BotIcon;

  return (
    <div
      className={clsx(
        "mb-2 rounded-lg border border-border px-3 py-2 bg-secondary",
        "flex items-center gap-3",
        className
      )}
      role="region"
      aria-label="Included message preview"
    >
      <span className="inline-flex items-center justify-center size-6 rounded-full border border-border">
        <Icon className="size-3.5 text-foreground" />
      </span>
      <div className="flex-1 text-sm text-foreground/90 truncate" title={included.preview}>
        {included.preview || "—"}
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Clear included message"
        onClick={onClear}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
