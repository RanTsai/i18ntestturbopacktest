
"use client";

import React from 'react';
import ImageUploader from '@/components/ui/imageuploader';
import userGlobalStore, { IUserGlobalStore } from '@/app/global-store/users-store';
import toast from 'react-hot-toast';
import { uploadThumbnailAndGetUrl } from '@/actions/supabaseImages';
import { getThumbnailReviewFromOpenAi } from '@/actions/ai/openai';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import ReviewCard from '@/components/ui/review/reviewcard';
import { DeductUserCredits } from '@/actions/supabaseCredits';
import {UserWorkWithAIAnalaysisToSupabase} from "@/actions/supabaseUserWork"


export default function ImageUploaderClient() {
  const { theUser } = userGlobalStore() as IUserGlobalStore;
  const [uploadedFiles, setUploadedFiles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string>("");
  const [url, setUrl] = React.useState<string>("");
  const [title, setTitle] = React.useState<string>("");

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
    try {
      if (!url || !title) return;

      //To change feature cost
      const result = await DeductUserCredits(50);
      if (!result.success) {
        //console.error(result.message);
        toast.error(result.message);
      }
      else {
        setLoading(true);
        const response = await getThumbnailReviewFromOpenAi("Please review this thumbnail", url, title);
        setMessage(response ?? "No AI response");
        //console.log("credit decuted, new balance ", result.remainingCredits);

        const userworkResult = await UserWorkWithAIAnalaysisToSupabase(          
          url,
          title,
          "User thumbnail", //TODO
          response || "",
          {
            clickability: 4.5,
            curiosity: 4.1,
            brightness: 3.8,
            relevance: 4.3,
            emotion: 3.9
          },
          "en",
          "AI feedback",
          50,
          50,
          1,
        );

        if (!userworkResult?.success){
          toast.error(userworkResult?.code || "");          
        }
        else{
          toast.success("successfull inserted into table");          
        }
      }     

    } catch (error: any) {
      //console.error("Failed to insert work", error.message);
      toast.error("Review failed");
    } finally {
      setLoading(false);
    }
  }

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
            message && (
              <ReviewCard
                thumbnailUrl={url}
                //thumbnailUrl='/thumbnail.png'
                title={title}
                score={4.3}
                aspects={[4.5, 3.8, 4.2, 4.0, 3.9]}
                aiMarkdown={message}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}