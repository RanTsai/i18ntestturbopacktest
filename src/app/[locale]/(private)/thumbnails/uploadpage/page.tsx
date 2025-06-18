"use server";
import React from 'react';
//import ImageUploaderClient from './imageUploadClient';
import MultiImageUploaderClient from './multiImageUploadClient';
import path from "path";
import { FormSchema } from "@/lib/schema/creator-signup-questionaire-schema"; 
import fs from "fs";

function ThumbnailUpload() {
const filePath = path.join(process.cwd(), "src/lib/form-data/creator/human-review-questionaire.json");
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const formData: FormSchema = JSON.parse(fileContent);
   
    const handleImageUpload = (file: File) => {
        //setUploadedImage(file);
        console.log("Got image from child:", file);
    };
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <h1 className="text-2xl font-semibold text-white text-center">AI Thumbnail Analyzer</h1>
            {/* <ImageUploaderClient /> */}
           

            <MultiImageUploaderClient formData={formData} />
           
        </div>
    )
}

export default ThumbnailUpload