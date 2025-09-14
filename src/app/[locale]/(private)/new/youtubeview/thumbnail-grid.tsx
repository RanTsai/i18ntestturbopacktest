// components/ThumbnailGrid.tsx
"use client";

import {
  XCircle,
  ImagePlus,
  AlertTriangle,
  GitCompareArrows,
  RotateCcw,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
// import { uploadThumbnailAndGetUrl } from "@/actions/supabase/supabaseImages";
import UserChannelStore from "@/lib/global-store/user-channel-store";
import VideoSettingStore from "@/lib/global-store/upload-store";
// import useVideoSelectionStore from "@/lib/global-store/video-selection-store";
import { PageTranslations } from "@/i18n/interface";
import compressImage from "@/lib/compress-image";
import { useYoutubeVideosVM } from "@/lib/view-models/use-youtube-localcache-view-model";
interface Props {
  translations?: PageTranslations;
}
// 小工具
const fileToDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("讀取圖片失敗"));
    reader.readAsDataURL(file);
  });



const MAX_IMAGES = 4;

const ThumbnailGrid: React.FC<Props> = ({ translations }) => {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadingIndexes, setUploadingIndexes] = useState<number[]>([]);
  const [errors, setErrors] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const { selectedChannel } = UserChannelStore();
  const { selectedTitle, title } = VideoSettingStore();

  // ✅ 只用 store + VM 動作
  const { remixWithImages, resetRemix } = useYoutubeVideosVM();

  // 讀取 session 的圖片（保留你原本邏輯）
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

  // 補齊假影片的 channel/title（當你要在 remix 時也加上）
  const decorateFake = useCallback(
    (urls: string[]) =>
      urls.map((url, i) => ({
        id: `fake-${i}-${Date.now()}`, // 這個 id 會被 VM 重新建立，不過這裡保留一致性
        thumbnail: url,
        title: selectedTitle || title || "Your video title",
        channelName: selectedChannel?.channel_name ?? "",
        channelLogo: selectedChannel?.logo ?? "",
        length: "3:00",
        views: "1m views",
        uploadedAt: "just now",
      })) as any,
    [selectedTitle, title, selectedChannel]
  );

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const toRemove = prev[index];
      if (toRemove?.startsWith("blob:")) URL.revokeObjectURL(toRemove);
      return prev.filter((_, i) => i !== index);
    });
    setUploadedUrls((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      sessionStorage.setItem("selected_images", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    return () => {
      previews.forEach((p) => p?.startsWith("blob:") && URL.revokeObjectURL(p));
    };
  }, [previews]);

  const handleRemix = () => {
    const saved = sessionStorage.getItem("selected_images");
    if (!saved) return;
    const selectedImages: string[] = JSON.parse(saved);
    if (selectedImages.length === 0) return;

    // 直接交給 VM（VM 負責備份 baseline、設定 remixFlag、更新 store.videos）
    // 這裡如果你想把 channel/title 灌進假影片，也可以把 decorateFake 的資訊塞進 VM；
    // 為保持 VM 精簡，我這裡仍以圖片為主，標題/頻道建議在 UI render 層處理。
    remixWithImages(selectedImages, selectedChannel?.logo ?? "/logo/logo.png", selectedChannel?.channel_name ?? "Your Channel Name", title, { max: 4 });
  };

  const handleReset = () => {
    resetRemix();
  };


  const triggerFileDialog = () => {
    const input = containerRef.current?.querySelector<HTMLInputElement>("input[type=file]");
    input?.click();
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length >= MAX_IMAGES) {
        setErrors(`最多只能上傳 ${MAX_IMAGES} 張圖片`);
        return;
      }
      setErrors(null);

      // 1) 過濾大小 & 限制數量
      const validFiles = acceptedFiles.filter((file) => file.size <= 2_000_000);
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
          { duration: 4000, position: "top-left" }
        );
      }

      // 2) 對每個檔案：
      //    - 建 blob 預覽 URL（給 UI 即時顯示）
      //    - 壓縮成 480x270，轉成 data URL 存到 sessionStorage
      for (const file of finalFiles) {
        // 預覽（blob URL）
        const blobUrl = URL.createObjectURL(file);
        setPreviews((prev) => [...prev, blobUrl]);
        setImages((prev) => [...prev, file]);

        try {
          // 壓縮一個版本（前面你已有 compressImage）
          const mdFile = await compressImage(file, 480, 270);
          const dataUrl = await fileToDataURL(mdFile);

          // 存到 state + sessionStorage（持久）
          setUploadedUrls((prev) => {
            const updated = [...prev, dataUrl]; // 存 data URL
            sessionStorage.setItem("selected_images", JSON.stringify(updated));
            return updated;
          });
        } catch (err) {
          console.error("本地處理圖片出錯", err);
          toast.error("處理圖片時發生錯誤", { position: "top-left" });
        }
      }
    },
    [images.length]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/png": [], "image/jpg": [], "image/jpeg": [] },
    multiple: true,
    maxSize: 2_000_000,
    noClick: true,
  });


  return (
    <div className="space-y-4 max-w-6xl mx-auto" ref={containerRef}>
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
                if (images.length < MAX_IMAGES) triggerFileDialog();
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


// 上傳 & 預覽
// const onDrop = useCallback(
//   async (acceptedFiles: File[]) => {
//     if (images.length >= MAX_IMAGES) {
//       setErrors(`最多只能上傳 ${MAX_IMAGES} 張圖片`);
//       return;
//     }
//     setErrors(null);

//     const validFiles = acceptedFiles.filter((file) => file.size <= 2_000_000);
//     const remaining = MAX_IMAGES - images.length;
//     const finalFiles = validFiles.slice(0, remaining);

//     if (acceptedFiles.length > remaining) {
//       toast.custom(
//         () => (
//           <div className="flex items-center gap-2 bg-primary text-primary px-4 py-2 rounded-3xl shadow-md">
//             <AlertTriangle className="text-yellow-300" size={20} />
//             <span className="text-sm text-white">
//               最多只能放 {MAX_IMAGES} 張圖片，僅保留前 {remaining} 張
//             </span>
//           </div>
//         ),
//         { duration: 4000, position: "top-left" }
//       );
//     }

//     for (const [index, file] of finalFiles.entries()) {
//       const previewIndex = previews.length + index;

//       // 本地預覽
//       const previewUrl = await new Promise<string>((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onload = () => resolve(reader.result as string);
//         reader.onerror = () => reject(new Error("讀取圖片失敗"));
//         reader.readAsDataURL(file);
//       });

//       setPreviews((prev) => [...prev, previewUrl]);
//       setImages((prev) => [...prev, file]);
//       setUploadingIndexes((prev) => [...prev, previewIndex]);

//       try {
//         // 壓縮兩個版本
//         const mdFile = await compressImage(file, 480, 270);
//         const smFile = await compressImage(file, 320, 180);

//         // 並行上傳
//         const [resOriginal, resMd, resSm] = await Promise.all([
//           uploadThumbnailAndGetUrl(file),
//           uploadThumbnailAndGetUrl(mdFile),
//           uploadThumbnailAndGetUrl(smFile),
//         ]);

//         const allSuccess = resOriginal.success && resMd.success && resSm.success;

//         if (allSuccess) {
//           const finalUrl = resMd.url || resOriginal.url;
//           if (finalUrl) {
//             setUploadedUrls((prev) => {
//               const updated = [...prev, finalUrl];
//               sessionStorage.setItem("selected_images", JSON.stringify(updated));
//               return updated;
//             });
//           } else {
//             toast.error("找不到縮圖 URL", { position: "top-left" });
//           }
//         } else {
//           toast.error("圖片上傳失敗，請稍後再試", { position: "top-left" });
//         }
//       } catch (error) {
//         console.error("圖片處理或上傳出錯", error);
//         toast.error("處理圖片時發生錯誤", { position: "top-left" });
//       } finally {
//         setUploadingIndexes((prev) => prev.filter((i) => i !== previewIndex));
//       }
//     }
//   },
//   [images.length, previews.length]
// );