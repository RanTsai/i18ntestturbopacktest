"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import YouTubeHomeMock from "@/components/ui/review/youtube-home-mock";
import MobileYouTubeHomeMock from "@/components/ui/review/youtube-home-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import TabletYouTubeHome from "@/components/ui/review/youtube-home-tablet";
import { useTranslationViewModel } from "@/lib/view-models/use-translation-view-model";
import { CachedTranslation } from "@/lib/idb/translation-idb";
import { useYoutubeVideosVM } from "@/lib/view-models/use-youtube-localcache-view-model";

type ViewMode = "desktop" | "tablet" | "mobile";

interface Props {
  initialTranslation?: CachedTranslation;
}

export default function Page({ initialTranslation }: Props) {
  const { locale } = useParams() as { locale: string };
  const pageId = "device_preview_page";
  const { translation, hydrateTranslation } = useTranslationViewModel(pageId, locale);

  useEffect(() => {
    if (initialTranslation) {
      hydrateTranslation(initialTranslation.content, initialTranslation.version);
    }
  }, [initialTranslation]);

  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [inputTerm, setInputTerm] = useState("");

  // ✅ 從 view model 取資料
  const { videos, shortVideos, fetchVideos, lastSearchTerm } = useYoutubeVideosVM();
  console.log("Videos from view model:", videos);

  const handleSearch = async () => {
    console.log("Searching for:", inputTerm);
    await fetchVideos(inputTerm);
  };

  // ✅ 初始化 Trending
  useEffect(() => {
    console.log("Initial fetch for trending videos", lastSearchTerm);
    fetchVideos(lastSearchTerm);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 space-y-4">
      {/* 🔍 Search Bar */}
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
        <Input
          type="text"
          placeholder={translation?.Search_bar_placeholder?.translation || "Search"}
          value={inputTerm}
          onChange={(e) => setInputTerm(e.target.value)}
          className="w-full"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button variant="outline" size="icon" onClick={handleSearch}>
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* 📱 View Mode Buttons */}
      <div className="flex justify-center space-x-4 mb-4">
        <Button
          onClick={() => setViewMode("desktop")}
          className={`px-4 py-2 rounded border transition-colors font-medium
            ${viewMode === "desktop"
              ? "bg-green-600 text-primary"
              : "bg-transparent text-foreground border-border hover:bg-blue-500 hover:text-secondary-foreground hover:border-secondary"}`}
        >
          {translation?.Homepage_view?.translation || "Homepage View"}
        </Button>

        <Button
          onClick={() => setViewMode("tablet")}
          className={`px-4 py-2 rounded border transition-colors font-medium
            ${viewMode === "tablet"
              ? "bg-green-600 text-primary"
              : "bg-transparent text-foreground border-border hover:bg-blue-500 hover:text-secondary-foreground hover:border-secondary"}`}
        >
          {translation?.Suggested_Video_view?.translation || "Suggested Video View"}
        </Button>

        <Button
          onClick={() => setViewMode("mobile")}
          className={`px-4 py-2 rounded border transition-colors font-medium
            ${viewMode === "mobile"
              ? "bg-green-600 text-primary"
              : "bg-transparent text-foreground border-border hover:bg-blue-500 hover:text-secondary-foreground hover:border-secondary"}`}
        >
          {translation?.Mobile_view?.translation || "Mobile View"}
        </Button>
      </div>

      {/* 📺 Render View */}
      <div>
        {viewMode === "desktop" && <YouTubeHomeMock videos={videos} shorts={shortVideos} />}
        {viewMode === "tablet" && <TabletYouTubeHome videos={videos} shorts={shortVideos}/>}
        {viewMode === "mobile" && <MobileYouTubeHomeMock videos={videos} shorts={shortVideos}/>}
      </div>
    </div>
  );
}
