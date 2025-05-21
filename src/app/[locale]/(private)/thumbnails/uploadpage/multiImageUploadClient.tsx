"use client";

import React, { useState } from "react";
import MultiImageUploader from "@/components/multiImageUploader";
import userGlobalStore, { IUserGlobalStore } from "@/app/global-store/users-store";
import toast from "react-hot-toast";
import { uploadThumbnailAndGetUrl } from "@/actions/supabaseImages";
import { getThumbnailReviewFromOpenAi } from "@/actions/ai/openai";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import ReviewCard from "@/components/ui/review/reviewcard";

type UploadedReview = {
  file: File;
  url: string;
  title: string;
  review?: string;
};

export default function MultiImageUploaderClient() {
  const { theUser } = userGlobalStore() as IUserGlobalStore;
  const [uploads, setUploads] = useState<UploadedReview[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (files: File[], title: string) => {
    try {
      setLoading(true);
      const newUploads: UploadedReview[] = [];

      for (const file of files) {
        const response = await uploadThumbnailAndGetUrl(file);
        if (response.success && response.url) {
          newUploads.push({ file, url: response.url, title });
        } else {
          toast.error(`Upload failed for ${file.name}`);
        }
      }

      setUploads(newUploads);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const getAllReviews = async () => {
    setLoading(true);

    const updated = await Promise.all(
      uploads.map(async (item) => {
        const review = await getThumbnailReviewFromOpenAi(
          "Please review this thumbnail",
          item.url,
          item.title
        );
        return {
          ...item,
          review: review ?? "No response",
        };
      })
    );

    setUploads(updated);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-500 bg-black/10 p-10 rounded-md flex flex-col items-center text-center space-y-4">
        <MultiImageUploader onUpload={handleUpload} />
        <p className="text-sm text-gray-400">Upload your image(s) above, then request an AI review.</p>
      </div>

      <div className="space-y-4">
        <Button
          variant="default"
          className="w-full md:w-auto"
          onClick={() => {
            if (!uploads.length) {
              toast.error("請先上傳圖片");
              return;
            }
            getAllReviews();
          }}
        >
          Get Reviews
        </Button>

        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Spinner height={50} />
            <p className="text-sm text-gray-400 text-center">🤖 正在分析縮圖與標題中，請稍候...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {uploads.map((item, index) => (
              <ReviewCard
                key={index}
                thumbnailUrl={item.url}
                title={item.title}
                score={4.3}
                aspects={[4.5, 3.8, 4.2, 4.0, 3.9]}
                aiMarkdown={item.review || "No review yet"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
