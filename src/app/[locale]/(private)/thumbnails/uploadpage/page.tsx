"use server";
import React from 'react';
import ImageUploaderClient from './imageUploadClient';

function ThumbnailUpload() {

    const handleImageUpload = (file: File) => {
        //setUploadedImage(file);
        console.log("Got image from child:", file);
    };
    return (
        <div>
             <ImageUploaderClient />;
        </div>
    )
}

export default ThumbnailUpload