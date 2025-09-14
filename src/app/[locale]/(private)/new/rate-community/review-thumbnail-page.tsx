"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HumanReviewCard } from "./rate-thumbnail-card";
import { CachedTranslation } from "@/lib/idb/translation-idb";
import { useTranslationViewModel } from "@/lib/view-models/use-translation-view-model";
import { HumanReviewCardDTO } from "@/lib/view-models/rate-community/types";

// VMs
import { useRateCommunityFilterViewModel } from "@/lib/view-models/rate-community/rate-community-filter-view-model";
import { useRateCommunityFeedViewModel } from "@/lib/view-models/rate-community/rate-community-feed-view-model";
import { useRateCommunityListVM } from "@/lib/view-models/rate-community/rate-community-list-view-model";

interface Props {
  initialTranslation?: CachedTranslation;
  initialFeed?: {
    items: HumanReviewCardDTO[];
    nextCursor: string | null;
    storageKey: string;
  } | null;
}

// --- Skeleton：與原本 tags 的圓角 pill 大小一致，避免版面跳動 ---
function TagSkeletonRow({ count = 10 }: { count?: number }) {
  // 模擬不同寬度的 tag，視覺更自然
  const widths = [56, 72, 64, 88, 60, 80, 70, 90, 66, 76];
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-8 rounded-full border border-gray-300 bg-gray-100 animate-pulse"
          style={{ width: widths[i % widths.length] }}
          aria-hidden
        />
      ))}
    </div>
  );
}

export default function ReviewThumbnailsPage({ initialTranslation, initialFeed }: Props) {
  const router = useRouter();
  const pageId = "review_community_page";
  const { locale } = useParams() as { locale: string };
  const { translation, hydrateTranslation } = useTranslationViewModel(pageId, locale);

  useEffect(() => {
    if (initialTranslation) {
      hydrateTranslation(initialTranslation.content, initialTranslation.version);
    }
  }, [initialTranslation, hydrateTranslation]);

  // ---------- 組合 VM：提供渲染所需清單、tags 與本地操作 ----------
  const {
    allTags,
    ratedThumbnails,
    unratedThumbnails,
    loadingInitial,
    loadingMore,
    hasNext,
    loadMore,
    markReviewed,

    keyword,
    tags: selectedTags,
    setKeywordDebounced,
    setSort,
    addTag,
    removeTag,
    clearTags,
    resetFilters,
  } = useRateCommunityListVM();

  // ---------- Filter VM：提供 setLocale / getQueryKey / 來源參數 ----------
  const {
    setLocale,            // 寫入 locale 以切割快取桶
    getQueryKey,          // 只含 ch + q + loc
    sourceChannel,        // 組 queryKey 依賴用
    locale: filterLocale, // 組 queryKey 依賴用
    setKeywordRaw
  } = useRateCommunityFilterViewModel();

  // ---------- Feed VM：提供 hydrate / loadInitial ----------
  const { hydrate, loadInitial } = useRateCommunityFeedViewModel();

  // 將 route 的 locale 寫回 Filter（讓 queryKey 裡的 loc 正確）
  useEffect(() => {
    setLocale(locale);
  }, [locale, setLocale]);

  // ✅ 只依賴「會打 API 的三個變數」：sourceChannel + filterLocale + keyword
  const queryKey = useMemo(
    () => getQueryKey(),
    [sourceChannel, filterLocale, keyword]
  );

  const hydratedOnceRef = useRef(false);
  const lastLoadedHashRef = useRef<string | null>(null);

  // 首屏 hydrate / loadInitial（避免雙發）
  useEffect(() => {
    const canHydrate =
      !!initialFeed &&
      initialFeed.storageKey === queryKey &&
      !hydratedOnceRef.current;

    if (canHydrate) {
      hydratedOnceRef.current = true;
      lastLoadedHashRef.current = queryKey;
      hydrate(
        { items: initialFeed!.items, cursor: initialFeed!.nextCursor },
        queryKey, // store 的 queryKey
        queryKey  // IDB key
      );
      return;
    }

    // 避免重複拉相同 hash
    if (lastLoadedHashRef.current === queryKey) return;
    lastLoadedHashRef.current = queryKey;

    loadInitial({ queryHash: queryKey ?? "", limit: 24 });
  }, [queryKey, initialFeed, hydrate, loadInitial]);

  const [searchInput, setSearchInput] = useState(keyword ?? "");
  // 若外部（例如 hydrate）改了 keyword，把輸入框同步一下
  useEffect(() => {
    setSearchInput(keyword ?? "");
  }, [keyword]);

  const submitSearch = () => {
    const q = (searchInput || "").trim();
    setKeywordRaw(q);
    // effect 會因 queryKey 變動而觸發載入
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitSearch();
    }
  };

  // ---- 無限捲動 Sentinel ----
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    console.log("scrolling down sentinel")
    const el = sentinelRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible && hasNext && !loadingMore) loadMore();
      },
      { rootMargin: "600px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNext, loadingMore, loadMore]);

  // ---- 其它行為 ----
  const handleGallery = (id: string) => {
    router.push("/helpothers");
  };
  
  const handleReviewSubmit = (id: string, rating: number) => {
    // 樂觀更新（卡片會立即顯示 Rated）
    markReviewed(id);
    console.log("Submit review:", id, rating);
  };

  // ---- UI 綁定 ----
  const setSortLatest = () => setSort("latest");
  const setSortTrending = () => setSort("trending");
  const toggleTag = (normLabel: string) => {
    if (selectedTags.includes(normLabel)) removeTag(normLabel);
    else addTag(normLabel);
  };

  // 固定控制列與 Tags 區塊的高度，避免載入中高度改變造成閃跳
  // - 控制列大約 44~48px，設 min-h-[56px] 留一點空間
  // - Tags 可能一行 ~ 2 行，設 min-h-[48px]；若你常出現兩行，可改成 min-h-[96px]
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {translation?.page_header?.translation || "Review Community"}
      </h1>

      {/* Sort + Search（固定高度區） */}
      <div className="flex items-center space-x-4 mb-6 min-h-[56px]">
        <button
          onClick={setSortTrending}
          className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          {translation?.trending_button?.translation || "Trending"}
        </button>
        <button
          onClick={setSortLatest}
          className="px-4 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          {translation?.latest_button?.translation || "Latest"}
        </button>

        <div className="relative w-full flex gap-2">
          <input
            type="text"
            placeholder={translation?.search_bar?.translation || "Search Title / Channel Name / Tags"}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={onSearchKeyDown}
            className="px-3 py-1 border rounded w-full focus:ring focus:ring-blue-200 transition"
          />
          <Button onClick={submitSearch}>
            {translation?.search_button?.translation || "Search"}
          </Button>
        </div>

        <Button variant="outline" className="text-sm" onClick={resetFilters}>
          {translation?.reset_button?.translation || "Reset"}
        </Button>
      </div>

      {/* Tags（固定高度區 + Skeleton） */}
      <div className="mb-6 min-h-[48px]">
        {loadingInitial && allTags.length === 0 ? (
          <TagSkeletonRow />
        ) : (
          <div className="flex flex-wrap gap-2">
            {allTags.map((t) => {
              const selected = selectedTags.includes(t.normLabel);
              return (
                <button
                  key={t.normLabel}
                  onClick={() => toggleTag(t.normLabel)}
                  className={`px-3 py-1 rounded-full border transition
                    ${selected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                    }`}
                  title={t.languages.length ? `languages: ${t.languages.join(", ")}` : undefined}
                >
                  {t.label}
                  {t.languages.length > 1 && (
                    <span className="ml-1 text-xs text-gray-500">({t.languages.length})</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Your Questionaire（從本地可見清單拆 rated） */}
      {ratedThumbnails.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold mb-4">
            {translation?.your_questinaire_section?.translation || "Your Questionaire"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 opacity-70">
            {ratedThumbnails.map((thumb) => (
              <HumanReviewCard
                key={thumb.public_id + "-rated"}
                thumb={thumb as any}
                onGallery={handleGallery}
                onSubmitReview={() => handleReviewSubmit(thumb.public_id, 5)}
                reviewed={true}
                translation={translation!}
              />
            ))}
          </div>
        </div>
      )}

      {/* Review Cards（從本地可見清單拆 unrated） */}
      <div className="mt-10">
        <h2 className="text-lg font-bold mb-4">
          {translation?.review_others_section?.translation || "Rate Others"}
        </h2>

        {loadingInitial ? (
          <p>{translation?.loading?.translation || "Loading..."}</p>
        ) : unratedThumbnails.length === 0 ? (
          <p>
            {translation?.no_thumbnails_found?.translation || "No thumbnails matching the search critiera"}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {unratedThumbnails.map((thumb) => (
              <HumanReviewCard
                key={thumb.public_id}
                thumb={thumb as any}
                onGallery={handleGallery}
                onSubmitReview={() => handleReviewSubmit(thumb.public_id, 5)}
                reviewed={false}
                translation={translation!}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reviewed By You */}
      {ratedThumbnails.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold mb-4">
            {translation?.reviewed_by_you_section?.translation || "Reviewed By You"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 opacity-70">
            {ratedThumbnails.map((thumb) => (
              <HumanReviewCard
                key={thumb.public_id + "-rated2"}
                thumb={thumb as any}
                onGallery={handleGallery}
                onSubmitReview={() => handleReviewSubmit(thumb.public_id, 5)}
                reviewed={true}
                translation={translation!}
              />
            ))}
          </div>
        </div>
      )}

      {/* 無限捲動 sentinel */}
      <div ref={sentinelRef} />
    </div>
  );
}
