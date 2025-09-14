import { useMemo } from "react";
import { useRateCommunityFeedViewModel } from "./rate-community-feed-view-model";
import { useRateCommunityFilterViewModel } from "./rate-community-filter-view-model";
import type { HumanReviewCardDTO } from "./types";

type LabelBucket = { label: string; normLabel: string; languages: string[] };
const norm = (s?: string | null) => String(s ?? "").trim().toLowerCase();

function applyClientFilters(
  list: HumanReviewCardDTO[],
  params: {
    reviewState: "all" | "reviewed" | "unreviewed";
    selectedTags: string[];
    keyword: string; // keyword 也順便在本地再過一次，縮小結果；但是否命中仍由後端決定資料來源
  }
) {
  const { reviewState, selectedTags, keyword } = params;
  const kw = norm(keyword);

  return list.filter((it) => {
    if (reviewState === "reviewed" && !it.reviewedByMe) return false;
    if (reviewState === "unreviewed" && it.reviewedByMe) return false;

    if (selectedTags.length) {
      const itemTagSet = new Set((it.tags ?? []).map((t) => norm(t.label)));
      const hit = selectedTags.some((t) => itemTagSet.has(t));
      if (!hit) return false;
    }

    if (kw) {
      const titleHit = norm(it.titles[0]).includes(kw);
      const channelHit = norm(it.channel_name).includes(kw);
      const tagHit = (it.tags ?? []).some((t) => norm(t.label).includes(kw));
      if (!titleHit && !channelHit && !tagHit) return false;
    }

    return true;
  });
}

function sortClient(list: HumanReviewCardDTO[], sort: "latest" | "trending") {
  const copy = [...list];
  if (sort === "latest") {
    copy.sort((a, b) => {
      const ta = new Date(a.created_at ?? 0).getTime();
      const tb = new Date(b.created_at ?? 0).getTime();
      return tb - ta;
    });
  } else {
    copy.sort((a, b) => {
      const sa =
        (a.view_count ?? 0) * 0.5 +
        (a.like_count ?? 0) * 3 +
        (a.rate_count ?? 0) * 4;
      const sb =
        (b.view_count ?? 0) * 0.5 +
        (b.like_count ?? 0) * 3 +
        (b.rate_count ?? 0) * 4;
      return sb - sa;
    });
  }
  return copy;
}

function buildAllTags(items: HumanReviewCardDTO[]): LabelBucket[] {
  const map = new Map<string, LabelBucket>();
  for (const it of items ?? []) {
    for (const t of it.tags ?? []) {
      const n = norm(t.label);
      const bucket = map.get(n);
      if (!bucket) {
        map.set(n, { label: t.label, normLabel: n, languages: [t.language] });
      } else if (!bucket.languages.includes(t.language)) {
        bucket.languages.push(t.language);
      }
    }
  }
  return Array.from(map.values());
}

/**
 * 組合 VM：不新增 store，不修改既有 VM，
 * 只負責把 Feed VM + Filter VM 的狀態合成「可見清單」與 tags 聚合。
 */
export function useRateCommunityListVM() {
  const feed = useRateCommunityFeedViewModel();    // items, loadMore, markReviewed...
  const filter = useRateCommunityFilterViewModel(); // tags, keyword, sort, reviewState...

  // allTags 來自「原始桶 items」，會隨 loadMore 擴充
  const allTags = useMemo(() => buildAllTags(feed.items), [feed.items]);

  // 本地可見清單（完全不打 API）
  const visibleItems = useMemo(() => {
    const filtered = applyClientFilters(feed.items, {
      reviewState: filter.reviewState,
      selectedTags: filter.tags,
      keyword: filter.keyword,
    });
    return sortClient(filtered, filter.sort);
  }, [feed.items, filter.reviewState, filter.tags, filter.keyword, filter.sort]);

  const ratedThumbnails = useMemo(
    () => visibleItems.filter((x) => x.reviewedByMe),
    [visibleItems]
  );
  const unratedThumbnails = useMemo(
    () => visibleItems.filter((x) => !x.reviewedByMe),
    [visibleItems]
  );

  return {
    // 展示資料
    allTags,
    visibleItems,
    ratedThumbnails,
    unratedThumbnails,

    // 從兩個 VM 直接透出你會用到的狀態與動作（方便頁面層）
    loadingInitial: feed.loadingInitial,
    loadingMore: feed.loadingMore,
    hasNext: feed.hasNext,
    loadMore: feed.loadMore,
    markReviewed: feed.markReviewed,

    keyword: filter.keyword,
    tags: filter.tags,
    sort: filter.sort,
    reviewState: filter.reviewState,

    // filter 動作
    setKeywordDebounced: filter.setKeywordDebounced,
    setSort: filter.setSort,
    addTag: filter.addTag,
    removeTag: filter.removeTag,
    clearTags: filter.clearTags,
    resetFilters: filter.resetFilters,
  };
}
