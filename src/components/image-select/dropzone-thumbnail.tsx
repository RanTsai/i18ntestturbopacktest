"use client";
import { useCallback, useState } from "react";

export function DropzoneThumbnail({
  onDropImage,
}: {
  onDropImage: (url: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onDropImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, [onDropImage]);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`aspect-[16/9] border-2 border-dashed rounded-lg flex items-center justify-center text-sm text-muted-foreground transition-colors
        ${isDragging ? "bg-blue-100 border-blue-400" : "bg-gray-100 hover:bg-gray-200 border-gray-300"}`}
    >
      {isDragging ? "鬆開來放入縮圖" : "拖曳圖片到這裡（最多4個）"}
    </div>
  );
}
