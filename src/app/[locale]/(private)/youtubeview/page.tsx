"use client";
import React, { useState } from "react";
import YouTubeHomeMock from "@/components/ui/review/youtube-home-mock";
import MobileYouTubeHomeMock from "@/components/ui/review/youtube-home-mobile";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [isMobile, setIsMobile] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 space-y-4">
      <div className="flex justify-center space-x-4 mb-4">
        <Button
          variant={!isMobile ? "default" : "outline"}
          onClick={() => setIsMobile(false)}
        >
          Desktop View
        </Button>
        <Button
          variant={isMobile ? "default" : "outline"}
          onClick={() => setIsMobile(true)}
        >
          Mobile View
        </Button>
      </div>

      <div> 
        {isMobile ? <MobileYouTubeHomeMock /> : <YouTubeHomeMock />}
      </div>
    </div>
  );
}
