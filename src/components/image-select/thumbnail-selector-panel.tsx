"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import ThumbnailGrid from "./thumbnail-grid";
import { useThumbnailSelection } from "@/hooks/thumbnail-selector/thumbnail-selector";
import useVideoSelectionStore from "@/lib/global-store/video-selection-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, XCircle } from "lucide-react"; // ✅ 加入 XCircle icon
import useTranslationStore from "@/lib/global-store/use-translation-store";

export function ThumbnailSelectorPanel() {
  const { thumbnails, addThumbnail, removeThumbnail } = useThumbnailSelection();
  const { selectedVideos, removeVideo } = useVideoSelectionStore(); // ✅ removeVideo 引入
  const { getTranslation } = useTranslationStore();
  const { locale } = useParams() as { locale: string };
  const pageId = "device_preview_page";
  const translations = getTranslation(pageId, locale) || {};

  return (
    <div className="max-h-screen overflow-auto p-4 rounded-2xl flex flex-col bg-muted">
      <Tabs defaultValue="thumbnails" className="space-y-4">
        <TabsList className="w-full flex justify-start gap-1">
          <TabsTrigger value="thumbnails" className="text-xs px-2 py-1">
            {translations?.thumbnails_tab?.translation || "Thumbnails"}
          </TabsTrigger>
          <TabsTrigger value="board" className="text-xs px-2 py-1">
            {translations?.board_tab?.translation || "Board"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="thumbnails">
          <ThumbnailGrid
            onUpload={async (urls: string[]) => {
              if (urls.length > 0) {
                sessionStorage.setItem("uploadedImageUrls", JSON.stringify(urls));
                toast.success("圖片上傳完成！");
              } else {
                toast.error("圖片全部上傳失敗");
              }
            }}
          />
        </TabsContent>

        <TabsContent value="board">
          <div className="rounded-xl p-1">
            <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-3 border border-muted-foreground/30 rounded-xl">
              <TooltipProvider>
                {selectedVideos.map((video, idx) => (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <div className="relative group">
                        <img
                          src={video.thumbnail}
                          alt={`Selected thumbnail ${idx}`}
                          className="w-full aspect-video rounded-lg object-cover border"
                        />
                        {/* ❌ 刪除按鈕 */}
                        <button
                          onClick={() => removeVideo(video.thumbnail)}
                          className="absolute top-1 right-1 text-gray-500 text-xs rounded-full opacity-0 group-hover:opacity-100 transition hover:text-red-500 cursor-pointer"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <span className="text-xs">{video.title}</span>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>

            {/* ✅ Compare 按鈕 */}
            <div className="text-center mt-6">
              <button className="px-3 py-1.5 text-sm bg-primary text-white rounded focus:outline-none disabled:opacity-50 cursor-pointer hover:bg-blue-500 transition-colors">
                <Eye className="inline-block mr-1.5 w-4 h-4" />
                {translations?.compare_button?.translation || "Board"}

              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
