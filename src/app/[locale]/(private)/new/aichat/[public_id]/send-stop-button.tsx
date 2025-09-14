// components/ui/chat/SendStopButton.tsx
"use client";
import React from "react";
import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

export default React.memo(function SendStopButton({
  isStreaming,
  onStop,
}: {
  isStreaming: boolean;
  onStop: () => void;
}) {
  return (
    <Button
      type={isStreaming ? "button" : "submit"}
      size="icon"
      onClick={isStreaming ? onStop : undefined}
      // 不要 aria-busy 以免全域樣式關掉互動
      data-busy={isStreaming ? "true" : "false"}
      className={[
        "pointer-events-auto cursor-pointer transition-colors active:scale-95",
        "size-9 rounded-full",
        // 將按鈕提升為合成層，避免 hover 卡頓
        "[transform:translateZ(0)] will-change-[transform,background-color]",
        isStreaming
          ? "bg-red-500 text-white hover:!bg-red-600"
          : "bg-[var(--foreground)] text-[var(--background)] hover:!bg-blue-500",
      ].join(" ")}
      aria-label={isStreaming ? "Stop" : "Send"}
      title={isStreaming ? "Stop" : "Send"}
    >
      {isStreaming ? <Square size={16} /> : <Send size={16} />}
    </Button>
  );
});
