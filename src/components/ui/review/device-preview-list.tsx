"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

// 單個項目：根據解析度決定寬高
const DevicePreviewItem: React.FC<{
  title: string;
  resolution: string; // e.g. "1920×1080"
  description?: string;
  image: string;
}> = ({ title, resolution, description, image }) => {
  // 解析 "1920×1080"
  const [width, height] = resolution.split("×").map(Number);

  return (
    <div className="border-b border-gray-700 py-4 space-y-2 hover:bg-gray-800 transition rounded">
      {/* Title + Resolution */}
      <div className="flex justify-between items-center text-sm font-semibold text-white">
        <span>{title}</span>
        <span className="text-xs text-gray-400">{resolution}</span>
      </div>

      {/* 圖片 + Info */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div
          className="rounded overflow-hidden shadow"
          style={{
            width: `${Math.min(width / 4, 300)}px`, // 自動縮放最大寬度
            height: `${Math.min(height / 4, 200)}px`, // 自動縮放最大高度
          }}
        >
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex flex-col text-xs text-gray-400 justify-between">
          <div>
            <p className="font-semibold text-white">Enter your title to see how it looks</p>
            {description && <p className="mt-1 text-gray-300">{description}</p>}
            <p className="mt-1">Your Channel</p>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <Info className="h-4 w-4" />
            <p>123K views • 1 hour ago</p>
          </div>
        </div>
      </div>

      {/* 按鈕 */}
      <div className="flex justify-end mt-2">
        <Button size="sm" variant="outline">Edit Thumbnail</Button>
      </div>
    </div>
  );
};

// 主元件：多個設備預覽
const DevicePreviewList: React.FC<{ image: string }> = ({ image }) => {
  return (
    <div className="bg-black text-white p-4 rounded-lg space-y-6">
      <h2 className="text-xl font-bold">Web Browser</h2>

      <DevicePreviewItem
        title="Home Large"
        resolution="1920×1080"
        image={image}
      />
      <DevicePreviewItem
        title="Home Small"
        resolution="640×360"
        image={image}
      />
      <DevicePreviewItem
        title="Sidebar"
        resolution="320×180"
        image={image}
      />
      <DevicePreviewItem
        title="Channel Page: Large"
        resolution="1280×720"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        image={image}
      />
      <DevicePreviewItem
        title="Channel Page: Small"
        resolution="640×360"
        image={image}
      />
      <DevicePreviewItem
        title="History"
        resolution="854×480"
        image={image}
      />
    </div>
  );
};

export default DevicePreviewList;
