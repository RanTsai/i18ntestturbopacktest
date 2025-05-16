"use client";
import React from 'react';
import ImageUploader from '@/components/ui/imageuploader';
import userGlobalStore, { IUserGlobalStore } from "@/app/global-store/users-store";
import toast from "react-hot-toast";
import { uploadThumbnailAndGetUrl } from "@/actions/supabaseImages";
import { getThumbnailReviewFromOpenAi } from "@/actions/ai/openai";
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import ReactMarkdown from 'react-markdown';

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
            console.log("files : ", files);
            console.log("is array, ", Array.isArray(files));
            const fileList = Array.isArray(files) ? files : [files]
            for (const file of fileList) {
                const response = await uploadThumbnailAndGetUrl(file);
                if (response.success) {
                    //urls.push(response.url);
                    console.log("response url ", response.url)
                    toast.success(`Image uploaded successfully 🎉 ${file.name}`);
                    setUrl(response.url ?? "no URL");
                } else {
                    toast.error("Error upload thumbnails");
                    throw new Error(response.message);
                }
            }
            setUploadedFiles(files);
        } catch (error: any) {
            console.log(error);
            toast.error("Error upload thumbnails");

        } finally {
            setLoading(false);
        }
    };

    const getReview = async (message: string, url: string, title: string) => {
        try {
            setLoading(true)
            const botresponse = await getThumbnailReviewFromOpenAi("Please review this thumbnail", url, title);

            setMessage(botresponse ?? "no response from ai");

        } catch (error: any) {
            console.log(error);
            toast.error("failed to get review: ", error.message);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div>
                <ImageUploader onUpload={handleUpload} />
            </div>
            <div>
                <Button variant="outline" onClick={() => {
                    if (uploadedFiles.length === 0) {
                        toast.error("請先上傳圖片");
                        return;
                    }
                    // 假設只取第一張
                    uploadThumbnailAndGetUrl(uploadedFiles[0]).then((response) => {
                        if (response.success && response.url) {
                            getReview(
                                "Please review this thumbnail and title",
                                response.url,
                                title
                            );
                        } else {
                            toast.error("取得圖片 URL 失敗");
                        }
                    });
                }}>Get Review

                </Button>
                {loading ? (
                    <div>
                    <p>🤖 正在分析縮圖與標題中，請稍候...</p>
                    <Spinner height={60}/>
                    </div>
                ) : (
                    message && <p>{message}</p>
                )}
                
            </div>
        </>
    )

        ;
}