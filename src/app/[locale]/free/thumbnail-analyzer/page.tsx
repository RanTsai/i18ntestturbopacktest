"use server";
import React from 'react';
import ImageUploaderClient from './image-upload-client';

export default async function ThumbnailUpload() {

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <ImageUploaderClient  />
        </div>
    )
};

