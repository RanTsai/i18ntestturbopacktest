// app/api/youtube/route.ts 呼叫一次無channel logo
// import { NextResponse } from "next/server";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const searchQuery = searchParams.get("q") || "trending"; // 如果沒有給，就用預設

//   const API_KEY = process.env.YOUTUBE_API_KEY!;
//   const MAX_RESULTS = 12;

//   const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&part=snippet,id&q=${encodeURIComponent(
//     searchQuery
//   )}&order=relevance&maxResults=${MAX_RESULTS}`;

//   try {
//     const response = await fetch(url);
//     const data = await response.json();

//     const videos = data.items.map((item: any, idx: number) => ({
//       id: item.id.videoId || `vid-${idx}`,
//       title: item.snippet.title,
//       thumbnail: item.snippet.thumbnails.medium.url,
//       channelLogo: "/logo/logo.png",
//       channelName: item.snippet.channelTitle,
//       views: `${(Math.random() * 100).toFixed(1)}K views`,
//       uploadedAt: `${Math.floor(Math.random() * 10) + 1} days ago`,
//       length: `${Math.floor(Math.random() * 10) + 1}:${String(
//         Math.floor(Math.random() * 60)
//       ).padStart(2, "0")}`,
//     }));

//     return NextResponse.json(videos);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Failed to fetch YouTube data" },
//       { status: 500 }
//     );
//   }
// }


// /app/api/youtube/route.ts 呼叫第二次取得channel logo
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const searchQuery = searchParams.get("q") || "trending";

  const API_KEY = process.env.YOUTUBE_API_KEY!;
  const MAX_RESULTS = 12;

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&part=snippet&q=${encodeURIComponent(
    searchQuery
  )}&order=relevance&maxResults=${MAX_RESULTS}`;

  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  // 🔥 接下來要再打 channels API 拿到頭像
  const videos = await Promise.all(
    searchData.items.map(async (item: any, idx: number) => {
      const channelId = item.snippet.channelId;

      // 🔥 再拿 channel logo
      const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`;
      const channelRes = await fetch(channelUrl);
      const channelData = await channelRes.json();
      const channelLogo =
        channelData.items[0].snippet.thumbnails.default.url;

      return {
        id: item.id.videoId || `vid-${idx}`,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelLogo,
        channelName: item.snippet.channelTitle,
        views: `${(Math.random() * 100).toFixed(1)}K views`,
        uploadedAt: `${Math.floor(Math.random() * 10) + 1} days ago`,
        length: `${Math.floor(Math.random() * 10) + 1}:${String(
          Math.floor(Math.random() * 60)
        ).padStart(2, "0")}`,
      };
    })
  );

  return NextResponse.json(videos);
}
