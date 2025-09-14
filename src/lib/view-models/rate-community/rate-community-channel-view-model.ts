// lib/view-models/rate-community/rate-community-channel-view-model.ts
"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { ChannelGroup, ChannelSummary } from "./types";

import { GetFollowingChannelsFromSupabase } from "@/actions/supabase/supabase_following_channel";
import { IFollowingChannel } from "@/lib/schema/human-review-schema";

import { useUserChannelViewModel } from "@/lib/view-models/use-user-channel-view-model";
import type { IUserChannel } from "@/lib/schema/user-channel-schema";

import { createIDBStore } from "@/lib/idb/local-idb";

// ✅ 1) 統一全專案共用的 DB 名與版本（與 feed 等其它地方保持一致）
const IDB_DB_NAME = "rate-community-db";
const IDB_VERSION = 4; // ← 請確認其他地方也都是 4
const FOLLOWING_STORE = "following-channels";

interface FollowingCachePayload {
  items: IFollowingChannel[];
  updatedAt: number;
  version: number;
}
const FollowingIDB = createIDBStore<FollowingCachePayload>(
  FOLLOWING_STORE,
  IDB_DB_NAME,
  IDB_VERSION
);

// ===== 小工具 =====
const toSummary = (name: string, logo: string, platform?: string | null): ChannelSummary => ({
  channel_name: name,
  logo,
  platform: platform ?? null,
});
const mapFollowingToSummary = (list: IFollowingChannel[]): ChannelSummary[] =>
  list.map((x) => toSummary(x.channel_name, x.logo, x.platform));
const mapUserChannelsToSummary = (list: IUserChannel[]): ChannelSummary[] =>
  list.map((c) => toSummary(c.channel_name, c.logo, (c as any).platform ?? null));
const dedupeByName = (arr: ChannelSummary[]) => {
  const seen = new Set<string>();
  return arr.filter((x) => (seen.has(x.channel_name) ? false : (seen.add(x.channel_name), true)));
};

// ===== Store（純狀態）=====
interface RateCommunityChannelState {
  // Data
  myChannels: ChannelSummary[];
  followingChannels: ChannelSummary[];
  exploreChannels: ChannelSummary[];

  // UI / Selection
  activeGroup: ChannelGroup;
  selectedChannelName: string | null;

  // Loading
  loading: boolean;
  error?: string;

  // Actions
  ensureLoaded: () => Promise<void>;
  refreshFollowing: () => Promise<void>;
  select: (group: ChannelGroup, channelName: string | null) => void;

  // 外部（MyChannel VM）同步入口：只同步清單，不同步 selection
  __setMyChannelsFromExternal: (items: ChannelSummary[]) => void;

  // Internal
  __sourceListeners: Array<(name: string | null) => void>;
  __inFlight: boolean;
  __loadedAt?: number;

  // Local-first helpers（following）
  __getCacheKey: () => string;
  __hydrateFollowingFromIDB: (key: string) => Promise<boolean>;
  __writeFollowingToIDB: (key: string, items: IFollowingChannel[]) => Promise<void>;
}

export const useRateCommunityChannelStore = create<RateCommunityChannelState>((set, get) => ({
  myChannels: [],
  followingChannels: [],
  exploreChannels: [],

  activeGroup: "my",
  selectedChannelName: null, // 預設不選任何 channel

  loading: false,
  error: undefined,

  __inFlight: false,
  __loadedAt: undefined,

  __setMyChannelsFromExternal: (items) => set({ myChannels: dedupeByName(items) }),

  __getCacheKey: () => {
    try {
      const uid =
        (typeof window !== "undefined" && window.localStorage.getItem("clerk_user_id")) || "anon";
      return `v1|following|user=${uid}`;
    } catch {
      return "v1|following|user=anon";
    }
  },

  __hydrateFollowingFromIDB: async (key) => {
    const cached = await FollowingIDB.get(key);
    if (cached?.items?.length) {
      set({ followingChannels: dedupeByName(mapFollowingToSummary(cached.items)) });
      return true;
    }
    return false;
  },

  __writeFollowingToIDB: async (key, items) => {
    const payload: FollowingCachePayload = { items, updatedAt: Date.now(), version: 1 };
    await FollowingIDB.set(key, payload);
  },

  ensureLoaded: async () => {
    const { __inFlight, __loadedAt, myChannels, followingChannels } = get();
    if (__inFlight) return;

    const now = Date.now();
    const hasSome = myChannels.length + followingChannels.length > 0;
    if (__loadedAt && now - __loadedAt < 60_000 && hasSome) return;

    set({ loading: true, error: undefined, __inFlight: true });
    try {
      // 1) store 現有
      let hasFollow = followingChannels.length > 0;

      // 2) IDB 命中
      if (!hasFollow) {
        const key = get().__getCacheKey();
        hasFollow = await get().__hydrateFollowingFromIDB(key);
      }

      // 3) RPC 校正 & 寫回 IDB
      const res = await GetFollowingChannelsFromSupabase();
      if (res.success && res.data) {
        const latest = res.data;
        set({ followingChannels: dedupeByName(mapFollowingToSummary(latest)) });
        await get().__writeFollowingToIDB(get().__getCacheKey(), res.data);
      }

      set({ __loadedAt: now });
    } catch (e: any) {
      set({ error: e?.message ?? "Failed to load channels" });
    } finally {
      set({ loading: false, __inFlight: false });
    }
  },

  refreshFollowing: async () => {
    set({ loading: true });
    try {
      const res = await GetFollowingChannelsFromSupabase();
      if (res.success && res.data) {
        set({ followingChannels: dedupeByName(mapFollowingToSummary(res.data)) });
        await get().__writeFollowingToIDB(get().__getCacheKey(), res.data);
      }
    } finally {
      set({ loading: false });
    }
  },

  select: (group, channelName) => {
    set({ activeGroup: group, selectedChannelName: channelName });
    get().__sourceListeners.forEach((l) => l(channelName));
  },

  __sourceListeners: [],
}));

// ===== ViewModel（只鏡像 MyChannels 清單；不鏡像 selection）=====
export function useRateCommunityChannelViewModel() {
  const { userChannels, loading: myLoading } = useUserChannelViewModel();

  const setMy = useRateCommunityChannelStore((s) => s.__setMyChannelsFromExternal);
  useEffect(() => {
    console.log("community channel VM use Effect useChannels, setMy")
    if (userChannels && userChannels.length) {
      setMy(dedupeByName(mapUserChannelsToSummary(userChannels)));
    }
  }, [userChannels, setMy]);

  const ensureLoaded = useRateCommunityChannelStore((s) => s.ensureLoaded);
  useEffect(() => {
        console.log("community channel VM use Effect ensureloaded")

    ensureLoaded();
  }, [ensureLoaded]);

  const state = useRateCommunityChannelStore();
  return { ...state, loading: state.loading || myLoading };
}
