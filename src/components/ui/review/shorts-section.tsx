//components/ui/review/shorts-section.tsx
"use client";
import React from "react";
import { MoreVertical } from "lucide-react";

export interface ShortVideo {
  id: string;
  title: string;
  thumbnail: string;
}

export default function ShortsSection() {
  const [shorts, setShorts] = React.useState<ShortVideo[]>([]);

  React.useEffect(() => {
    const fetchShorts = async () => {
      const res = await fetch("/api/youtubeshorts");
      const data = await res.json();
      setShorts(data);
    };
    fetchShorts();
  }, []);

  return (
    <div className="bg-black text-white px-2 py-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-red-500 font-bold">▶</span>
        <p className="font-semibold">Shorts</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {shorts.map((short) => (
          <div key={short.id} className="relative flex flex-col bg-zinc-900 rounded-md overflow-hidden aspect-[9/16]">
            <img src={short.thumbnail} alt={short.title} className="w-full h-full object-cover" />
            <div className="absolute top-1 left-1 text-xs bg-gray-500 rounded px-1">New</div>
            <div className="absolute top-1 right-1">
              <MoreVertical className="w-4 h-4 text-white" />
            </div>
            <div className="absolute bottom-1 left-1 text-xs font-normal px-1 rounded text-shadow">
              {short.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
