//This file is for uploading single image and getting AI review

"use client";

import React from 'react';
import ImageUploader from '@/components/ui/imageuploader';
import userGlobalStore, { IUserGlobalStore } from '@/lib/global-store/users-store';
import toast from 'react-hot-toast';
import { uploadThumbnailAndGetUrl } from '@/actions/supabase/supabaseImages';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import ReviewCard from '@/components/ui/review/reviewcard';
import { DeductUserCredits } from '@/actions/supabase/supabaseCredits';
import { UserWorkWithAIAnalaysisToSupabase } from "@/actions/supabase/supabaseUserWork"
import FeedbackDialog, { FeedbackData } from '@/components/ui/feedback/user-feedback-form';
import ThumbnailRankingBoard from '@/components/ui/review/thumbnailRankingBoard';

export default function ImageUploaderClient() {
  const { theUser } = userGlobalStore() as IUserGlobalStore;
  const [uploadedFiles, setUploadedFiles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [url, setUrl] = React.useState<string>("");
  const [title, setTitle] = React.useState<string>("");
  const [aiFeedback, setAiFeedback] = React.useState<any>(null); // 新增：儲存 AI JSON 結果
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);

  const handleFeedbackSubmit = (feedback: FeedbackData) => {
    console.log("User feedback:", feedback);
    // 這邊可串接 Supabase API 儲存
  };

  const handleUpload = async (files: File[], title: string) => {
    try {
      setLoading(true);
      setTitle(title);
      const fileList = Array.isArray(files) ? files : [files];

      for (const file of fileList) {
        const response = await uploadThumbnailAndGetUrl(file);
        if (response.success) {
          toast.success(`✅ Uploaded: ${file.name}`);
          setUrl(response.url ?? "no url");
        } else {
          throw new Error(response.message);
        }
      }

      setUploadedFiles(files);
    } catch (error: any) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const getReview = async () => {
    console.log("getReview called with url:", url, "and title:", title);
    try {
      if (!url || !title) {
        toast.error("請先上傳圖片");
        return;
      }

      const result = await DeductUserCredits(50);
      console.log("Deducted user credits:", result);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setLoading(true);

      const response = await fetch("/api/ai-dispatch/thumbnailreview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `請幫我檢視這個縮圖和標題：\n- 縮圖: ${url}\n- 標題: ${title}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error("AI response failed");
      }

      const aiJson = await response.json();
      console.log("AI Feedback:", aiJson);
      setAiFeedback(aiJson);

      // 寫入 Supabase
      await UserWorkWithAIAnalaysisToSupabase(
        url,
        title,
        "User thumbnail",
        JSON.stringify(aiJson),
        aiJson.scores,
        "en",
        "AI feedback",
        50,
        50,
        1
      );

      toast.success("AI review done!");

    } catch (error: any) {
      toast.error("Review failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-500 bg-black/10 p-10 rounded-md flex flex-col items-center text-center space-y-4">
        <ImageUploader onUpload={handleUpload} />
        <p className="text-sm text-gray-400">Upload your image above, then request an AI review.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Button
            variant="default"
            className="w-full md:w-auto"
            onClick={() => {
              if (!uploadedFiles.length) {
                toast.error("請先上傳圖片");
                return;
              }
              getReview();
            }}
          >
            Get Review
          </Button>

          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <Spinner height={50} />
              <p className="text-sm text-gray-400 text-center">🤖 正在分析縮圖與標題中，請稍候...</p>
            </div>
          ) : (
            aiFeedback && (
              <>
              <ReviewCard
                thumbnailUrl={url || '/placeholder-thumbnail.png'}
                title={title}
                score={aiFeedback.scores.clickability}
                aspects={[
                  aiFeedback.scores.clickability,
                  aiFeedback.scores.curiosity,
                  aiFeedback.scores.brightness,
                  aiFeedback.scores.relevance,
                  aiFeedback.scores.emotion
                ]}
                aiMarkdown={`
### Overall Impression
${aiFeedback.overall_impression}

### Title Strength
${aiFeedback.title_strength}

### Thumbnail Strength
${aiFeedback.thumbnail_strength}

### Synergy
${aiFeedback.synergy}

### Explanation
${aiFeedback.explanation}
                `}
              />              
               <ThumbnailRankingBoard />
               </>
            )
          )}
        </div>
      </div>

      <Button onClick={() => setIsFeedbackOpen(true)}>
        Share Your Feedback
      </Button>

      {/* FeedbackDialog 透過 isOpen + setIsOpen 控制開關 */}
      <FeedbackDialog
        isOpen={isFeedbackOpen}
        setIsOpen={setIsFeedbackOpen}
        onSubmit={handleFeedbackSubmit}
      />    </div>
  );
}
