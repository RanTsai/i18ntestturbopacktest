// hooks/usePageTranslation.ts
import useTranslationStore from "@/lib/global-store/use-translation-store";
import { useEffect, useState } from "react";
import { LoadPageTranslation } from "@/actions/upstashredis/load-page-translation"; // SSR 端點也可抽出來

export const usePageTranslation = (
  pageId: string,
  locale: string,
  forceReload = false
) => {
  const { getTranslation, setTranslation } = useTranslationStore();
  const [loading, setLoading] = useState(true);
  const [translation, setTranslationState] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!forceReload) {
        const cached = getTranslation(pageId, locale);
        if (cached) {
          setTranslationState(cached);
          setLoading(false);
          return;
        }
      }

      const result = await LoadPageTranslation(pageId, locale);
      if (result.found && result.content) {
        setTranslation(pageId, locale, result.content);
        setTranslationState(result.content);
      }

      setLoading(false);
    };

    fetch();
  }, [pageId, locale, forceReload]);

  return { translation, loading };
};