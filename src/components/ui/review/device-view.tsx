"use client";
import React from "react";

// 單個預覽項目
const DevicePreviewItem: React.FC<{
  title: string;
  description?: string;
  image: string;
}> = ({ title, description, image }) => {
  return (
    <div className="border-b border-gray-700 py-4 space-y-2">
      <div className="text-sm font-semibold text-white flex justify-between">
        <span>{title}</span>
        <span className="text-xs text-gray-400">123K views • 1 hour ago</span>
      </div>
      <div className="flex gap-4">
        <img
          src={image}
          alt={title}
          className="w-48 h-auto rounded shadow object-cover"
        />
        <div className="flex flex-col text-xs text-gray-400">
          <p className="font-semibold text-white">
            Enter your title to see how it looks
          </p>
          {description && (
            <p className="mt-1 text-gray-300">{description}</p>
          )}
          <p className="mt-1">Your Channel</p>
        </div>
      </div>
    </div>
  );
};

// 整體元件
const DevicePreviewList: React.FC<{ image: string }> = ({ image }) => {
  return (
    <div className="bg-black text-white p-4 rounded-lg space-y-6">
      <h2 className="text-xl font-bold">Web Browser</h2>

      <DevicePreviewItem
        title="Home Large"
        image={image}
      />
      <DevicePreviewItem
        title="Home Small"
        image={image}
      />
      <DevicePreviewItem
        title="Sidebar"
        image={image}
      />
      <DevicePreviewItem
        title="Channel Page: Large"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        image={image}
      />
      <DevicePreviewItem
        title="Channel Page: Small"
        image={image}
      />
      <DevicePreviewItem
        title="History"
        image={image}
      />
    </div>
  );
};

export default DevicePreviewList;
