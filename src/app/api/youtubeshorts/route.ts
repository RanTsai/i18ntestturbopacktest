//api/youtubeshorts/route.ts
import { NextResponse } from "next/server";
import { GetFallBackVideoThumbnails } from "@/actions/supabase/supabase_fallback_video";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "shorts";

  const API_KEY = process.env.YOUTUBE_API_KEY;
  const MAX_RESULTS = 6;

  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}&part=snippet,id&maxResults=${MAX_RESULTS}&type=video`;

  let response = await fetch(url); console.log("youtube fetch response", response);
if (!response.ok){
  console.warn("Quota exceeded, falling back to database...");        
  const fallback = await GetFallBackVideoThumbnails("shorts");
  console.log("fallback", fallback, "fallback data", fallback.data);
  if (fallback && fallback.data && Array.isArray(fallback.data.videos)) {
    // Return fallback videos as JSON response
    return NextResponse.json(
      fallback.data.videos.map((item: any, idx: number) => ({
        id: item.id || String(idx),
        title: item.title,
        thumbnail: item.thumbnail,
      }))
    );
  } else {
    throw new Error(fallback?.message || "Fallback failed");
  }
}
const data = await response.json();
const shorts = data.items.map((item: any, idx: number) => ({
  id: item.id.videoId || String(idx),
  title: item.snippet.title,
  thumbnail: item.snippet.thumbnails.medium.url,
}));

return NextResponse.json(shorts);
}
