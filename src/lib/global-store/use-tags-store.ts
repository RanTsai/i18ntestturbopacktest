// /lib/global-store/tag-store.ts
import { create } from "zustand"

export interface TagItem {
  id: string
  label: string
  isCustom?: boolean
  color?: string
  icon?: React.ReactNode
}

interface TagStore {
  tags: TagItem[]
  addTag: (label: string) => string // return tag id
  getTagById: (id: string) => TagItem | undefined
}

const useTagStore = create<TagStore>((set, get) => ({
  tags: [
    { id: "tech", label: "Tech" },
    { id: "science", label: "Science" },
    { id: "gaming", label: "Gaming" },
    // 可接後端 fetch 初始化
  ],
  addTag: (label: string) => {
    const normalized = label.trim().toLowerCase()
    const exists = get().tags.find(t => t.id === normalized)
    if (exists) return exists.id
    const newTag: TagItem = { id: normalized, label: label.trim(), isCustom: true }
    set(state => ({ tags: [...state.tags, newTag] }))
    return newTag.id
  },
  getTagById: (id) => get().tags.find(tag => tag.id === id),
}))

export default useTagStore
