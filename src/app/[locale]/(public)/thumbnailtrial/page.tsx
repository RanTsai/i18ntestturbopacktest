"use server";
import React from 'react';
import MultiImageUploaderClient from './multiImage-upload-client';
import { loadQuestionnaire } from '@/actions/upstashredis/load-questionaire';

export default async function ThumbnailUpload({ params }: { params: { locale: string } }) {
     const { locale } = await params;
     const { content } = await loadQuestionnaire('human-review', locale);

     if (!content) return <p>Failed Loading Questionaire</p>

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <h1 className="text-2xl font-semibold text-white text-center">AI Thumbnail Analyzer</h1>
            {/* <ImageUploaderClient /> */}


            <MultiImageUploaderClient formData={content} />

        </div>
    )
};

