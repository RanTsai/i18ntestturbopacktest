"use client";

import { create } from "zustand";
import { Question } from '@/lib//schema/questionaire-schema'


type MetaPatch = {
  review?: Partial<HumanReviewBundle["review"]>;
  thumbnail?: Partial<NonNullable<HumanReviewBundle["thumbnail"]>>;
  version?: Partial<HumanReviewBundle["versions"][number]>;
};


export type VersionListItem = {
  version_number: number | null; // 新建草稿前可先 null
  created_at: string;            // ISO
  is_latest: boolean;
  summary?: string | null;
};

export type HumanReviewBundle = {
  review: {
    public_id: string;
    is_public?: boolean | null;
    closedate?: string | null;
    summary?: string | null;
    status?: string | null;
  };
  thumbnail?: {
    user_channel_name?: string | null;
    thumbnails: any;
    titles?: string[] | null;
    tags?: any;
    niche?: any;
    platform?: string | null;
    target_audience?: number[] | null;
  } | null;
  versions: Array<{
    version_number: number | null;
    created_at: string;
    is_latest: boolean;
    summary?: string | null;
    questionnaire: Question[] | null;
    credit_reward?: number | null;
    wanted_rating_count?: number | null;
    language?: string | null;
    creator_message_to_raters?: string | null;
    channel_logo?: string | null;
    channel_name?: string | null;
    channel_description?: string | null;
    platform?: string | null;
    view_count?: number | null;
    cancel_count?: number | null;
    rate_count?: number | null;
  }>;
};

type State = {
  bundle: HumanReviewBundle | null;
  versions: VersionListItem[];
  activeVersionIndex: number | null;
  headIndex: number | null;

  loadingVersions: boolean;
  hasMoreVersions: boolean;

  /** 只標示「最新版本」是否有尚未儲存的本地變更 */
  dirtyLatest: boolean;
};

type Actions = {
  hydrate: (bundle: HumanReviewBundle, preferVersionNumber?: number | null) => void;
  setBundle: (bundle: HumanReviewBundle | null) => void;
  setDirtyLatest: (dirty: boolean) => void;

  selectVersion: (index: number) => void;

  /** 使用舊版開始編輯時，從該 index 複製一份成為最新版本並切到它 */
  ensureEditableHeadFrom: (index: number) => void;

  /** 把修改套用到最新版本（head） */
  applyLatestEdits: (updater: (prevQuestionnaire: any) => any) => void;

  openLatest: () => void;
  loadMoreVersions: () => Promise<void>;
  forkFromVersion: (index: number) => void;
  applyLatestMetaEdits: (patch: MetaPatch) => void;

};

export const useHumanReviewBundleStore = create<State & Actions>((set, get) => ({
  bundle: null,
  versions: [],
  activeVersionIndex: null,
  headIndex: null,

  loadingVersions: false,
  hasMoreVersions: false,

  dirtyLatest: false,

  setBundle: (bundle) => set({ bundle }),

  setDirtyLatest: (dirty) => set({ dirtyLatest: dirty }),

  // use-human-review-bundle-store.ts（hydrate 內部替換/擴充）
  hydrate: (bundle, preferVersionNumber) => {
    const current = get();

    // 檢查是否有本地 Unsaved（head 為 null version_number 且 dirtyLatest）
    const keepLocalDraft =
      current.dirtyLatest === true &&
      current.bundle &&
      current.headIndex === 0 &&
      current.bundle.versions?.[0] &&
      current.bundle.versions[0].version_number === null;

    let nextVersionsRaw = bundle.versions ?? [];

    if (keepLocalDraft) {
      // 把本地 draft 取出、維持在最前面，server 回來的全部視為歷史（is_latest=false）
      const localDraft = current.bundle!.versions[0];
      nextVersionsRaw = [
        { ...localDraft, is_latest: true }, // 本地 Unsaved 永遠是最新
        ...nextVersionsRaw.map(v => ({ ...v, is_latest: false })),
      ];
    }

    // headIndex：若有本地 draft → 0；否則找 is_latest / 最大號 / 0
    let headIndex =
      keepLocalDraft
        ? 0
        : ((): number => {
          const vers = nextVersionsRaw;
          const iLatest = vers.findIndex(v => v.is_latest);
          if (iLatest >= 0) return iLatest;
          const nums = vers.map(v => v.version_number ?? -Infinity);
          const max = Math.max(...nums);
          const idx = vers.findIndex(v => (v.version_number ?? -Infinity) === max);
          return idx >= 0 ? idx : 0;
        })();

    // activeIndex：若指定版本號（且未在編輯），就按指定；否則跟 head
    let activeIndex = headIndex;
    if (!keepLocalDraft && typeof preferVersionNumber === "number") {
      const idx = nextVersionsRaw.findIndex(v => v.version_number === preferVersionNumber);
      if (idx >= 0) activeIndex = idx;
    }

    const versions: VersionListItem[] = nextVersionsRaw.map((v) => ({
      version_number: v.version_number,
      created_at: v.created_at,
      is_latest: v.is_latest,
      summary: v.summary ?? null,
    }));

    set({
      bundle: { ...bundle, versions: nextVersionsRaw },
      versions,
      headIndex,
      activeVersionIndex: activeIndex,
      // 若保留了本地 draft，dirty 仍為 true；否則回到乾淨狀態
      dirtyLatest: keepLocalDraft ? true : false,
    });
  },


  selectVersion: (index) => {
    const { bundle } = get();
    if (!bundle) return;
    if (index < 0 || index >= bundle.versions.length) return;
    set({ activeVersionIndex: index });
  },



  ensureEditableHeadFrom: (index) => {
    const { bundle, headIndex, dirtyLatest } = get();
    if (!bundle) return;

    // ✅ 已有本地 Unsaved（head 的 version_number === null）→ 不再 fork
    const hasLocalUnsaved =
      dirtyLatest === true &&
      headIndex != null &&
      bundle.versions?.[headIndex] &&
      bundle.versions[headIndex].version_number === null;

    if (hasLocalUnsaved) {
      // 可選：把 active 切回 head（或保持現狀也可）
      set({ activeVersionIndex: headIndex });
      return;
    }

    // 🔽 原本的複製邏輯維持不變 …
    const source = bundle.versions[index];
    if (!source) return;

    const newHead = {
      ...source,
      version_number: null,
      is_latest: true,
      created_at: new Date().toISOString(),
      summary: source.summary ?? null,
    };

    const nextVersions = [newHead, ...bundle.versions.map((v, i) => ({ ...v, is_latest: i === 0 ? false : v.is_latest }))];

    const nextBundle = { ...bundle, versions: nextVersions };

    const versions = nextVersions.map((v) => ({
      version_number: v.version_number,
      created_at: v.created_at,
      is_latest: v.is_latest,
      summary: v.summary ?? null,
    }));

    set({
      bundle: nextBundle,
      versions,
      headIndex: 0,
      activeVersionIndex: 0,
      dirtyLatest: true,
    });
  },


  applyLatestEdits: (updater) => {
    const { bundle, headIndex } = get();
    if (!bundle || headIndex == null) return;
    const head = bundle.versions[headIndex];
    if (!head) return;

    const updatedHead = {
      ...head,
      questionnaire: updater(head.questionnaire),
      is_latest: true,
    };

    const nextVersions = bundle.versions.map((v, i) => (i === headIndex ? updatedHead : v));
    const nextBundle: HumanReviewBundle = { ...bundle, versions: nextVersions };

    // Sidebar 映射（不需要 questionnaire）
    const versions: VersionListItem[] = nextVersions.map((v) => ({
      version_number: v.version_number,
      created_at: v.created_at,
      is_latest: v.is_latest,
      summary: v.summary ?? null,
    }));

    set({
      bundle: nextBundle,
      versions,
      dirtyLatest: true,
    });
  },

  applyLatestMetaEdits: (patch) => {
    const { bundle, headIndex } = get();
    if (!bundle || headIndex == null) return;

    const nextReview = patch.review ? { ...bundle.review, ...patch.review } : bundle.review;
    const nextThumbnail =
      patch.thumbnail ? { ...(bundle.thumbnail ?? {}), ...patch.thumbnail } : bundle.thumbnail;

    const updatedHead = patch.version
      ? { ...bundle.versions[headIndex], ...patch.version, is_latest: true }
      : { ...bundle.versions[headIndex], is_latest: true };

    const nextVersions = bundle.versions.map((v, i) => (i === headIndex ? updatedHead : v));

    const nextBundle: HumanReviewBundle = {
      ...bundle,
      review: nextReview,
      thumbnail: nextThumbnail as any,
      versions: nextVersions,
    };

    // Sidebar 總覽不需要 questionnaire，所以只同步必要欄位
    const versions: VersionListItem[] = nextVersions.map((v) => ({
      version_number: v.version_number,
      created_at: v.created_at,
      is_latest: v.is_latest,
      summary: v.summary ?? null,
    }));

    set({
      bundle: nextBundle,
      versions,
      dirtyLatest: true,
    });
  },
  openLatest: () => {
    const { headIndex } = get();
    if (headIndex == null) return;
    set({ activeVersionIndex: headIndex });
  },

  loadMoreVersions: async () => {
    // TODO: 你可以在這裡打 Supabase API 取下一頁版本，合併進 bundle.versions
    // 這裡先放樣板
    set({ loadingVersions: true });
    try {
      // const more = await fetchMoreFromSupabase(...);
      // merge...
    } finally {
      set({ loadingVersions: false });
    }
  },

  forkFromVersion: (index) => {
    // 直接複用 ensureEditableHeadFrom
    const { ensureEditableHeadFrom } = get();
    ensureEditableHeadFrom(index);
  },
}));
