import { NextResponse } from "next/server";
import { FetchHumanReviewsFeedAction } from "@/actions/supabase/supabase-human-reviews";

const norm = (s?: string | null) => {
  const t = typeof s === "string" ? s.trim() : "";
  return t.length ? t : null;
};


export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("body", body);

    // 直接轉給你的 Server Action
    const res = await FetchHumanReviewsFeedAction({
      locale: norm(body.locale),            // '' -> null
      sourceChannel: norm(body.sourceChannel), // '' -> null
      search_tags: Array.isArray(body.search_tags) && body.search_tags.length ? body.search_tags : null,
      keyword: norm(body.keyword),          // '  ' -> null
      sort: body.sort ?? "latest",
      limit: typeof body.limit === "number" ? body.limit : 24,
      cursor: body.cursor ?? null,
    });
    console.log("FetchHumanReviewsFeedAction", res.data?.items[0]);
    if (!res.success) {
      return NextResponse.json({ success: false, message: res.message ?? "fetch failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: res.data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message ?? "server error" }, { status: 500 });
  }
}
