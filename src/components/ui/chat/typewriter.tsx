"use client";

import { useEffect, useState } from "react";

export default function Typewriter({ content }: { content: string }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + content.charAt(index));
      index++;
      if (index >= content.length) {
        clearInterval(interval);
      }
    }, 20); // 打字速度 (ms)
    return () => clearInterval(interval);
  }, [content]);

  return (
    <div className="whitespace-pre-wrap font-mono">
      {displayedText}
    </div>
  );
}
