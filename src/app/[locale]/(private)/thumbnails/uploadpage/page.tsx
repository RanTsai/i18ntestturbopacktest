"use server";
import React from 'react';
//import ImageUploaderClient from './imageUploadClient';
import MultiImageUploaderClient from './multiImageUploadClient';

function ThumbnailUpload() {

   
    const handleImageUpload = (file: File) => {
        //setUploadedImage(file);
        console.log("Got image from child:", file);
    };
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <h1 className="text-2xl font-semibold text-white text-center">AI Thumbnail Analyzer</h1>
            {/* <ImageUploaderClient /> */}
           

            <MultiImageUploaderClient />
           
        </div>
    )
}

export default ThumbnailUpload