"use client";

import Image from "next/image";

import React from "react";
import VideoCard from "@/components/ui/review/video-card";
import useVideoSelectionStore from "@/lib/global-store/video-selection-store";
import { YoutubeVideo } from "@/lib/schema/youtube-video-schema";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ImagePlus } from "lucide-react";
import YoutubeHomeHowToUse from "../how-to-use-dialogue/youtubehome-how-to-use";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface Props {
  videos: YoutubeVideo[];
  shorts?: YoutubeVideo[];
}

// 固定設計尺寸（參考 YouTube）
const DESIGN = {
  stageWidth: 1280 + 24 + 402, // 左 1280 + gap 24 + 右 402 = 1706
  gap: 24,
  leftWidth: 1280,
  leftHeight: 720, // 16:9
  rightWidth: 402,
};

export default function YoutubeSuggested({ videos }: Props) {
  const { selectedVideos, addVideo, removeVideo } = useVideoSelectionStore();
  const [helpOpen, setHelpOpen] = React.useState(false);

  // ---- 新：左側主畫面與右側推薦清單（可互換） ----
  const [heroVideo, setHeroVideo] = React.useState<YoutubeVideo | null>(videos[0] ?? null);
  const [recs, setRecs] = React.useState<YoutubeVideo[]>(videos.slice(1, 13));


  const isVideoSelected = (thumbnail: string) =>
    selectedVideos.some((v) => v.thumbnail === thumbnail);

  const handleSelect = (video: { title: string; thumbnail: string }) => {
    if (isVideoSelected(video.thumbnail)) {
      removeVideo(video.thumbnail);
    } else {
      addVideo(video);
    }
  };

  // 點右側卡片 → 與左側 hero 互換
  const swapHeroWith = (clicked: YoutubeVideo) => {
    if (!heroVideo) {
      setHeroVideo(clicked);
      setRecs((prev) => prev.filter((v) => v.id !== clicked.id));
      setCustomHeroUrl(null);
      return;
    }
    setRecs((prev) => {
      const idx = prev.findIndex((v) => v.id === clicked.id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = heroVideo;
      return next;
    });
    setHeroVideo(clicked);
    // 如目前顯示的是自訂上傳圖，點右側卡片後切回影片縮圖
    setCustomHeroUrl(null);
  };

  // ---- 首次引導 ----
  const LS_HELP_SEEN_KEY = "youtubeSuggestedHowToSeen";
  const [hasSeenHowTo, setHasSeenHowTo] = React.useState<boolean>(true); // 預設 true 避免首次閃爍
  React.useEffect(() => {
    try {
      const seen = localStorage.getItem(LS_HELP_SEEN_KEY) === "1";
      setHasSeenHowTo(seen);
      if (!seen) setHelpOpen(true);
    } catch {}
  }, []);

  // ---- HERO（左側大縮圖）自訂：drag & drop / click upload ----
  const [customHeroUrl, setCustomHeroUrl] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!videos.length) {
      setHeroVideo(null);
      setRecs([]);
      setCustomHeroUrl(null);
      return;
    }

    setHeroVideo(videos[0]);
    setRecs(videos.slice(1, 13));
    setCustomHeroUrl(null);
  }, [videos]);

  const revokeUrlRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    return () => {
      if (revokeUrlRef.current) URL.revokeObjectURL(revokeUrlRef.current);
    };
  }, []);

  const handleFiles = (files: FileList) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;
    if (revokeUrlRef.current) {
      URL.revokeObjectURL(revokeUrlRef.current);
      revokeUrlRef.current = null;
    }
    const url = URL.createObjectURL(file);
    revokeUrlRef.current = url;
    setCustomHeroUrl(url);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files);
  };
  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragEnter: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const triggerFile = () => fileInputRef.current?.click();
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (files) handleFiles(files);
  };

  // ---- 左側標題：單擊進入編輯、Enter 確認、Esc 取消 ----
  const initialTitle = heroVideo?.title ?? "";
  const [title, setTitle] = React.useState<string>(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = React.useState<boolean>(false);
  const [tempTitle, setTempTitle] = React.useState<string>(initialTitle);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // hero 改變時重置標題
  React.useEffect(() => {
    const t = heroVideo?.title ?? "";
    setTitle(t);
    setTempTitle(t);
  }, [heroVideo]);

  React.useEffect(() => {
    if (isEditingTitle) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingTitle]);

  const beginEdit = () => {
    setTempTitle(title);
    setIsEditingTitle(true);
  };
  const commitEdit = () => {
    setTitle(tempTitle.trim());
    setIsEditingTitle(false);
  };
  const cancelEdit = () => {
    setTempTitle(title);
    setIsEditingTitle(false);
  };
  const onKeyDownTitle: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  // ---- 等比縮放：整個舞台按寬度縮放；高度由內容自然決定 ----
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(1);
  const [scaledHeight, setScaledHeight] = React.useState<number>(DESIGN.leftHeight);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const available = el.clientWidth;
      const s = Math.min(available / DESIGN.stageWidth, 1);
      setScale(s);

      const h = contentRef.current?.offsetHeight ?? DESIGN.leftHeight;
      setScaledHeight(Math.round(h * s));
    };

    const ro = new ResizeObserver(update);
    ro.observe(el);
    setTimeout(update, 0);

    return () => ro.disconnect();
  }, []);

  return (
    <main className="bg-background text-foreground p-4">
      <div className="w-full flex items-center justify-center gap-3 py-4">
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
            {hasSeenHowTo ? "How to use?" : "First time here? Click for a quick guide 👇"}
          </TooltipContent>
        </Tooltip>

        {/* 策略教學跳轉：新分頁 */}
        <Link
          href="/how-to/youtube-suggested"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-2xl border border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
        >
          Learn the strategy
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 舞台外殼：依容器寬度縮放，並用 spacer 讓頁面高度跟著內容跑 */}
      <div ref={containerRef} className="w-full">
        <div style={{ height: scaledHeight }}>
          <div
            className="origin-top mx-auto"
            style={{ width: DESIGN.stageWidth, transform: `scale(${scale})` }}
          >
            {/* Grid 佈局：第一列播放器＋右欄；第二列標題 */}
            <div
              ref={contentRef}
              style={{
                width: DESIGN.stageWidth,
                display: "grid",
                gridTemplateColumns: `${DESIGN.leftWidth}px ${DESIGN.gap}px ${DESIGN.rightWidth}px`,
                gridTemplateRows: `${DESIGN.leftHeight}px auto`,
                gridAutoRows: "auto",
              }}
            >
              {/* 左：主播放器（支援 drop/click 上傳 & hover 覆蓋層 + 虛線） */}
              <div
                style={{
                  gridColumn: "1 / 2",
                  gridRow: "1 / 2",
                  width: DESIGN.leftWidth,
                  height: DESIGN.leftHeight,
                }}
              >
                <div
                  className={[
                    "relative rounded-lg overflow-hidden shadow-md group/hero",
                    "bg-muted",
                    "border-2",
                    isDragging
                      ? "border-dashed border-amber-400"
                      : "border-transparent group-hover/hero:border-dashed group-hover/hero:border-foreground/60",
                    "transition-[border-color,background-color]",
                  ].join(" ")}
                  style={{ width: "100%", height: "100%" }}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragEnter={onDragEnter}
                  onDragLeave={onDragLeave}
                >
                  {/* 顯示自訂圖片或 heroVideo */}
                  {customHeroUrl ? (
                    <Image
                      src={customHeroUrl}
                      alt="Custom hero"
                      fill
                      className="object-cover"
                      draggable={false}
                      unoptimized
                    />
                  ) : heroVideo ? (
                    <div
                      className="w-full h-full cursor-pointer"
                      onClick={() =>
                        handleSelect({
                          title: heroVideo.title,
                          thumbnail: heroVideo.thumbnail,
                        })
                      }
                    >
                      <VideoCard
                        video={heroVideo}
                        isSelected={isVideoSelected(heroVideo.thumbnail)}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full animate-pulse" />
                  )}

                  {/* 覆蓋層：整區 hover 立即顯示上傳圖示；拖曳時加深底色 */}
                  <button
                    type="button"
                    onClick={triggerFile}
                    className={[
                      "absolute inset-0 flex flex-col items-center justify-center",
                      "opacity-0 group-hover/hero:opacity-100",
                      isDragging ? "bg-black/60" : "group-hover/hero:bg-black/40 bg-black/0",
                      "transition-opacity",
                      "text-white",
                    ].join(" ")}
                    aria-label="Upload custom thumbnail"
                  >
                    <div className="flex flex-col items-center">
                      <ImagePlus className="h-10 w-10 mb-1" />
                      <span className="text-xs">Drag & drop image, or click to upload</span>
                    </div>
                  </button>

                  {/* 隱藏 file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </div>
              </div>

              {/* 中間間距 */}
              <div style={{ gridColumn: "2 / 3", gridRow: "1 / 3", width: DESIGN.gap }} />

              {/* 右：推薦清單（點擊與左側互換） */}
              <div style={{ gridColumn: "3 / 4", width: DESIGN.rightWidth }}>
                {/* 如果需要 Shorts，可開啟 */}
                {/* {hasShorts && (
                  <div className="mb-3">
                    <ShortsSection variant="horizontal" shorts={shorts} />
                  </div>
                )} */}
                <div className="flex flex-col gap-3 pr-0">
                  {recs.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => swapHeroWith(video)}
                      className="cursor-pointer"
                      title="Set as main preview"
                    >
                      <VideoCard
                        video={video}
                        variant="suggested"
                        isSelected={isVideoSelected(video.thumbnail)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 第二列：左標題（單擊可編輯；Enter確認、Esc取消） */}
              <div
                style={{
                  gridColumn: "1 / 2",
                  gridRow: "2 / 3",
                  marginTop: 12,
                  maxWidth: DESIGN.leftWidth,
                }}
              >
                {isEditingTitle ? (
                  <input
                    ref={inputRef}
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={onKeyDownTitle}
                    onBlur={commitEdit}
                    className="w-full text-lg font-semibold bg-transparent border-b border-white/20 focus:border-white outline-none"
                  />
                ) : (
                  <h2
                    className="text-lg font-semibold leading-snug line-clamp-2 cursor-text"
                    onClick={beginEdit}
                    title="Click to edit title"
                  >
                    {title}
                  </h2>
                )}

                {/* 下方資訊區域 */}
                <div className="mt-3 flex items-center gap-3">
                  {heroVideo?.channelLogo && (
                    <Image
                      src={heroVideo.channelLogo}
                      alt={heroVideo.channelName || "Channel"}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                  )}

                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-medium text-foreground">
                      {heroVideo?.channelName || "Unknown Channel"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {heroVideo?.views} views
                    </span>
                  </div>
                </div>
              </div>

              {/* 第二列：右側留白（對齊網格） */}
              <div style={{ gridColumn: "2 / 4" }} />
            </div>
          </div>
        </div>
      </div>

      {/* 無資料提示 */}
      {videos.length === 0 && (
        <p className="text-center text-muted-foreground mt-10">
          No videos found. Try searching something else.
        </p>
      )}

      <YoutubeHomeHowToUse
        helpOpen={helpOpen}
        setHelpOpen={(open: boolean) => {
          setHelpOpen(open);
          if (!open) {
            try {
              localStorage.setItem(LS_HELP_SEEN_KEY, "1");
              setHasSeenHowTo(true);
            } catch {}
          }
        }}
      />
    </main>
  );
}











