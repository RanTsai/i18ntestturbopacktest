"use client";
import React from 'react';
import ThumbnailFeedbackCard from '@/components/ai/ThumbnailFeedbackCard';

function page() {
    return (
        <div>
            <ThumbnailFeedbackCard
                thumbnailUrl="/thumbnail1.png"
                title="AI 會搶走你的工作嗎？"
                imageDescription="一個擔心的上班族盯著螢幕，背景是機器人"
                language="zh"
            />
        </div>
    )
}

export default page