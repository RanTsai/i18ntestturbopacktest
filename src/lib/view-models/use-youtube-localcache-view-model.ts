"use client";

import { useCallback, useEffect, useMemo } from "react";
import { YoutubeVideo } from "@/lib/schema/youtube-video-schema";
import { useYoutubeLocalCacheStore } from "@/lib/global-store/use-youtube-localcache-store";
import { createIDBStore } from "@/lib/idb/local-idb";

// ✅ 監聽外部 store（標題、頻道）
import { useVideoSettingViewModel } from "@/lib/view-models/use-video-setting-view-model";
import { useUserChannelViewModel } from "@/lib/view-models/use-user-channel-view-model";

const videoIDB = createIDBStore<{ videos: YoutubeVideo[]; shorts: YoutubeVideo[] }>(
  "videoSearch",
  "YoutubeLocalCacheVideos"
);

const shallowEqArr = (a: YoutubeVideo[], b: YoutubeVideo[]) =>
  a === b || (a?.length === b?.length && a.every((v, i) => v === b[i]));

// sessionStorage keys
const baselineKey = (term: string) => `baselineVideos:${term}`;
const remixFlagKey = (term: string) => `remixFlag:${term}`;
// ✅ 追蹤這次 Remix 產生的「假影片 id 列表」——之後更新 meta 時只改這些
const fakeIdsKey = (term: string) => `remixFakeIds:${term}`;

const saveBaseline = (term: string, videos: YoutubeVideo[]) => {
  if (!term) return;
  sessionStorage.setItem(baselineKey(term), JSON.stringify(videos));
};
const loadBaseline = (term: string): YoutubeVideo[] | null => {
  if (!term) return null;
  const raw = sessionStorage.getItem(baselineKey(term));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as YoutubeVideo[];
  } catch {
    return null;
  }
};
const clearBaseline = (term: string) => {
  if (!term) return;
  sessionStorage.removeItem(baselineKey(term));
};

const setRemixFlag = (term: string, v: boolean) => {
  if (!term) return;
  sessionStorage.setItem(remixFlagKey(term), v ? "1" : "0");
};
const getRemixFlag = (term: string) => {
  if (!term) return false;
  return sessionStorage.getItem(remixFlagKey(term)) === "1";
};
const clearRemixFlag = (term: string) => {
  if (!term) return;
  sessionStorage.removeItem(remixFlagKey(term));
};

// ✅ 假影片 id 列表的存取
const saveFakeIds = (term: string, ids: string[]) => {
  if (!term) return;
  sessionStorage.setItem(fakeIdsKey(term), JSON.stringify(ids));
};
const loadFakeIds = (term: string): string[] => {
  if (!term) return [];
  const raw = sessionStorage.getItem(fakeIdsKey(term));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
};
const clearFakeIds = (term: string) => {
  if (!term) return;
  sessionStorage.removeItem(fakeIdsKey(term));
};

export function useYoutubeVideosVM() {
  const {
    videos,
    shortVideos,
    lastSearchTerm,
    setVideos,
    setShortVideos,
    clearVideos,
  } = useYoutubeLocalCacheStore();

  // ✅ 監聽「標題 / 頻道」的來源 store
  const { title: storeTitle } = useVideoSettingViewModel();
  const { selectedChannel } = useUserChannelViewModel();

  // 目前搜尋詞（避免 undefined）
  const term = (lastSearchTerm || "").trim();

  const TARGET_COUNT = 12;
  const isRemixed = useMemo(() => getRemixFlag(term), [term]);

  // --- 搜尋（沿用你的流程） ---
  const fetchVideos = useCallback(
    async (input: string): Promise<{ videos: YoutubeVideo[]; shorts: YoutubeVideo[] }> => {
      const keyword = input.trim();
      if (!keyword) return { videos: [], shorts: [] };

      // 新 term：清掉 remix 狀態與 baseline、fakeIds
      if (lastSearchTerm && lastSearchTerm !== keyword) {
        clearRemixFlag(lastSearchTerm);
        clearBaseline(lastSearchTerm);
        clearFakeIds(lastSearchTerm);
        await videoIDB.clear();
        clearVideos();
      }

      // 1) store
      if (lastSearchTerm === keyword && (videos.length > 0 || shortVideos.length > 0)) {
        if (!getRemixFlag(keyword)) saveBaseline(keyword, videos);
        return { videos, shorts: shortVideos };
      }

      // 2) IDB
      const fromIDB = await videoIDB.get(keyword);
      if (fromIDB && (fromIDB.videos.length > 0 || fromIDB.shorts.length > 0)) {
        setVideos(keyword, fromIDB.videos);
        setShortVideos(keyword, fromIDB.shorts);
        clearRemixFlag(keyword);
        clearFakeIds(keyword);
        saveBaseline(keyword, fromIDB.videos);
        return fromIDB;
      }

      // 3) API
      const [resVideos, resShorts] = await Promise.all([
        fetch(`/api/youtube?q=${encodeURIComponent(keyword)}`),
        fetch(`/api/youtubeshorts?q=${encodeURIComponent(keyword)}`),
      ]);

      const videosData = (await resVideos.json()) as YoutubeVideo[];
      const shortsData = (await resShorts.json()) as YoutubeVideo[];

      //console.log("videosData", videosData);
      setVideos(keyword, videosData);
      setShortVideos(keyword, shortsData);
      videoIDB.set(keyword, { videos: videosData, shorts: shortsData }).catch(console.error);

      clearRemixFlag(keyword);
      clearFakeIds(keyword);
      saveBaseline(keyword, videosData);

      return { videos: videosData, shorts: shortsData };
    },
    [lastSearchTerm, videos, shortVideos, setVideos, setShortVideos, clearVideos]
  );

  // --- Remix：固定 12 張 + 從 baseline 重組，並記錄這批 fake 的 id ---
  const remixWithImages = useCallback(
    (
      imageUrls: string[],
      channelLogo: string,
      channelName: string,
      title: string,
      opts?: { max?: number }
    ) => {
      const max = opts?.max ?? 4;
      if (!term) return;

      const base = (loadBaseline(term) ?? videos)?.filter(
        (v) => !v.id?.startsWith?.("fake-")
      ) || [];
      if (base.length === 0) return;

      const fakeCount = Math.max(1, Math.min(max, imageUrls.length, TARGET_COUNT));

      const fakes: YoutubeVideo[] = imageUrls.slice(0, fakeCount).map((url, i) => ({
        id: `fake-${i}-${Date.now()}`,
        thumbnail: url,
        title,
        channelName,
        channelLogo,
        length: "3:00",
        views: "1m views",
        uploadedAt: "just now",
      })) as YoutubeVideo[];

      const realNeeded = Math.max(0, TARGET_COUNT - fakes.length);

      // shuffle base
      const realPool = [...base];
      for (let i = realPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [realPool[i], realPool[j]] = [realPool[j], realPool[i]];
      }

      const selectedReals = realPool.slice(0, realNeeded);

      // 隨機插入 fakes
      const mixed = [...selectedReals];
      fakes.forEach((fake) => {
        const idx = Math.floor(Math.random() * (mixed.length + 1));
        mixed.splice(idx, 0, fake);
      });

      // 補足 / 裁切到 12
      if (mixed.length < TARGET_COUNT) {
        const remainReals = realPool.slice(realNeeded);
        mixed.push(...remainReals.slice(0, TARGET_COUNT - mixed.length));
      }
      if (mixed.length > TARGET_COUNT) mixed.length = TARGET_COUNT;

      // ✅ 記錄這次 fake 的 id（之後只更新這些）
      const ids = fakes.map((f) => f.id as string);
      saveFakeIds(term, ids);

      setVideos(term, mixed);
      setRemixFlag(term, true);

      if (!loadBaseline(term)) saveBaseline(term, base);
    },
    [term, videos, setVideos]
  );

  // --- Reset：回到未 Remix（並清除 fakeIds）
  const resetRemix = useCallback(() => {
    if (!term) return;
    const baseline = loadBaseline(term);
    if (!baseline) return;
    setVideos(term, baseline);
    clearRemixFlag(term);
    clearFakeIds(term);
  }, [term, setVideos]);

  // --- 首次掛載：還原 store + baseline
  useEffect(() => {
    if (!term) return;
    (async () => {
      const cached = await videoIDB.get(term);
      if (cached && (cached.videos.length > 0 || cached.shorts.length > 0)) {
        setVideos(term, cached.videos);
        setShortVideos(term, cached.shorts);
        if (!getRemixFlag(term)) {
          saveBaseline(term, cached.videos);
          clearFakeIds(term);
        }
      }
    })();
  }, [term, setVideos, setShortVideos]);

  // ✅ 關鍵：監聽「標題 / 頻道」變更，只更新 fake 影片的 meta
  useEffect(() => {
    if (!term) return;
    if (!isRemixed) return;            // 只有在 Remix 狀態才需要同步
    if (!videos?.length) return;

    const fakeIds = new Set(loadFakeIds(term)); // 只改這批
    if (fakeIds.size === 0) return;

    const nextTitle = (storeTitle || "").trim();
    const nextChannelName = selectedChannel?.channel_name ?? "";
    const nextChannelLogo = selectedChannel?.logo ?? "";

    // 若三者都沒有變化就不處理
    let changed = false;
    const next = videos.map((v) => {
      if (!fakeIds.has(v.id as string)) return v;

      const nv: YoutubeVideo = {
        ...v,
        title: nextTitle || v.title,
        channelName: nextChannelName || v.channelName,
        channelLogo: nextChannelLogo || v.channelLogo,
      };

      if (
        nv.title !== v.title ||
        nv.channelName !== v.channelName ||
        nv.channelLogo !== v.channelLogo
      ) {
        changed = true;
      }
      return nv;
    });

    if (changed && !shallowEqArr(videos, next)) {
      setVideos(term, next);
    }
  }, [storeTitle, selectedChannel, isRemixed, setVideos, term, videos]);

  return {
    // 狀態
    term,
    videos,
    shortVideos,
    isRemixed,
    lastSearchTerm,

    // 動作
    fetchVideos,
    remixWithImages,
    resetRemix,
  };
}
