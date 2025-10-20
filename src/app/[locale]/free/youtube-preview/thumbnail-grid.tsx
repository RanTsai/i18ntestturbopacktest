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
// ⛔️ 刪除：import { uploadThumbnailAndGetUrlFreeUser } from "@/actions/supabase/supabase-images";
import { useYoutubeVideosVM } from "@/lib/view-models/use-youtube-localcache-view-model";
import UserChannelStore from "@/lib/global-store/user-channel-store";
import VideoSettingStore from "@/lib/global-store/upload-store";
import { PageTranslations } from "@/i18n/interface";
import compressImage from "@/lib/compress-image";
import Image from "next/image";

interface Props {
  translations?: PageTranslations;
}

const MAX_IMAGES = 4;

// 小工具：把 File 轉成 dataURL
async function fileToDataURL(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      if (typeof res === "string") resolve(res);
      else reject(new Error("Failed reading image: result is not a string"));
    };
    reader.onerror = () => reject(new Error("Failed reading image"));
    reader.readAsDataURL(file);
  });
}

const ThumbnailGrid: React.FC<Props> = ({ translations }) => {
  // 本地檔案（僅為了刪除時使用；主要還是以 previews 為主）
  
  // dataURL 預覽（同時也是 remix 的來源）
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<string | null>(null);

  const { selectedChannel } = UserChannelStore();
  const { selectedTitle, title } = VideoSettingStore();
  const { remixWithImages, resetRemix } = useYoutubeVideosVM();

  // 初始化：從 sessionStorage 還原 dataURL 陣列
  useEffect(() => {
    const saved = sessionStorage.getItem("selected_images");
    if (!saved) return;

    try {
      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed)) return;

      const urls: string[] = parsed
        .map((item: unknown) => {
          if (typeof item === "string") return item;
          if (
            item &&
            typeof item === "object" &&
            "image_url" in item &&
            typeof (item as { image_url: unknown }).image_url === "string"
          ) {
            return (item as { image_url: string }).image_url;
          }
          return null;
        })
        .filter((x): x is string => typeof x === "string");

      if (urls.length > 0) {
        setPreviews(urls);
      }
    } catch (err) {
      console.error("error in getting selected_images", err);
    }
  }, []);

  // 本地處理：壓縮 → 轉 dataURL → 存 sessionStorage
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const occupied = previews.length;
      if (occupied >= MAX_IMAGES) {
        setErrors(`You can upload up to ${MAX_IMAGES} images`);
        return;
      }

      const remaining = MAX_IMAGES - occupied;

      // 建議仍保留檔案大小限制，避免 sessionStorage 爆掉（~5MB 附近）
      const validFiles = acceptedFiles.filter((file) => file.size <= 2_000_000);
      const finalFiles = validFiles.slice(0, remaining);

      if (acceptedFiles.length > remaining) {
        toast.custom(
          () => (
            <div className="flex items-center gap-2 bg-primary text-primary px-4 py-2 rounded-3xl shadow-md">
              <AlertTriangle className="text-yellow-300" size={20} />
              <span className="text-sm text-white">
                Max {MAX_IMAGES} images，Keeping the first {remaining}
              </span>
            </div>
          ),
          { duration: 4000, position: "top-left" }
        );
      }

      try {
        const newDataURLs: string[] = [];

        for (const file of finalFiles) {
          // 只在本地壓縮（避免 dataURL 太大）
          const mdFile = await compressImage(file, 480, 270); // 你既有的工具，回傳 File
          const dataUrl = await fileToDataURL(mdFile); // 轉成 dataURL
          newDataURLs.push(dataUrl);
        }

        // 更新狀態
        setPreviews((prev) => {
          const updated = [...prev, ...newDataURLs];
          // 持久化到 sessionStorage（存字串陣列即可）
          sessionStorage.setItem("selected_images", JSON.stringify(updated));
          return updated;
        });
      } catch (error) {
        console.error("Error in local processing", error);
        toast.error("Error in processing image", { position: "top-left" });
      }
    },
    [previews.length]
  );

  const handleRemove = (index: number) => {
    setPreviews((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      sessionStorage.setItem("selected_images", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemix = () => {
    const saved = sessionStorage.getItem("selected_images");
    if (!saved) return;

    let selectedImages: unknown;
    try {
      selectedImages = JSON.parse(saved);
    } catch {
      return;
    }
    if (!Array.isArray(selectedImages)) return;

    const urls = (selectedImages as unknown[])
      .map((item) =>
        typeof item === "string"
          ? item
          : item &&
            typeof item === "object" &&
            "image_url" in item &&
            typeof (item as { image_url: unknown }).image_url === "string"
          ? (item as { image_url: string }).image_url
          : null
      )
      .filter((x): x is string => typeof x === "string");

    if (urls.length === 0) return;

    // 直接把 dataURL 丟進去；Next/Image 支援 data: 協定
    remixWithImages(
      urls,
      selectedChannel?.logo ?? "/logo/logo.png",
      selectedChannel?.channel_name ?? "channel name",
      selectedTitle || title || "Your video title",
      { max: 4 }
    );
  };

  const handleReset = () => {
    // 清空本地與 sessionStorage
    setPreviews([]);
    sessionStorage.removeItem("selected_images");
    resetRemix();
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

  const occupied = previews.length;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div
        {...getRootProps()}
        className="w-full flex flex-col gap-y-2 rounded-lg border border-dashed border-foreground p-2 shadow-sm shadow-foreground"
      >
        <div className="grid grid-cols-2 gap-2 w-full">
          {previews.map((src, i) => (
            <div key={i} className="relative group">
              <Image
                src={src} // dataURL
                alt={`src-${i}`}
                width={480}
                height={270}
                className="w-full h-auto object-contain rounded-lg"
                // 注意：dataURL 不需要在 next.config 圖片白名單
              />

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
            </div>
          ))}

          {occupied < MAX_IMAGES && (
            <div
              onClick={() => {
                if (occupied < MAX_IMAGES) {
                  document.querySelector<HTMLInputElement>(
                    'input[type="file"]'
                  )?.click();
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
              "Click here or drag images (PNG, JPG, JPEG). No server upload — local only."}
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
