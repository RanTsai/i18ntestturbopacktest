"use client";
import React from 'react'
import ReviewCard from '@/components/ui/review/reviewcard';
import UserWorkGlobalStore from '@/lib/global-store/user-work-store';

export default function page() {

    const { selectedWork, setSelectedWork } = UserWorkGlobalStore() as any;

    console.log("UserWorkGlobalStore selectedWork:", selectedWork);
    const loading = false;

    return (
        <>

            <ReviewCard
                thumbnailUrl={selectedWork.image_url || '/placeholder-thumbnail.png'}
                title={selectedWork.title}
                score={selectedWork.ai_score.clickability}
                aspects={[
                    selectedWork.ai_score.clickability,
                    selectedWork.ai_score.curiosity,
                    selectedWork.ai_score.brightness,
                    selectedWork.ai_score.relevance,
                    selectedWork.ai_score.emotion
                ]}
                aiMarkdown={`### Overall Impression${selectedWork.ai_comment}`}
            />

        </>)
}

