// lib/view-models/use-translation-view-model.ts
import { useEffect, useState } from "react";
import useTranslationStore from "@/lib/global-store/use-translation-store";
import { getTranslationFromIDB, setTranslationToIDB, clearAllTranslationsFromIDB } from "@/lib/idb/translation-idb";
import { PageTranslations } from "@/i18n/interface";

export function useTranslationViewModel(pageId: string, locale: string) {
  const { getTranslation, setTranslation } = useTranslationStore();
  const [isLoading, setIsLoading] = useState(false);

  const translation = getTranslation(pageId, locale);

  // ✅ 提供一個主動注入的 hydrate 方法
  const hydrateTranslation = (data: PageTranslations, version:number) => {
    if (data) {
      const key = `${pageId}_${locale}`;

      setTranslation(pageId, locale, data);
      setTranslationToIDB(key, {
        version: version,
        content: data
      }); // ✅ 儲存進 IDB
    }
  };

  // ✅ 如果沒有被 hydrate，才會觸發自動 fetch
  useEffect(() => {
    //clearAllTranslationsFromIDB(); // 開發時清掉 IDB，避免舊資料干擾
    if (!translation && !isLoading) {
      const key = `${pageId}_${locale}`;
      //console.log("[ViewModel] No translation in store, checking IDB for:", key);

      setIsLoading(true);

      getTranslationFromIDB(key)
        .then((cached) => {
          if (cached) {
            //console.log("[ViewModel] Found translation in IDB:", cached);
            setTranslation(pageId, locale, cached.content); // ✅ Hydrate global store
          } else {
            //console.log("[ViewModel] Not in IDB, fetching from /api/i18n");

            fetch(`/api/i18n?page=${pageId}&locale=${locale}`)
              .then((res) => res.json())
              .then((res) => {
                if (res?.content) {
                  //console.log("[ViewModel] Fetched translation:", res.content, 'version:', res.content.version);
                  setTranslation(pageId, locale, res.content);
                  setTranslationToIDB(key, {
                    version: res.content.version,
                    content: res.content
                  }); // ✅ 儲存進 IDB
                }
              })
              .catch((err) => {
                console.error("[ViewModel] Fetch error:", err);
              });
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [pageId, locale]);

  return {
    t: (key: string) => translation?.[key]?.translation ?? key,
    tooltip: (key: string) => translation?.[key]?.tooltip ?? "",
    translation,
    hydrateTranslation,             // ✅ 對外暴露 hydrate
    isLoading,
  };
}
