import React from "react";
import { MoreVertical, Square, CheckSquare } from "lucide-react";
import { YoutubeVideo } from "@/lib/schema/youtube-video-schema";

type VideoCardProps = {
  video: YoutubeVideo;
  variant?: "default" | "horizontal";
  isSelected?: boolean;
};

export default function VideoCard({ video, variant = "default", isSelected = false }: VideoCardProps) {
  const checkboxClasses = `absolute top-1 right-1 z-10 bg-black/60 rounded p-0.5 transition-opacity
  ${isSelected ? "opacity-100 text-green-300" : "opacity-0 group-hover:opacity-100"}`;


  if (variant === "horizontal") {
    return (
      <div className="flex gap-3 group relative">
        {/* ✅ Checkbox icon：hover 顯示，選取時常駐 */}
        <div className={checkboxClasses}>
          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
        </div>

        {/* Thumbnail */}
        <div className="relative w-40 min-w-[160px] aspect-video rounded overflow-hidden">
          <img
            src={video.thumbnail}
            alt="Video Thumbnail"
            className="w-full h-full object-cover rounded transform transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
          <span className="absolute bottom-1 right-1 bg-black/70 text-xs px-1 rounded text-white">
            {video.length}
          </span>
        </div>

        {/* 文字區塊 */}
        <div className="flex-1 flex flex-col justify-between">
          <p className="text-sm font-semibold text-foreground line-clamp-2">{video.title}</p>
          <div className="flex items-center mt-1 space-x-2">
            <img src={video.channelLogo} alt="Channel Logo" className="w-6 h-6 rounded-full object-cover" />
            <span className="text-xs text-muted-foreground">{video.channelName}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {video.views} • {video.uploadedAt}
          </p>
        </div>

        <MoreVertical className="w-4 h-4 text-muted-foreground self-start" />
      </div>
    );
  }

  // Default vertical version
  return (
    <div className="group relative">
      {/* ✅ Checkbox icon：hover 顯示，選取時常駐 */}
      <div className={checkboxClasses}>
        {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
      </div>

      <div className="relative rounded overflow-hidden aspect-video">
        <img
          src={video.thumbnail}
          alt="Video Thumbnail"
          className="w-full h-full object-cover rounded transform transition-transform duration-300 ease-in-out group-hover:scale-105"
        />
        <span className="absolute bottom-1 right-1 bg-black/70 text-xs px-1 rounded text-white">
          {video.length}
        </span>
      </div>

      <div className="flex mt-2 px-1">
        <img src={video.channelLogo} alt="Channel Logo" className="w-9 h-9 rounded-full object-cover" />
        <div className="flex flex-col flex-1 ml-2">
          <p className="text-sm font-semibold text-foreground line-clamp-2">{video.title}</p>
          <p className="text-xs text-muted-foreground">{video.channelName}</p>
          <p className="text-xs text-muted-foreground">
            {video.views} • {video.uploadedAt}
          </p>
        </div>
        <MoreVertical className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
}
