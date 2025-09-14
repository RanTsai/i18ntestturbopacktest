// lib/global-store/use-upload-thumbnail-store.ts
import { create } from "zustand"
import { UserWorkFullViewModel } from "@/types/view-models/user-work-view-model"
import { Stuff } from "@/types/database/stuff"

type UploadThumbnailStore = {
  // 單次創作流程的 ViewModel
  work: Partial<UserWorkFullViewModel>

  // ✅ 操作方法
  setWork: (data: Partial<UserWorkFullViewModel>) => void
  updateWorkField: <K extends keyof UserWorkFullViewModel>(
    key: K,
    value: UserWorkFullViewModel[K]
  ) => void

  // ✅ 上傳圖檔
  addStuff: (stuff: Stuff) => void
  removeStuffById: (stuff_id: string) => void
  clear: () => void
}

export const useUploadThumbnailStore = create<UploadThumbnailStore>((set) => ({
  work: {
    title: "",
    niche: "",
    target_audience: "",
    user_note: "",
    stuff_list: [],
  },

  setWork: (data) => set({ work: { ...data } }),

  updateWorkField: (key, value) =>
    set((state) => ({
      work: {
        ...state.work,
        [key]: value,
      },
    })),

  addStuff: (stuff) =>
    set((state) => ({
      work: {
        ...state.work,
        stuff_list: [...(state.work.stuff_list ?? []), stuff],
      },
    })),

  removeStuffById: (stuff_id) =>
    set((state) => ({
      work: {
        ...state.work,
        stuff_list: (state.work.stuff_list ?? []).filter(
          (s) => s.stuff_id !== stuff_id
        ),
      },
    })),

  clear: () =>
    set({
      work: {
        title: "",
        niche: "",
        target_audience: "",
        user_note: "",
        stuff_list: [],
      },
    }),
}))
