"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link"; // ✅ 新增
import { useParams } from "next/navigation";
import YouTubeHome from "@/components/ui/review/youtube-home";
import YouTubeMobile from "@/components/ui/review/youtube-mobile";
import YouTubeSuggested from "@/components/ui/review/youtube-suggested";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink } from "lucide-react"; // ✅ 新增 ExternalLink
import { useTranslationViewModel } from "@/lib/view-models/use-translation-view-model";
import { CachedTranslation } from "@/lib/idb/translation-idb";
import { useYoutubeVideosVM } from "@/lib/view-models/use-youtube-localcache-view-model";

type ViewMode = "desktop" | "tablet" | "mobile";

interface Props {
  initialTranslation?: CachedTranslation;
}

export default function DevicePreviewClient({ initialTranslation }: Props) {
  const { locale } = useParams() as { locale: string };
  const guidePath = `/${locale}/how-to/youtube-live-views`; // ✅ 新增：教學頁路徑
  const pageId = "device_preview_page";
  const { translation, hydrateTranslation } = useTranslationViewModel(pageId, locale);

  useEffect(() => {
    if (initialTranslation) {
      hydrateTranslation(initialTranslation.content, initialTranslation.version);
    }
  }, [initialTranslation, hydrateTranslation]);

  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [inputTerm, setInputTerm] = useState("");
  const initialFetchDoneRef = useRef(false);

  const { videos, shortVideos, fetchVideos, lastSearchTerm } = useYoutubeVideosVM();

  const handleSearch = async () => {
    await fetchVideos(inputTerm);
  };

  useEffect(() => {
    if (initialFetchDoneRef.current) return;
    const term = (lastSearchTerm || "").trim();
    if (videos.length > 0) {
      if (term) setInputTerm(term);
      initialFetchDoneRef.current = true;
      return;
    }
    if (!term) return;
    initialFetchDoneRef.current = true;
    setInputTerm(term);
    fetchVideos(term);
  }, [fetchVideos, lastSearchTerm, videos.length]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 space-y-4">
      {/* ✅ 新增：輕量提示條（SEO可索引、可分享） */}
      <div className="w-full flex justify-center">
        <Link
          href={guidePath}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-yellow-500/15 text-yellow-700 px-3 py-1.5 text-xs font-medium hover:bg-yellow-500/25 transition"
        >
          First time using Live Preview? See the full guide
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
        <Input
          type="text"
          placeholder={translation?.Search_bar_placeholder?.translation || "Search"}
          value={inputTerm}
          onChange={(e) => setInputTerm(e.target.value)}
          className="border hover:border-purple-400 focus:border-2 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-purple-600 transition-colors"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button variant="outline" size="icon" onClick={handleSearch}>
          <Search className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex justify-center space-x-4 mb-4">
        <Button
          onClick={() => setViewMode("desktop")}
          className={`px-4 py-2 rounded border transition-colors font-medium ${
            viewMode === "desktop"
              ? "bg-green-600 text-primary"
              : "bg-transparent text-foreground border-border hover:bg-blue-500 hover:text-secondary-foreground hover:border-secondary"
          }`}
        >
          {translation?.Homepage_view?.translation || "Homepage View"}
        </Button>
        <Button
          onClick={() => setViewMode("tablet")}
          className={`px-4 py-2 rounded border transition-colors font-medium ${
            viewMode === "tablet"
              ? "bg-green-600 text-primary"
              : "bg-transparent text-foreground border-border hover:bg-blue-500 hover:text-secondary-foreground hover:border-secondary"
          }`}
        >
          {translation?.Suggested_Video_view?.translation || "Suggested Video View"}
        </Button>
        <Button
          onClick={() => setViewMode("mobile")}
          className={`px-4 py-2 rounded border transition-colors font-medium ${
            viewMode === "mobile"
              ? "bg-green-600 text-primary"
              : "bg-transparent text-foreground border-border hover:bg-blue-500 hover:text-secondary-foreground hover:border-secondary"
          }`}
        >
          {translation?.Mobile_view?.translation || "Mobile View"}
        </Button>
      </div>

      <div>
        {viewMode === "desktop" && <YouTubeHome videos={videos} shorts={shortVideos} />}
        {viewMode === "mobile" && <YouTubeMobile videos={videos} shorts={shortVideos} />}
        {viewMode === "tablet" && <YouTubeSuggested videos={videos} shorts={shortVideos} />}
      </div>
    </div>
  );
}
