// components/ui/review/video-card.tsx
import React from "react";
import { MoreVertical } from "lucide-react";
import { Video } from "@/lib/schema/user-channel-schema";

export default function VideoCard({ video }: { video: Video }) {
  return (
    <div className="group">
      <div className="relative rounded overflow-hidden aspect-video">
        <img
          src={video.thumbnail}
          alt="Video Thumbnail"
          className="w-full h-full object-cover rounded transform transition-transform duration-300 ease-in-out group-hover:scale-105"
        />
        <span className="absolute bottom-1 right-1 bg-black/70 text-xs px-1 rounded">
          {video.length}
        </span>
      </div>
      <div className="flex mt-2 px-1">
        <img
          src={video.channelLogo}
          alt="Channel Logo"
          className="w-9 h-9 rounded-full object-cover"
        />
        <div className="flex flex-col flex-1 ml-2">
          <p className="text-sm font-semibold line-clamp-2">{video.title}</p>
          <p className="text-xs text-gray-400">{video.channelName}</p>
          <p className="text-xs text-gray-400">{video.views} • {video.uploadedAt}</p>
        </div>
        <MoreVertical className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}
