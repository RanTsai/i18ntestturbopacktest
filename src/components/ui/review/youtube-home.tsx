"use client";

import React from "react";
import Link from "next/link"; // ✅ 新增
import VideoCard from "@/components/ui/review/video-card";
import useVideoSelectionStore from "@/lib/global-store/video-selection-store";
import { YoutubeVideo } from "@/lib/schema/youtube-video-schema";
import ShortsSection from "./shorts-section";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import YoutubeHomeHowToUse from "../how-to-use-dialogue/youtubehome-how-to-use";

interface Props {
  videos: YoutubeVideo[];
  shorts: YoutubeVideo[];
}

export default function YouTubeHome({ videos, shorts }: Props) {
  const { selectedVideos, addVideo, removeVideo } = useVideoSelectionStore();
  const [helpOpen, setHelpOpen] = React.useState(false);

  // ✅ 首次脈衝控制（與 thumbnail-analyzer 一致）
  const LS_HELP_SEEN_KEY = "ytLiveHowToSeen";
  const [hasSeenHowTo, setHasSeenHowTo] = React.useState<boolean>(true);

  React.useEffect(() => {
    try {
      const seen = localStorage.getItem(LS_HELP_SEEN_KEY) === "1";
      setHasSeenHowTo(seen);
    } catch {}
  }, []);

  const onCloseHelp = (open: boolean) => {
    setHelpOpen(open);
    if (!open) {
      try {
        localStorage.setItem(LS_HELP_SEEN_KEY, "1");
        setHasSeenHowTo(true);
      } catch {}
    }
  };

  const isVideoSelected = (thumbnail: string) =>
    selectedVideos.some((v) => v.thumbnail === thumbnail);

  const handleSelect = (video: { title: string; thumbnail: string }) => {
    if (isVideoSelected(video.thumbnail)) {
      removeVideo(video.thumbnail);
    } else {
      addVideo(video);
    }
  };

  // 依需求產生排版序列：略（與原本相同）
  const rows: Array<{ type: "videos" | "shorts"; items: YoutubeVideo[] }> = [];
  let vi = 0;
  let si = 0;
  rows.push({ type: "videos", items: videos.slice(vi, vi + 4) });
  vi += 4;
  while (vi < videos.length || si < shorts.length) {
    if (si < shorts.length) {
      rows.push({ type: "shorts", items: shorts.slice(si, si + 6) });
      si += 6;
    }
    if (vi < videos.length) {
      rows.push({ type: "videos", items: videos.slice(vi, vi + 4) });
      vi += 4;
    }
  }

  // ✅ 說明頁路徑：用相對路徑讓外層 page 決定 locale（或視需要傳入）
  const guidePath = "/how-to/youtube-home";

  return (
    <>
      {/* 頂部區域：脈衝按鈕 + 小連結 */}
      <div className="w-full flex flex-col items-center gap-2 py-4">
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="How to use"
              onClick={() => setHelpOpen(true)}
              className={[
                "inline-flex items-center justify-center rounded-2xl px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-ring",
                hasSeenHowTo
                  ? "text-muted-foreground hover:text-foreground hover:bg-amber-500/20"
                  : "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 animate-pulse shadow-[0_0_14px_rgba(234,179,8,0.35)]",
              ].join(" ")}
            >
              How to Use?
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            How to use?
          </TooltipContent>
        </Tooltip>

        {/* ✅ 輕量可索引連結（開新分頁） */}
        <Link
          href={guidePath}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-yellow-500 hover:underline"
        >
          Read the full Live Preview guide →
        </Link>
      </div>

      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-[1800px] px-[clamp(8px,2vw,28px)]">
          <div className="rounded-2xl border border-white/10 bg-muted/5">
            <div className="h-full w-full overflow-auto">
              <div>
                {rows.map((row, idx) =>
                  row.type === "videos" ? (
                    <div key={`v-${idx}`} className="grid grid-cols-4 gap-[clamp(8px,1.2vw,16px)]">
                      {row.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() =>
                            handleSelect({ title: item.title, thumbnail: item.thumbnail })
                          }
                          className="cursor-pointer"
                        >
                          <VideoCard
                            video={item}
                            isSelected={isVideoSelected(item.thumbnail)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ShortsSection key={`s-${idx}`} variant="horizontal" shorts={row.items} />
                  )
                )}

                {videos.length === 0 && rows.length === 0 && (
                  <p className="mt-10 text-center text-muted-foreground">
                    No videos found. Try searching something else.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <YoutubeHomeHowToUse helpOpen={helpOpen} setHelpOpen={onCloseHelp} />
      </div>
    </>
  );
}
