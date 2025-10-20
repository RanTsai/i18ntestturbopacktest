// app/api/youtube/route.ts
import { NextResponse } from "next/server";
import { GetFallBackVideoThumbnails } from "@/actions/supabase/supabase_fallback_video";
import { YoutubeVideo } from "@/lib/schema/youtube-video-schema";

// ---- Minimal YouTube API Types ----
type YTThumbnails = {
  maxres?: { url?: string };
  standard?: { url?: string };
  high?: { url?: string };
  medium?: { url?: string };
  default?: { url?: string };
};

type YTSearchItem = {
  id: { videoId?: string };
  snippet: {
    title: string;
    channelId?: string;
    channelTitle?: string;
    thumbnails: YTThumbnails;
    publishedAt: string;
  };
};
type YTSearchResponse = { items?: YTSearchItem[] };

type YTChannelItem = {
  id: string;
  snippet?: {
    thumbnails?: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
  };
};
type YTChannelsResponse = { items?: YTChannelItem[] };

type YTVideoItem = {
  id: string;
  contentDetails?: { duration?: string };
  statistics?: { viewCount?: string };
  snippet?: { thumbnails?: YTThumbnails };
};
type YTVideosResponse = { items?: YTVideoItem[] };

// 工具：把 ISO 時間轉為「x 時間前」
function formatUploadedAt(iso?: string): string {
  if (!iso) return "unknown";
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "unknown";

  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const mon = Math.floor(day / 30);
  const yr = Math.floor(day / 365);

  if (sec < 60) return `${sec}s ago`;
  if (min < 60) return `${min} mins ago`;
  if (hr < 24) return `${hr} hours ago`;
  if (day < 30) return `${day} days ago`;
  if (mon < 12) return `${mon} months ago`;
  return `${yr} years ago`;
}


// 工具：把 ISO 8601 Duration 轉換成 hh:mm:ss
function parseDuration(iso: string): string {
  const match = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "00:00:00";
  const h = parseInt(match[1] || "0", 10);
  const m = parseInt(match[2] || "0", 10);
  const s = parseInt(match[3] || "0", 10);
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

// 工具：把 viewCount 轉成 K/M/B 格式
function formatViews(count: string): string {
  const num = parseInt(count, 10);
  if (isNaN(num)) return "0 views";
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B views`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M views`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K views`;
  return `${num} views`;
}

function pickBestThumbnail(
  thumbs?: YTThumbnails | null,
  videoId?: string,
  fallback?: string
): string {
  const candidate =
    thumbs?.maxres?.url ||
    thumbs?.standard?.url ||
    thumbs?.high?.url ||
    thumbs?.medium?.url ||
    thumbs?.default?.url ||
    (videoId ? `https://i.ytimg.com/vi/${videoId}/hq720.jpg` : undefined);
  return candidate ?? fallback ?? "/logo/thumbnail.png";
}

function normalizeYTAvatar(url?: string | null) {
  if (!url) return null;
  let out = url.replace(
    /=s\d+-c-k-c0x[0-9a-f]+-no-rj.*$/i,
    "=s176-c-k-c0x00ffffff-no-rj"
  );
  out = out.replace(/=s\d+-no-rj.*$/i, "=s176-no-rj");
  return out;
}

async function getFallbackVideos(label: string) {
  const fallback = await GetFallBackVideoThumbnails(label);
  console.log("[API] Fallback videos:", fallback);
  if (!fallback?.success || !Array.isArray(fallback.data?.videos)) {
    throw new Error(fallback?.message || "Fallback failed");
  }

  return fallback.data.videos.map((item: YoutubeVideo, idx: number) => ({
    id: item.id || `vid-${idx}`,
    title: item.title,
    thumbnail: item.thumbnail,
    channelId: item.channelId ?? "",
    channelName: item.channelName ?? null,
    channelLogo: item.channelLogo,
    views: item.views,
    uploadedAt: `${Math.floor(Math.random() * 10) + 1} days ago`,
    length: item.length,
  }));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const searchQuery = searchParams.get("q") || "";

  try {
    if (searchQuery === "" || searchQuery === "fallback") {
      console.log("[API] No query → fallback");
      const fallback = await getFallbackVideos("default");
      return NextResponse.json(fallback);
    }

    const API_KEY = process.env.YOUTUBE_API_KEY!;
    const MAX_RESULTS = 12;

    console.log(`[API] Searching YouTube for "${searchQuery}"`);

    // 1) search.list
    const searchUrl =
      `https://www.googleapis.com/youtube/v3/search` +
      `?key=${API_KEY}` +
      `&part=snippet,id` +
      `&q=${encodeURIComponent(searchQuery)}` +
      `&order=relevance` +
      `&maxResults=${MAX_RESULTS}` +
      `&type=video` +
      `&fields=items(id/videoId,snippet/title,snippet/channelId,snippet/channelTitle,snippet/thumbnails(maxres/url,standard/url,high/url,medium/url,default/url),snippet/publishedAt)`;

    const resp = await fetch(searchUrl);
    if (!resp.ok) {
      if (resp.status === 403) {
        console.warn("[API] Quota exceeded → fallback");
        const fallback = await getFallbackVideos("default");
        console.log("[API] Fallback videos:", fallback);
        return NextResponse.json(fallback);
      }
      throw new Error(`YouTube API Error: ${resp.status}`);
    }

    const data: YTSearchResponse = await resp.json();

    // 整理影片資料
    const videos: YoutubeVideo[] = (data.items ?? []).map((item, idx) => ({
      id: item.id.videoId || `vid-${idx}`,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || "/logo/thumbnail.png",
      thumbnailhigh: pickBestThumbnail(item.snippet.thumbnails, item.id.videoId),
      channelId: item.snippet.channelId ?? "",
      channelName: item.snippet.channelTitle ?? "unknown channel",
      channelLogo: "/logo/logo.png", // 先填預設
      views: "N/A", // 先填 N/A，稍後用 videos.list 補
      length: "0:00", // 先填 0:00，稍後用 videos.list 補
      uploadedAt: formatUploadedAt(item.snippet.publishedAt), // ← 真實數據
    }));

    // 蒐集 id 與 channelId
    const videoIds = videos.map((v) => v.id).filter(Boolean);
    const channelIds = Array.from(
      new Set(videos.map((v) => v.channelId).filter((x): x is string => Boolean(x)))
    );

    // 2) channels.list → 拿 channelLogo
    let channelLogoById: Record<string, string | null> = {};
    if (channelIds.length > 0) {
      const channelsUrl =
        `https://www.googleapis.com/youtube/v3/channels` +
        `?key=${API_KEY}` +
        `&id=${channelIds.join(",")}` +
        `&part=snippet` +
        `&fields=items(id,snippet/thumbnails(default/url,medium/url,high/url))`;

      const chResp = await fetch(channelsUrl);
      if (chResp.ok) {
        const chData: YTChannelsResponse = await chResp.json();
        channelLogoById = (chData.items ?? []).reduce<Record<string, string | null>>(
          (acc, ch) => {
            const url =
              ch.snippet?.thumbnails?.high?.url ||
              ch.snippet?.thumbnails?.medium?.url ||
              ch.snippet?.thumbnails?.default?.url ||
              null;
            if (url) acc[ch.id] = url;
            return acc;
          },
          {}
        );
      }
    }

    // 3) videos.list → 拿真實 duration + viewCount
    let videoMetaById: Record<string, { views: string; length: string; thumbnails?: YTThumbnails }> = {};
    if (videoIds.length > 0) {
      const videosUrl =
        `https://www.googleapis.com/youtube/v3/videos` +
        `?key=${API_KEY}` +
        `&id=${videoIds.join(",")}` +
        `&part=contentDetails,statistics,snippet` +
        `&fields=items(id,contentDetails/duration,statistics/viewCount,snippet/thumbnails(maxres/url,standard/url,high/url,medium/url,default/url))`;

      const vResp = await fetch(videosUrl);
      if (vResp.ok) {
        const vData: YTVideosResponse = await vResp.json();
        videoMetaById = (vData.items ?? []).reduce<Record<string, { views: string; length: string; thumbnails?: YTThumbnails }>>(
          (acc, v) => {
            acc[v.id] = {
              views: formatViews(v.statistics?.viewCount ?? "0"),
              length: parseDuration(v.contentDetails?.duration ?? "PT0S"),
              thumbnails: v.snippet?.thumbnails,
            };
            return acc;
          },
          {}
        );
      }
    }
    console.log("[API] Fetched videos:", videos.length);

    // 4) 合併
    const result = videos.map((v) => {
      const logo = v.channelId ? normalizeYTAvatar(channelLogoById[v.channelId]) : null;
      const meta = videoMetaById[v.id];
      return {
        ...v,
        thumbnail: pickBestThumbnail(meta?.thumbnails, v.id, v.thumbnail),
        channelLogo: logo || v.channelLogo,
        views: meta?.views ?? v.views,
        length: meta?.length ?? v.length,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("fetching from youtube error:", error);
    return NextResponse.json({ error: "Failed to fetch YouTube data" }, { status: 500 });
  }
}

