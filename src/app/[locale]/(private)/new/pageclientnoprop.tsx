"use client";

import { useTranslationViewModel } from "@/lib/view-models/use-translation-view-model";
import { CachedTranslation } from "@/lib/idb/translation-idb";
import { useEffect } from "react";
import { useParams } from "next/navigation";

interface Props {
  initialTranslation?: CachedTranslation;
}

export default function PageClientNoProp( {initialTranslation }: Props) {
    const pageId = "review_community_page";
    const { locale } = useParams() as { locale: string }

    const { t, isLoading, translation,hydrateTranslation } = useTranslationViewModel(pageId, locale);
    //console.log("No Prop Translation?", translation?.page_header, "isLoading", isLoading);
     useEffect(() => {
    if (
      initialTranslation 
    ) {
      console.log("[Hydrate] Using initial translation");
      hydrateTranslation(initialTranslation.content, initialTranslation.version);
    }
  }, [initialTranslation]);

    return (
        <div>
            <h1>Translation? {translation?.page_header?.translation ?? "No translation"}</h1>
            <h1>T: {t("page_header")}</h1>
            <h1>{isLoading ? "Loading..." : t("page_header")}</h1>
        </div>
    );
}
