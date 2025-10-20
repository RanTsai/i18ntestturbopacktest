// lib/global-store/use-translation-store.ts
import { create } from "zustand";
import { PageTranslations } from "@/i18n/interface";

interface TranslationStore {
  translations: Record<string, PageTranslations>; // key: `${pageId}_${locale}`
  setTranslation: (pageId: string, locale: string, data: PageTranslations) => void;
  getTranslation: (pageId: string, locale: string) => PageTranslations | undefined;
}

const useTranslationStore = create<TranslationStore>((set, get) => ({
  translations: {},

  setTranslation: (pageId, locale, data) => {
    const key = `${pageId}_${locale}`;

    // 更新 Zustand memory store
    set((state) => ({
      translations: {
        ...state.translations,
        [key]: data,
      },
    }));
  },

  getTranslation: (pageId, locale) => {
    const key = `${pageId}_${locale}`;

    // ✅ Memory 中已有
    const fromMemory = get().translations[key];
    if (fromMemory) return fromMemory;

    if (typeof window !== "undefined") {
      const fromSession = sessionStorage.getItem(`translation_${key}`);
      if (fromSession) {
        try {
          const parsed = JSON.parse(fromSession);
          get().setTranslation(pageId, locale, parsed); // hydrate
          return parsed;
        } catch {}
      }

      const fromLocal = localStorage.getItem(`translation_${key}`);
      if (fromLocal) {
        try {
          const parsed = JSON.parse(fromLocal);
          get().setTranslation(pageId, locale, parsed); // hydrate
          return parsed;
        } catch {}
      }
    }

    return undefined;
  },
}));

export default useTranslationStore;