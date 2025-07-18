"use client";
import { XCircle, ImagePlus, AlertTriangle, GitCompareArrows, RotateCcw } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import useTranslationStore from "@/lib/global-store/use-translation-store";
import { useParams } from "next/navigation";
import { uploadThumbnailAndGetUrl } from '@/actions/supabase/supabaseImages';
import { useVideoContext } from "@/context/youtube-video-provider";
import UserChannelStore from "@/lib/global-store/user-channel-store";
import VideoSettingStore from "@/lib/global-store/upload-store";
import useVideoSelectionStore from "@/lib/global-store/video-selection-store";

interface Props {
  onUpload: (urls: string[]) => Promise<void>;
  onRemix?: (remixFn: (videos: any[], setVideos: (v: any[]) => void) => void) => void;
}

const MAX_IMAGES = 4;

const ThumbnailGrid: React.FC<Props> = ({ onUpload, onRemix }) => {
  
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<string | null>(null);
  const {selectedChannel, setSelectedChannel} = UserChannelStore();

  const { locale } = useParams() as { locale: string };
  const { getTranslation } = useTranslationStore();
  const pageId = "device_preview_page";
  const translations = getTranslation(pageId, locale) || {};
  const {selectedTitle, title} = VideoSettingStore();
  const {} = useVideoSelectionStore();

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

  useEffect(() => {
  if (selectedChannel) {
    console.log("Selected Channel: changed", selectedChannel);

    const currentVideos = getVideosByKey("remixed");
    if (currentVideos?.length) {
      const updatedVideos = currentVideos.map((video) => {
        if (video.id?.startsWith("fake-")) {
          return {
            ...video,
            channelName: selectedChannel.channel_name,
            channelLogo: selectedChannel.logo,
          };
        }
        return video;
      });
      setVideosByKey("remixed", updatedVideos);
    }
  }
}, [selectedChannel]);

 useEffect(() => {
  if (selectedChannel) {
    console.log("Selected Channel: changed", selectedChannel);

    const currentVideos = getVideosByKey("remixed");
    if (currentVideos?.length) {
      const updatedVideos = currentVideos.map((video) => {
        if (video.id?.startsWith("fake-")) {
          return {
            ...video,
            channelName: selectedChannel.channel_name,
            channelLogo: selectedChannel.logo,
          };
        }
        return video;
      });
      setVideosByKey("remixed", updatedVideos);
    }
  }
}, [selectedChannel]);

 useEffect(() => {
  if (selectedTitle) {
    console.log("Selected selectedTitle: changed", selectedTitle);

    const currentVideos = getVideosByKey("remixed");
    if (currentVideos?.length) {
      const updatedVideos = currentVideos.map((video) => {
        if (video.id?.startsWith("fake-")) {
          return {
            ...video,
            title: selectedTitle,
          };
        }
        return video;
      });
      setVideosByKey("remixed", updatedVideos);
    }
  }
}, [selectedTitle]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length >= MAX_IMAGES) {
      setErrors(`最多只能上傳 ${MAX_IMAGES} 張圖片`);
      return;
    }

    const validFiles = acceptedFiles.filter((file) => file.size <= 2_000_000);
    const remaining = MAX_IMAGES - images.length;
    const finalFiles = validFiles.slice(0, remaining);

    if (acceptedFiles.length > remaining) {
      toast.custom(() => (
        <div className="flex items-center gap-2 bg-primary text-primary px-4 py-2 rounded-3xl shadow-md">
          <AlertTriangle className="text-yellow-300" size={20} />
          <span className="text-sm text-white">最多只能放 {MAX_IMAGES} 張圖片，僅保留前 {remaining} 張</span>
        </div>
      ), {
        duration: 4000,
        position: "top-left",
      });
    }

    setImages((prev) => [...prev, ...finalFiles]);

    const uploaded: string[] = [];
    for (const file of finalFiles) {
      const res = await uploadThumbnailAndGetUrl(file);
      if (res.success && res.url) {
        uploaded.push(res.url);
      } else {
        toast.error(`上傳失敗：${res.message}`, { position: "top-left" });
      }
    }

    const newUploaded = [...uploadedUrls, ...uploaded];
    setUploadedUrls(newUploaded);
    setPreviews((prev) => [...prev, ...uploaded]);
    sessionStorage.setItem("selected_images", JSON.stringify(newUploaded));
  }, [images.length, uploadedUrls]);

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadedUrls((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      sessionStorage.setItem("selected_images", JSON.stringify(updated));
      return updated;
    });
  };

  const { getVideosByKey, setVideosByKey, setActiveKey } = useVideoContext();

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

    const baseVideos = getVideosByKey("search"); // 例如 remix 用搜尋結果混合
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
        className="w-full flex flex-col gap-y-2 rounded-lg border border-dashed border-foreground p-2 shadow-sm shadow-foreground "
      >
        <div className="grid grid-cols-2 gap-2 w-full">
          {previews.map((src, i) => (
            <div key={i} className="relative group">
              <img
                src={src}
                alt={`src-${src}`}
                className="w-full h-auto object-contain rounded-lg"
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

          {images.length < MAX_IMAGES && (
            <div
              onClick={() => {
                if (images.length < MAX_IMAGES) {
                  document.querySelector<HTMLInputElement>("input[type=file]")?.click();
                }
              }}
              className="aspect-video w-full flex items-center justify-center border-2 border-dashed border-muted-foreground rounded-lg text-muted-foreground hover:bg-muted/50 transition"
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
          className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50 cursor-pointer hover:bg-blue-500 transition-colors"
        >
          <GitCompareArrows className="inline-block mr-2" />
          {translations?.remix_button?.translation ?? "Remix2"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50 cursor-pointer hover:bg-blue-500 transition-colors"
        >
          <RotateCcw className="inline-block mr-2" />
          {translations?.reset_button?.translation ?? "Reset2"}
        </button>
      </div>
    </div>
  );
};

export default ThumbnailGrid;
