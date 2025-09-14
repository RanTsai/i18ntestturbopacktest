// components/ui/chat/ReplyQuote.tsx
"use client";
import React from "react";

export default function ReplyQuote({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="mb-2 text-xs text-foreground/80 border-l-2 border-border pl-2">
      {text}
    </div>
  );
}
