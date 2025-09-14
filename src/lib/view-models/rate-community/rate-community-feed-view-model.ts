// lib/view-models/rate-community/rate-community-feed-view-model.ts
import { useCallback } from "react";
import type { HumanReviewCardDTO } from "./types";
import { useRateCommunityFeedStore } from "@/lib/global-store/rate-community-store/rate-community-feed-store";
import { createIDBStore } from "@/lib/idb/local-idb";

// ====== IDB ======
const DB_NAME = "rate-community-db";
const FEED_STORE = "feed-cache";

// 快取版本（資料結構變更時 +1，自動與舊桶隔離）
const FEED_VERSION = 1;

// 快取策略（目前僅用到 MAX_BUCKET_ITEMS，TTL 可視需求開啟）
const MAX_BUCKET_ITEMS = 200;

type FeedCachePayload = {
  items: HumanReviewCardDTO[];
  cursor: string | null;
  version: number;
  updatedAt: number; // epoch ms
};

const FeedIDB = createIDBStore<FeedCachePayload>(FEED_STORE, DB_NAME, 4);

function mergeUniqueById(base: HumanReviewCardDTO[], next: HumanReviewCardDTO[]) {
  const seen = new Set<string>();
  const res: HumanReviewCardDTO[] = [];
  for (const it of [...base, ...next]) {
    const id = it.public_id;
    if (!seen.has(id)) {
      seen.add(id);
      res.push(it);
    }
  }
  return res;
}

function trimToMax(list: HumanReviewCardDTO[], cap = MAX_BUCKET_ITEMS) {
  if (list.length <= cap) return list;
  return list.slice(0, cap);
}

async function readIDB(queryHash: string) {
  return await FeedIDB.get(queryHash);
}

async function writeIDB(queryHash: string, payload: FeedCachePayload) {
  await FeedIDB.set(queryHash, payload);
}

function parseQueryHash(queryHash: string): {
  channel: string | null;
  keyword: string | null;
  locale: string | null;
} {
  const parts = queryHash.split("|");
  const out: Record<string, string> = {};
  for (const p of parts) {
    const i = p.indexOf("=");
    if (i > -1) {
      const k = p.slice(0, i);
      const v = p.slice(i + 1);
      out[k] = v;
    } else if (!out["version"]) {
      out["version"] = p;
    }
  }
  const q = out["q"];
  const keyword = q && q.trim() !== "" ? q : null;
  return {
    channel: out["ch"] ?? null,
    keyword,
    locale: out["loc"] ?? null,
  };
}

// ====== API：接你的 RPC / Route Handler ======
async function fetchFeedPage(params: {
  queryHash: string;
  cursor: string | null;
  limit: number;
}): Promise<{ items: HumanReviewCardDTO[]; cursor: string | null }> {

  const { queryHash, cursor, limit } = params;
  const parsed = parseQueryHash(queryHash);

  const body = {
    locale: parsed.locale ?? undefined,
    sourceChannel: parsed.channel ?? undefined,
    keyword: parsed.keyword ?? undefined,  // ← null 會變成 undefined，不出現在 JSON
    limit,
    cursor,
  };
  console.log("calling API", queryHash);

  const res = await fetch("/api/rate-community/getfeed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`fetchFeedPage failed: ${res.status}`);
  const json = await res.json();
  if (!json?.success) throw new Error(json?.message ?? "fetchFeedPage failed");

  const data = json.data as { items: HumanReviewCardDTO[]; next_cursor: string | null };
  return { items: data.items ?? [], cursor: data.next_cursor ?? null };
}

// ====== ViewModel（穩定引用版）======
export function useRateCommunityFeedViewModel() {
  // 只讀 state（這些不是 callback，不影響穩定性）
  const {
    items,
    cursor,
    hasNext,
    loadingInitial,
    loadingMore,
    error,
  } = useRateCommunityFeedStore();

  // ✅ 穩定版 hydrate：用 getState() 讀寫，引用不變
  const hydrate = useCallback(
    async (
      initial: { items: HumanReviewCardDTO[]; cursor: string | null },
      fromKey: string,
      querykey: string
    ) => {
      const st = useRateCommunityFeedStore.getState();
      st.replaceAll(initial.items ?? [], initial.cursor ?? null);
      st.setCounts(initial.items ?? []);
      st.setLastQueryHash(querykey);

      if (fromKey) {
        await FeedIDB.set(fromKey, {
          items: initial.items ?? [],
          cursor: initial.cursor ?? null,
          version: FEED_VERSION,
          updatedAt: Date.now(),
        });
      }
    },
    []
  );

  // ✅ 穩定版 loadInitial：用 getState()，引用不變
  /**
   * 首屏固定張數，下面接infinite scroll的loadmore
   */
  const loadInitial = useCallback(
    async ({ queryHash, limit }: { queryHash: string; limit?: number }) => {
      console.log("query hash", queryHash);
      const feedstore = useRateCommunityFeedStore.getState();
      const effectiveLimit = limit ?? feedstore.limit;

      if (feedstore.lastQueryHash !== queryHash) {
        feedstore.resetForNewQuery(queryHash); // 清空並切 hash
      } else {
        feedstore.setError(undefined);
        feedstore.setLoadingInitial(true); // 同 hash 保留畫面，只顯示 loading
      }

      try {
        // 1) IDB local-first（只有在剛切換 hash 且畫面空時使用）
        const cached = await readIDB(queryHash);
        console.log("cached feed", cached, "queryHash", queryHash)
        if (cached?.items?.length && feedstore.lastQueryHash !== queryHash) {
          feedstore.replaceAll(cached.items, cached.cursor ?? null);
          feedstore.setCounts(cached.items);
          feedstore.setLastQueryHash(queryHash);
        }

        // 2) RPC 首頁
        const fresh = await fetchFeedPage({
          queryHash,
          cursor: null,
          limit: effectiveLimit,
        });

        const merged = mergeUniqueById([], fresh.items);
        feedstore.replaceAll(merged, fresh.cursor);
        feedstore.setCounts(merged);
        feedstore.setLastQueryHash(queryHash);

        await writeIDB(queryHash, {
          items: merged,
          cursor: fresh.cursor,
          version: FEED_VERSION,
          updatedAt: Date.now(),
        });
      } catch (error: any) {
        feedstore.setError(error?.message ?? "Failed to load feed");
      } finally {
        feedstore.setLoadingInitial(false);
      }
    },
    []
  );

  // ✅ 穩定版 loadMore
  const loadMore = useCallback(async () => {
    const feedstore = useRateCommunityFeedStore.getState();
    if (!feedstore.hasNext || feedstore.loadingMore || !feedstore.lastQueryHash) return;

    feedstore.setLoadingMore(true);
    try {
      const nextPage = await fetchFeedPage({
        queryHash: feedstore.lastQueryHash,
        cursor: feedstore.cursor,
        limit: feedstore.limit,
      });

      const merged = trimToMax(mergeUniqueById(feedstore.items, nextPage.items));
      feedstore.setItems(merged);
      feedstore.setCursor(nextPage.cursor);
      feedstore.setHasNext(!!nextPage.cursor);
      feedstore.setCounts(merged);

      await writeIDB(feedstore.lastQueryHash, {
        items: merged,
        cursor: nextPage.cursor,
        version: FEED_VERSION,
        updatedAt: Date.now(),
      });
    } catch (error: any) {
      feedstore.setError(error?.message ?? "Failed to load more");
    } finally {
      feedstore.setLoadingMore(false);
    }
  }, []);

  // ✅ 穩定版 markReviewed
  const markReviewed = useCallback(async (public_id: string) => {
    const feedStore = useRateCommunityFeedStore.getState();

    // 1) 樂觀更新
    feedStore.markReviewedInState(public_id);

    // 2) 更新當前桶
    if (feedStore.lastQueryHash) {
      try {
        const bucket = await readIDB(feedStore.lastQueryHash);
        if (bucket?.items?.length) {
          const patched = bucket.items.map((it) =>
            it.public_id === public_id ? { ...it, reviewedByMe: true } : it
          );
          await writeIDB(feedStore.lastQueryHash, {
            items: patched,
            cursor: bucket.cursor ?? null,
            version: FEED_VERSION,
            updatedAt: Date.now(),
          });
        }
      } catch {
        // 忽略快取錯誤
      }
    }

    // 3) TODO: 呼叫評分 RPC，失敗可回滾
  }, []);

  // ✅ 穩定版 invalidate
  const invalidateVM = useCallback(() => {
    useRateCommunityFeedStore.getState().invalidate();
  }, []);

  // 可選：透過 hook 讀 setter（或直接提供一個封裝）
  const setLimit = useCallback((n: number) => {
    useRateCommunityFeedStore.getState().setLimit(n);
  }, []);

  return {
    // state（給 UI）
    items,
    cursor,
    hasNext,
    loadingInitial,
    loadingMore,
    error,

    // actions（穩定引用）
    hydrate,
    loadInitial,
    loadMore,
    markReviewed,
    invalidate: invalidateVM,
    

    // 可選：參數控制
    setLimit,
  };
}
