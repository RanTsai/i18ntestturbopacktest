"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useTranslationStore from "@/lib/global-store/use-translation-store";
import Image from "next/image";

interface Props {
  pageId: string;
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function ImageSelectorDialog({ pageId, open, onClose, onSelect }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const { locale } = useParams() as { locale: string }

  const { getTranslation } = useTranslationStore();
  const translations = getTranslation(pageId, locale) || {};


  useEffect(() => {
    if (!open) return;

    const fetchImages = async () => {
      const sessionImages = JSON.parse(
        sessionStorage.getItem("selected_images") || "[]"
      ); // 本地暫存圖片
      setImages([...sessionImages]);
    };

    fetchImages();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogTitle>{translations?.image_select_dialog?.translation ?? "Choose an image"}</DialogTitle>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {images.map((url, idx) => (
            <Image
              key={idx}
              src={url}
              alt="Choose an image"
              className="w-full aspect-video object-cover border-2 border-transparent hover:border-purple-500 cursor-pointer rounded-md"
              onClick={() => {
                onSelect(url);
                onClose();
              }}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
