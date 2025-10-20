import { NextResponse } from "next/server";
import { GetFallBackVideoThumbnails } from "@/actions/supabase/supabase_fallback_video";
import { YoutubeVideo } from "@/lib/schema/youtube-video-schema";

type YTThumbnails = {
  maxres?: { url?: string };
  standard?: { url?: string };
  high?: { url?: string };
  medium?: { url?: string };
  default?: { url?: string };
};

type SearchItem = {
  id: { videoId?: string };
  snippet: {
    title: string;
    description?: string;
    channelId?: string;
    channelTitle?: string;
    publishedAt: string;
    thumbnails?: YTThumbnails;
  };
};
type SearchResp = { items?: SearchItem[]; nextPageToken?: string };

type VideosItem = {
  id: string;
  contentDetails?: { duration?: string };
  statistics?: { viewCount?: string };
  snippet?: {
    publishedAt?: string;
    channelId?: string;
    channelTitle?: string;
    title?: string;
    description?: string;
    thumbnails?: YTThumbnails;
  };
};
type VideosResp = { items?: VideosItem[] };

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
  return candidate ?? fallback ?? "https://placehold.co/320x180?text=No+Thumbnail";
}

const TARGET = 6;        // 目標筆數
const SEARCH_BATCH = 25; // 每頁 search 數量（抓多一點，最終會嚴格過濾）

// ---- utils ----
function formatViews(count?: string): string {
  const num = parseInt(count ?? "0", 10);
  if (isNaN(num)) return "0 views";
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B views`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M views`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K views`;
  return `${num} views`;
}

function formatUploadedAt(iso?: string): string {
  if (!iso) return "unknown";
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "unknown";
  const diff = Math.max(0, now - then);
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const mo = Math.floor(d / 30);
  const y = Math.floor(d / 365);
  if (s < 60) return `${s}s ago`;
  if (m < 60) return `${m} mins ago`;
  if (h < 24) return `${h} hours ago`;
  if (d < 30) return `${d} days ago`;
  if (mo < 12) return `${mo} months ago`;
  return `${y} years ago`;
}

function parseDuration(iso?: string): string {
  const m = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "00:00";
  const h = parseInt(m[1] || "0", 10);
  const mi = parseInt(m[2] || "0", 10);
  const s = parseInt(m[3] || "0", 10);
  if (h > 0) return `${h}:${String(mi).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${mi}:${String(s).padStart(2, "0")}`;
}

function parseDurationToSeconds(iso?: string): number {
  const m = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = parseInt(m[1] || "0", 10);
  const mi = parseInt(m[2] || "0", 10);
  const s = parseInt(m[3] || "0", 10);
  return h * 3600 + mi * 60 + s;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userQuery = (searchParams.get("q") || "shorts").trim();
  // 將 #Shorts 合併到 query（避免重複加）
  const query = userQuery.includes("#Shorts") ? userQuery : `${userQuery} #Shorts`;

  const API_KEY = process.env.YOUTUBE_API_KEY!;
  const collected: YoutubeVideo[] = [];
  let pageToken: string | undefined;

  try {
    // 迭代抓取直到湊滿 TARGET 或沒有下一頁
    while (collected.length < TARGET) {
      // 1) search.list：q + #Shorts + videoDuration=short（粗篩）
      const searchUrl =
        `https://www.googleapis.com/youtube/v3/search` +
        `?key=${API_KEY}` +
        `&q=${encodeURIComponent(query)}` +
        `&part=snippet,id` +
        `&type=video` +
        `&maxResults=${SEARCH_BATCH}` +
        `&videoDuration=short` +
        (pageToken ? `&pageToken=${pageToken}` : "");

      const sResp = await fetch(searchUrl);
      if (!sResp.ok) break;
      const sData: SearchResp = await sResp.json();
      const items = sData.items ?? [];
      if (items.length === 0) break;

      const ids = items.map(i => i.id.videoId).filter(Boolean) as string[];
      if (ids.length === 0) {
        pageToken = sData.nextPageToken;
        if (!pageToken) break;
        continue;
      }

      // 2) videos.list：拿 duration + viewCount + snippet（嚴格過濾 ≤60s）
      const vUrl =
        `https://www.googleapis.com/youtube/v3/videos` +
        `?key=${API_KEY}` +
        `&id=${ids.join(",")}` +
        `&part=contentDetails,statistics,snippet` +
        `&fields=items(id,contentDetails/duration,statistics/viewCount,snippet/publishedAt,snippet/channelId,snippet/channelTitle,snippet/title,snippet/description,snippet/thumbnails(maxres/url,standard/url,high/url,medium/url,default/url))`;

      const vResp = await fetch(vUrl);
      if (!vResp.ok) break;
      const vData: VideosResp = await vResp.json();

      
      for (const v of vData.items ?? []) {
        const sec = parseDurationToSeconds(v.contentDetails?.duration);
        // 嚴格 Shorts 判斷：≤ 180 秒
        if (sec > 0 && sec <= 180) {
          const video: YoutubeVideo = {
            id: v.id,
            title: v.snippet?.title || "Untitled",
            thumbnailhigh: pickBestThumbnail(
              v.snippet?.thumbnails,
              v.id,
              "https://placehold.co/320x180?text=No+Thumbnail"
            ),
            thumbnail: v.snippet?.thumbnails?.medium?.url ||
              "https://placehold.co/320x180?text=No+Thumbnail",
            channelId: v.snippet?.channelId ?? "",
            channelName: v.snippet?.channelTitle ?? "",
            channelLogo: "/logo/logo.png", // 如需真實頭像可再加 channels.list
            views: formatViews(v.statistics?.viewCount),
            length: parseDuration(v.contentDetails?.duration),
            uploadedAt: formatUploadedAt(v.snippet?.publishedAt),
          };
          // 若需要把含 #Shorts 的排前面，可先暫存兩組陣列再合併
          collected.push(video);
        }

        if (collected.length >= TARGET) break;
      }

      if (collected.length >= TARGET) break;
      pageToken = sData.nextPageToken;
      if (!pageToken) break; // 沒下一頁了
    }

    // 不足時用 fallback 補（可選）
    if (collected.length < TARGET) {
      const fallback = await GetFallBackVideoThumbnails("shorts");
      const remain = TARGET - collected.length;
      if (fallback?.data?.videos && Array.isArray(fallback.data.videos)) {
        collected.push(
          ...fallback.data.videos.slice(0, remain).map((item: YoutubeVideo, idx: number) => ({
            id: item.id || `fb-${idx}`,
            title: item.title,
            thumbnail: item.thumbnail,
            channelId: item.channelId ?? "",
            channelName: item.channelName ?? "",
            channelLogo: "/logo/logo.png",
            views: item.views ?? "N/A",
            length: item.length ?? "0:00",
            uploadedAt: item.uploadedAt ?? "just now",
          }))
        );
      }
    }

    return NextResponse.json(collected.slice(0, TARGET));
  } catch (err) {
    console.error("youtubeshorts error:", err);
    return NextResponse.json({ error: "Failed to fetch shorts" }, { status: 500 });
  }
}
