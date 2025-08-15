// app/[locale]/(private)/humanreviewdesign/humandesignpage.tsx
'use client';

import React, { useRef } from 'react';
import { VideoProvider } from '@/context/youtube-video-provider';
import { QuestionRefContext } from '@/context/question-ref-context';
import { IHumanReview } from '@/lib/schema/human-review-schema';
import { FormSchema } from '@/lib/schema/questionaire-schema';
import HumanReviewSideBar from './human-review-sidebar';
import QuestionnaireFiller from '@/components/ui/forms/questionaire-filler';
import { useSearchParams } from 'next/navigation';

interface Props {
  locale: string;
  translationContent: any;
  humanreview: IHumanReview | null;
  formData: FormSchema;
  pageId: string;
}

export default function HumanReviewPage({
  locale,
  translationContent,
  humanreview,
  formData,
  pageId,
}: Props) {
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const reviewed = useSearchParams().get('reviewed') === 'true';
  const localmode = reviewed ? 'review' : 'fill';

  return (
    <VideoProvider>
      <QuestionRefContext.Provider value={questionRefs}>
        <div className="flex h-screen bg-background text-foreground">
          {/* Sidebar：交給元件自己控制寬度/邊框/黏頂/動畫 */}
          <HumanReviewSideBar
            pageId={pageId}
            fallbackTranslations={translationContent}
            questions={humanreview?.questionaire ?? []}
          />

          {/* Main Area：隨 Sidebar 收納/展開自適應寬度 */}
          <main className="flex-1 min-w-0 overflow-y-auto p-6">
            <QuestionnaireFiller
              pageId={pageId}
              humanReview={humanreview}
              formData={formData}
              questionRefs={questionRefs}
              mode={localmode}
            />
          </main>
        </div>
      </QuestionRefContext.Provider>
    </VideoProvider>
  );
}
