import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const MAX_RESULTS = 4;

  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&q=shorts&part=snippet,id&maxResults=${MAX_RESULTS}&type=video`;

  const response = await fetch(url);
  const data = await response.json();

  const shorts = data.items.map((item: any, idx: number) => ({
    id: item.id.videoId || String(idx),
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
  }));

  console.log("Shorts fetched: ", shorts);

  return NextResponse.json(shorts);
}
