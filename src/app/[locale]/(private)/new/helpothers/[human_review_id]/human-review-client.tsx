// app/[locale]/(private)/humanreviewdesign/humandesignpage.tsx
'use client';

import React, { useEffect } from 'react';
import { CachedTranslation } from '@/lib/idb/translation-idb';
import QuestionnaireFiller from './questionaire-filler';
import { useSearchParams } from 'next/navigation';
import { HumanReviewBundle } from '@/lib/global-store/use-human-review-bundle-store';
import { useTranslationViewModel } from '@/lib/view-models/use-translation-view-model';
import { useParams } from 'next/navigation';
import { useQuestionnaireStore } from '@/lib/global-store/human-review-questionaire-store';
import { Question } from '@/lib//schema/questionaire-schema'

interface Props {
  initialTranslation?: CachedTranslation;
  ratingHumanReview: HumanReviewBundle | null;
}

export default function HumanAnswerClient({
  initialTranslation, ratingHumanReview
}: Props) {
  const { locale } = useParams() as { locale: string };
  const pageId = 'human_review_design_page';
  const { translation, hydrateTranslation } = useTranslationViewModel(pageId, locale);

  useEffect(() => {
    if (initialTranslation) {
      hydrateTranslation(initialTranslation.content, initialTranslation.version);
    }
  }, [initialTranslation]);

  const { questions, setQuestions } = useQuestionnaireStore();

  useEffect(() => {
    const raw = ratingHumanReview?.versions?.[0]?.questionnaire;
    const q = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as any)?.questions)
        ? (raw as any).questions
        : [];

    const sameLen = questions.length === q.length;
    const sameIds =
      sameLen &&
      questions.map((x) => x.id).join("|") ===
      q.map((x: Question) => x.id).join("|");

    if (!sameLen || !sameIds) {
      console.log("[HumanAnswerClient] writing normalized questions:", q);
      setQuestions(q);
    }
  }, [ratingHumanReview, questions, setQuestions]);



  const reviewed = useSearchParams().get('reviewed') === 'true';
  const localmode = reviewed ? 'review' : 'fill';

  return (
    <div className="flex h-screen bg-background text-foreground">
      <main className="flex-1 min-w-0 overflow-y-auto p-6">
        <QuestionnaireFiller
          translations={translation!}
          humanReview={ratingHumanReview}
          mode={localmode}
        />
      </main>
    </div>
  );
}
