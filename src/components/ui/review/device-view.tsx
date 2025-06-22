"use client";
import React, { useState, useEffect } from "react";

interface DevicePreviewProps {
  image: string;
  title: string;
}

const DevicePreview: React.FC<DevicePreviewProps> = ({ image, title }) => {
  const [desktopResolution, setDesktopResolution] = useState<string>("");
  const [mobileResolution, setMobileResolution] = useState<string>("");

  useEffect(() => {
    // 取得圖片的原始大小
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const res = `${img.naturalWidth}x${img.naturalHeight}`;
      setDesktopResolution("1920x1080");
      setMobileResolution("560x480"); // 假設同一張縮圖
    };
  }, [image]);

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Desktop View */}
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow bg-black">
        <div className="flex justify-between items-center bg-gray-800 text-white px-4 py-2 font-semibold">
          <span>Desktop View</span>
          {desktopResolution && (
            <span className="text-xs text-gray-400">{desktopResolution}</span>
          )}
        </div>
        <div className="aspect-video bg-black">
          <img
            src={image}
            alt={title}
            className="object-contain w-full h-full"
          />
        </div>
      </div>

      {/* Mobile View */}
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow bg-black max-w-xs mx-auto">
        <div className="flex justify-between items-center bg-gray-800 text-white px-4 py-2 font-semibold">
          <span>Mobile View</span>
          {mobileResolution && (
            <span className="text-xs text-gray-400">{mobileResolution}</span>
          )}
        </div>
        <div className="aspect-video bg-black">
          <img
            src={image}
            alt={title}
            className="object-contain w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default DevicePreview;
