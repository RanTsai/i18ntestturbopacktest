// app/[locale]/(private)/humanreviewdesign/humandesignpage.tsx
'use client';

import React, { useRef } from 'react';
import { VideoProvider } from '@/context/youtube-video-provider';
import { QuestionRefContext } from '@/context/question-ref-context';
import QuestionaireBuilderSideBar from './questionaire-builder-sidebar';
import QuestionnaireBuilder from '@/components/ui/forms/questionaire-builder';
import { FormSchema } from '@/lib/schema/questionaire-schema';

interface Props {
    locale: string;
    translationContent: any;
    formData: FormSchema;
    pageId: string;
}

export default function HumanReviewDesignPage({
    locale,
    translationContent,
    formData,
    pageId,
}: Props) {

    const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

    return (
        <VideoProvider>
            <QuestionRefContext.Provider value={questionRefs}>
                <div className="flex h-screen bg-background text-foreground">
                    {/* Sidebar */}
                    <div className="sticky top-0 h-screen w-[280px] border-r overflow-y-auto">
                        <QuestionaireBuilderSideBar
                            pageId={pageId}
                            fallbackTranslations={translationContent}
                        />
                    </div>

                    {/* Main Area */}
                    <main className="flex-1 overflow-y-auto p-6">
                        <QuestionnaireBuilder
                            pageId={pageId}
                            formData={formData}
                            questionRefs={questionRefs}
                        />
                    </main>
                </div>
            </QuestionRefContext.Provider>
        </VideoProvider>
    );
}
