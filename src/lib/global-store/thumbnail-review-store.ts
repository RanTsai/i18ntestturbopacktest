// lib/global-store/thumbnail-review-store.ts
"use client";

import { create } from "zustand";
import { IUsersWorkVersion, IUsersWork } from "../view-models/use-upload-user-thumbnail-ai-analysis-view-model";

interface ThumbnailReviewState {
  uploads: IUsersWorkVersion[];
  userWork: IUsersWork | null;
  loading: boolean;

  setUploads: (
    uploads: IUsersWorkVersion[] | ((prev: IUsersWorkVersion[]) => IUsersWorkVersion[])
  ) => void;
  setUserWork: (work: IUsersWork | null) => void;
  setLoading: (loading: boolean) => void;

  removeUpload: (index: number) => void;
}

// lib/global-store/thumbnail-review-store.ts
export const useThumbnailReviewStore = create<ThumbnailReviewState>((set) => ({
  uploads: [],
  userWork: null,
  loading: false,

  setUploads: (uploads) =>
    set((state) => ({
      uploads: typeof uploads === "function" ? uploads(state.uploads) : uploads,
    })),
    
  setUserWork: (userWork) => set({ userWork }),
  setLoading: (loading) => set({ loading }),

  removeUpload: (index) =>
    set((state) => ({
      uploads: state.uploads.filter((_, i) => i !== index),
    })),
}));

