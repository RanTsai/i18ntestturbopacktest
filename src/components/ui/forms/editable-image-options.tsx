"use client";

import { useState, useRef } from "react";
import { Plus, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Question } from "@/lib/schema/questionaire-schema";
import { uploadThumbnailAndGetUrlFreeUser } from "@/actions/supabase/supabase-images"; //Change to withPath if needed
import { ImageSelectorDialog } from "./image-selector-dialog";
import { useParams } from "next/navigation";
import useTranslationStore from "@/lib/global-store/use-translation-store";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import Image from "next/image";

export function EditableImageOptions({
  pageId,
  question,
  onChange,
}: {
  pageId: string;
  question: Question;
  onChange: (id: string, updated: Partial<Question>) => void;
}) {
  const { locale } = useParams() as { locale: string };

  const { getTranslation } = useTranslationStore();
  const translations = getTranslation(pageId, locale) || {};
  const [dragging, setDragging] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const targetImageIdRef = useRef<string | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const options = question.options || [];

  const handleDelete = (id: string) => {
    const updated = options.filter((opt) => opt.value !== id);
    onChange(question.id, { options: updated });
    if (question.placeholder === id) {
      onChange(question.id, { placeholder: updated[0]?.value || "" });
    }
  };

  const handleAddPlaceholder = () => {
    if (options.length >= 4) {
      toast.error("最多只能有四張圖片");
      return;
    }
    const newOption = {
      value: `img_${crypto.randomUUID()}`,
      label: "https://placehold.co/600x400?text=New+Image",
    };
    onChange(question.id, { options: [...options, newOption] });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    if (options.length >= 4) {
      toast.error("最多只能有四張圖片");
      return;
    }

    const result = await uploadThumbnailAndGetUrlFreeUser(file);

    if (!result.success) {
      toast.error(`上傳失敗：${result.message}`);
      return;
    }

    const newOption = {
      value: `img_${crypto.randomUUID()}`,
      label: result.url ?? "https://placehold.co/600x400?text=New+Image",
    };

    onChange(question.id, { options: [...options, newOption] });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const result = await uploadThumbnailAndGetUrlFreeUser(file);
    if (!result.success) {
      toast.error(`上傳失敗：${result.message}`);
      return;
    }

    const updatedOptions = options.map((opt) =>
      opt.value === targetImageIdRef.current
        ? { ...opt, label: result.url ?? opt.label }
        : opt
    );

    onChange(question.id, { options: updatedOptions });
    targetImageIdRef.current = null;
  };

  return (
    <>
      {/* 圖片選擇視窗 */}
      <ImageSelectorDialog
        pageId={pageId}
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={(url) => {
          const updatedOptions = options.map((opt) =>
            opt.value === targetImageIdRef.current ? { ...opt, label: url } : opt
          );
          onChange(question.id, { options: updatedOptions });
          targetImageIdRef.current = null;
        }}
      />

      <div
        className="space-y-2 mt-3"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="grid grid-cols-2 gap-3">
          {options.map((opt, index) => {
            const isSelected = question.placeholder === opt.value;
            const isHovering = hoverIndex === index;

            return (
              <div
                key={opt.value}
                tabIndex={0} // 讓 focus 樣式生效（鍵盤可聚焦）
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
                onClick={() => {
                  onChange(question.id, { placeholder: opt.value });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange(question.id, { placeholder: opt.value });
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  targetImageIdRef.current = opt.value;
                  setSelectorOpen(true);
                }}
                className={`group relative overflow-hidden cursor-pointer transition aspect-video select-none input-interactive ${
                  isSelected ? "border-2 border-purple-500" : ""
                }`}
              >
                <Image
                  src={opt.label}
                  alt="image"
                  className="w-full h-full object-cover pointer-events-none transform transition-transform duration-200 ease-in-out group-hover:scale-105"
                />
                {isHovering && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(opt.value);
                    }}
                    className="absolute top-1 right-1 p-1 text-red-500 hover:text-red-700 bg-white rounded-full shadow-sm"
                    aria-label="刪除圖片"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            );
          })}

          {options.length < 4 && (
            <TooltipProvider>
              <Tooltip delayDuration={800}>
                <TooltipTrigger asChild>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={handleAddPlaceholder}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleAddPlaceholder();
                      }
                    }}
                    className={`border-2 border-dashed flex flex-col items-center justify-center text-gray-400 cursor-pointer h-32 transition input-interactive ${
                      dragging ? "bg-purple-100 border-purple-400" : ""
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <Plus size={16} className="mr-1" />
                      {translations?.new_image_drag?.translation ??
                        "Double click or Drag Image"}
                    </div>
                    <ImagePlus size={30} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {translations?.new_image_drag?.tooltip ??
                    "Double click to select image from your library, or drag and drop new image here"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </>
  );
}

