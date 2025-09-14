"use client";

import {
  XCircle,
  ImagePlus,
  AlertTriangle,
  GitCompareArrows,
  RotateCcw,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { uploadThumbnailAndGetUrl } from "@/actions/supabase/supabaseImages";
import { useVideoContext } from "@/context/youtube-video-provider";
import UserChannelStore from "@/lib/global-store/user-channel-store";
import VideoSettingStore from "@/lib/global-store/upload-store";
import useVideoSelectionStore from "@/lib/global-store/video-selection-store";
import { PageTranslations } from "@/i18n/interface";
import compressImage from "@/lib/compress-image";

interface Props {
  translations?: PageTranslations;
}


const MAX_IMAGES = 4;

const ThumbnailGrid: React.FC<Props> = ({ translations }) => {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadingIndexes, setUploadingIndexes] = useState<number[]>([]);
  const [errors, setErrors] = useState<string | null>(null);

  const { selectedChannel } = UserChannelStore();
  const { selectedTitle, title } = VideoSettingStore();
  const { } = useVideoSelectionStore();
  const { getVideosByKey, setVideosByKey, setActiveKey } = useVideoContext();

  // 載入 sessionStorage 中的圖片
  useEffect(() => {
    const savedUrls = sessionStorage.getItem("selected_images");
    if (savedUrls) {
      try {
        const parsed = JSON.parse(savedUrls);
        const urls = parsed.map((item: any) =>
          typeof item === "object" && item.image_url ? item.image_url : item
        );
        setUploadedUrls(urls);
        setPreviews(urls);
        setImages(new Array(urls.length).fill(null));
      } catch (err) {
        console.error("解析 selected_images 時發生錯誤", err);
      }
    }
  }, []);

  // 同步 Channel 資訊到 remix videos
  useEffect(() => {
    if (selectedChannel) {
      const currentVideos = getVideosByKey("remixed");
      if (currentVideos?.length) {
        const updatedVideos = currentVideos.map((video) =>
          video.id?.startsWith("fake-")
            ? {
              ...video,
              channelName: selectedChannel.channel_name,
              channelLogo: selectedChannel.logo,
            }
            : video
        );
        setVideosByKey("remixed", updatedVideos);
      }
    }
  }, [selectedChannel]);

  // 同步 Title 到 remix videos
  useEffect(() => {
    if (selectedTitle) {
      const currentVideos = getVideosByKey("remixed");
      if (currentVideos?.length) {
        const updatedVideos = currentVideos.map((video) =>
          video.id?.startsWith("fake-")
            ? { ...video, title: selectedTitle }
            : video
        );
        setVideosByKey("remixed", updatedVideos);
      }
    }
  }, [selectedTitle]);

  // 🧠 Spinner + 預覽 + 上傳
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length >= MAX_IMAGES) {
        setErrors(`最多只能上傳 ${MAX_IMAGES} 張圖片`);
        return;
      }

      const validFiles = acceptedFiles.filter(
        (file) => file.size <= 2_000_000
      );
      const remaining = MAX_IMAGES - images.length;
      const finalFiles = validFiles.slice(0, remaining);

      if (acceptedFiles.length > remaining) {
        toast.custom(
          () => (
            <div className="flex items-center gap-2 bg-primary text-primary px-4 py-2 rounded-3xl shadow-md">
              <AlertTriangle className="text-yellow-300" size={20} />
              <span className="text-sm text-white">
                最多只能放 {MAX_IMAGES} 張圖片，僅保留前 {remaining} 張
              </span>
            </div>
          ),
          {
            duration: 4000,
            position: "top-left",
          }
        );
      }

      for (const [index, file] of finalFiles.entries()) {
        const previewIndex = previews.length + index;

        // 建立本地預覽 URL
        const previewUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("讀取圖片失敗"));
          reader.readAsDataURL(file);
        });

        setPreviews((prev) => [...prev, previewUrl]);
        setImages((prev) => [...prev, file]);
        setUploadingIndexes((prev) => [...prev, previewIndex]);

        try {
          // 壓縮兩個版本
          const mdFile = await compressImage(file, 480, 270);
          const smFile = await compressImage(file, 320, 180);
          console.log("uploaded files", { file, mdFile, smFile });

          // 並行上傳三個版本
          const [resOriginal, resMd, resSm] = await Promise.all([
            uploadThumbnailAndGetUrl(file),
            uploadThumbnailAndGetUrl(mdFile),
            uploadThumbnailAndGetUrl(smFile),
          ]);

          const allSuccess =
            resOriginal.success && resMd.success && resSm.success;

          if (allSuccess) {
            const finalUrl = resMd.url || resOriginal.url;

            if (finalUrl) {
              setUploadedUrls((prev) => {
                const updated = [...prev, finalUrl];
                sessionStorage.setItem(
                  "selected_images",
                  JSON.stringify(updated)
                );
                return updated;
              });
            } else {
              toast.error("找不到縮圖 URL", { position: "top-left" });
            }
          } else {
            toast.error("圖片上傳失敗，請稍後再試", { position: "top-left" });
          }
        } catch (error) {
          console.error("圖片處理或上傳出錯", error);
          toast.error("處理圖片時發生錯誤", { position: "top-left" });
        } finally {
          setUploadingIndexes((prev) => prev.filter((i) => i !== previewIndex));
        }
      }
    },
    [images.length, previews.length]
  );





  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadedUrls((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      sessionStorage.setItem("selected_images", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemix = () => {
    const saved = sessionStorage.getItem("selected_images");
    if (!saved) return;

    const selectedImages: string[] = JSON.parse(saved);
    if (selectedImages.length === 0) return;

    const remixCount = Math.min(selectedImages.length, 4);
    const sample = [...selectedImages].slice(0, remixCount);

    const fakeVideos = sample.map((url, i) => ({
      id: `fake-${i}-${Date.now()}`,
      thumbnail: url,
      title: selectedTitle || title || "Your video title",
      channelName: selectedChannel?.channel_name ?? "",
      channelLogo: selectedChannel?.logo ?? "",
      length: "3:00",
      views: "1m views",
      uploadedAt: "just now",
    }));

    const baseVideos = getVideosByKey("search");
    const shuffled = [...baseVideos];
    fakeVideos.forEach((item) => {
      const index = Math.floor(Math.random() * (shuffled.length + 1));
      shuffled.splice(index, 0, item);
    });

    setVideosByKey("remixed", shuffled);
    setActiveKey("remixed");
  };

  const handleReset = () => {
    setActiveKey("search");
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpg": [],
      "image/jpeg": [],
    },
    multiple: true,
    maxSize: 2_000_000,
    noClick: true,
  });

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div
        {...getRootProps()}
        className="w-full flex flex-col gap-y-2 rounded-lg border border-dashed border-foreground p-2 shadow-sm shadow-foreground"
      >
        <div className="grid grid-cols-2 gap-2 w-full">
          {previews.map((src, i) => {
            const isUploading = uploadingIndexes.includes(i);
            return (
              <div key={i} className="relative group">
                <img
                  src={src}
                  alt={`src-${src}`}
                  className={`w-full h-auto object-contain rounded-lg transition-opacity duration-300 ${isUploading ? "opacity-50" : "opacity-100"
                    }`}
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="animate-spin h-6 w-6 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-50"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                      />
                    </svg>
                  </div>
                )}
                {!isUploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(i);
                    }}
                    className="absolute top-1 right-1 text-gray-500 text-xs rounded-full opacity-0 group-hover:opacity-100 transition hover:text-red-500 cursor-pointer"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>
            );
          })}

          {images.length < MAX_IMAGES && (
            <div
              onClick={() => {
                if (images.length < MAX_IMAGES) {
                  document
                    .querySelector<HTMLInputElement>("input[type=file]")
                    ?.click();
                }
              }}
              className="aspect-video w-full flex items-center justify-center border-2 border-dashed border-muted-foreground rounded-lg text-muted-foreground hover:bg-muted/50 transition cursor-pointer"
            >
              <ImagePlus className="size-8" />
            </div>
          )}
        </div>

        {previews.length === 0 && (
          <div className="text-sm text-muted-foreground text-center pt-4">
            {translations?.upload_area_note?.translation ??
              "Click here or drag images to upload (PNG, JPG, JPEG)"}
          </div>
        )}

        <input {...getInputProps()} />
      </div>

      {errors && <p className="text-destructive text-sm">{errors}</p>}

      <div className="flex gap-4">
        <button
          onClick={handleRemix}
          className="px-4 py-2 bg-blue-500 text-primary rounded-md disabled:opacity-50 cursor-pointer hover:bg-primary transition-colors hover:text-secondary"
        >
          <GitCompareArrows className="inline-block mr-2" />
          {translations?.remix_button?.translation ?? "Remix"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-blue-500 text-primary rounded-md disabled:opacity-50 cursor-pointer hover:bg-primary transition-colors hover:text-secondary"
        >
          <RotateCcw className="inline-block mr-2" />
          {translations?.reset_button?.translation ?? "Reset"}
        </button>
      </div>
    </div>
  );
};

export default ThumbnailGrid;
