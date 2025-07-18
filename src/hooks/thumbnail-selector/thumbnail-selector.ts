import { useEffect, useState } from "react";

export function useThumbnailSelection() {
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("thumbnail_selection");
    if (stored) setThumbnails(JSON.parse(stored));
  }, []);

  const addThumbnail = (url: string) => {
    if (thumbnails.length >= 4) return false;
    const updated = [...thumbnails, url];
    setThumbnails(updated);
    localStorage.setItem("thumbnail_selection", JSON.stringify(updated));
    return true;
  };

  const removeThumbnail = (index: number) => {
    const updated = thumbnails.filter((_, i) => i !== index);
    setThumbnails(updated);
    localStorage.setItem("thumbnail_selection", JSON.stringify(updated));
  };

  return { thumbnails, addThumbnail, removeThumbnail };
}
