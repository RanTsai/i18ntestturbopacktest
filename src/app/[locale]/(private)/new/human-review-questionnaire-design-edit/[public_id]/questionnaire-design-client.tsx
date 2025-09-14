// app/[locale]/(private)/humanreviewdesign/humandesignpage.tsx
'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslationViewModel } from '@/lib/view-models/use-translation-view-model';
import QuestionnaireBuilder from './questionaire-builder';
import { CachedTranslation } from '@/lib/idb/translation-idb';
import { HumanReviewBundle } from '@/lib/view-models/use-human-review-view-model';

interface Props {
  initialTranslation?: CachedTranslation;
  editingHumanReview?: HumanReviewBundle | null; 
}

export default function HumanReviewDesignPage({
  initialTranslation,
  editingHumanReview, 
}: Props) {
  const { locale } = useParams() as { locale: string };
  const pageId = "human_review_design_page";
  const { translation, hydrateTranslation } = useTranslationViewModel(pageId, locale);

  useEffect(() => {
    if (initialTranslation) {
      hydrateTranslation(initialTranslation.content, initialTranslation.version);
    }
  }, [initialTranslation, hydrateTranslation]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Main Area：跟著 Sidebar 收納/展開自適應寬度 */}
      <main className="flex-1 min-w-0 overflow-y-auto p-6" data-scroll-container>
        <QuestionnaireBuilder
          translations={translation!}
          editingHumanReview={editingHumanReview ?? null}      
        />
      </main>
    </div>
  );
}