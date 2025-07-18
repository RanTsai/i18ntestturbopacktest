"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import YouTubeHomeMock from "@/components/ui/review/youtube-home-mock";
import MobileYouTubeHomeMock from "@/components/ui/review/youtube-home-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useVideoContext } from "@/context/youtube-video-provider";
import TabletYouTubeHome from "@/components/ui/review/youtube-home-tablet";
import useTranslationStore from "@/lib/global-store/use-translation-store";

type ViewMode = "desktop" | "tablet" | "mobile";

export default function Page() {
  const { getTranslation } = useTranslationStore();

  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [inputTerm, setInputTerm] = useState("");
  const pageId = "device_preview_page";
  const { locale } = useParams() as { locale: string };

  const translations = getTranslation(pageId, locale) || {};

  const {
    searchTerm,
    setSearchTerm,
    setVideosByKey,
    getVideosByKey,
  } = useVideoContext();

  const videos = getVideosByKey("search");

  const handleSearch = async () => {
    const keyword = inputTerm.trim();
    if (!keyword) return;

    setSearchTerm(keyword);

    const res = await fetch(`/api/youtube?q=${encodeURIComponent(keyword)}`);
    const data = await res.json();

    setVideosByKey("search", data);
  };

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/youtube?q=trending");
      const data = await res.json();
      setVideosByKey("search", data);
      setSearchTerm("trending");
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 space-y-4">
      {/* 🔍 Search Bar */}
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
        <Input
          type="text"
          placeholder=  {translations?.Search_bar_placeholder?.translation || "Search"}
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
          variant={viewMode === "desktop" ? "default" : "outline"}
          onClick={() => setViewMode("desktop")}
        >
          {translations?.Homepage_view?.translation || "Homepage View"}

        </Button>
        <Button
          variant={viewMode === "tablet" ? "default" : "outline"}
          onClick={() => setViewMode("tablet")}
        >
          {translations?.Suggested_Video_view?.translation || "Suggested Video View"}
        </Button>
        <Button
          variant={viewMode === "mobile" ? "default" : "outline"}
          onClick={() => setViewMode("mobile")}
        >
          {translations?.Mobile_view?.translation || "Mobile View"}
        </Button>
      </div>

      {/* 📺 Render View */}
      <div>
        {viewMode === "desktop" && (
          <YouTubeHomeMock />
        )}
        {viewMode === "tablet" && (
          <TabletYouTubeHome />
        )}
        {viewMode === "mobile" && (
          <MobileYouTubeHomeMock />
        )}
      </div>
    </div>
  );
}
