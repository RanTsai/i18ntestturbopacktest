"use server";

import React from "react";
import ReviewThumbnailsPage from "./review-thumbnail-page";
import { FetchHumanReviewsFeedAction } from "@/actions/supabase/supabase-human-reviews";

export default async function Page({ params }: { params: { locale: string } }) {
  const locale = await params.locale ?? "en";
  const sort = "latest" as const; // 與前端 Filter 預設一致
  const limit = 24;

  const result = await FetchHumanReviewsFeedAction({
    locale,
    sort,
    limit,
    cursor: null,
    // 其它條件（sourceChannel / tags / keyword / reviewState ...）如有預設可以一起傳
  });

  // 建立與前端 getQueryHash 對齊的首屏 hash：
  const storageKey = `ch=${""}|q=${""}|loc=${locale}`
  // 直接把 Server Action 回傳（已是 HumanReviewCardDTO[]）塞進 props
  const initialFeed =
    result.success && result.data
      ? {
        items: result.data.items,                // HumanReviewCardDTO[]
        nextCursor: result.data.next_cursor,     // string | null
        storageKey,
      }
      : null;

  return (
    <div>
      <ReviewThumbnailsPage initialFeed={initialFeed} />
    </div>
  );
}
