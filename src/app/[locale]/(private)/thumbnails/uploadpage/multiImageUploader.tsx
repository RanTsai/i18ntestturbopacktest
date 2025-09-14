'use client';

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ImagePlus, XCircle } from "lucide-react";
import { useParams } from 'next/navigation';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { PageTranslations } from "@/i18n/interface";
type PersistedFile = { name: string; type: string; size: number; preview: string };
type PersistedState = { title: string; files: PersistedFile[] };

const MultiImageUploader: React.FC<{
  onUpload: (files: File[], title: string) => Promise<void>;
  translation?: PageTranslations
}> = ({ onUpload, translation }) => {
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const { locale } = useParams() as { locale: string };
  const pageId = "signed_up_upload_review";

  // 唯一 key
  const SS_KEY = React.useMemo(() => `miu:${pageId}:${locale}`, [pageId, locale]);

  const formSchema = z.object({
    title: z.string().min(1, { message: translation?.title_error?.tooltip ?? "Title is required" }),
    images: z.any().refine((files) => Array.isArray(files) && files.length > 0,
      translation?.file_required?.translation ?? "Please upload at least one image"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { title: "", images: [] },
  });

  // 防止初始化/還原期間覆蓋 sessionStorage
  const isRestoringRef = React.useRef(true);
  const hasRestoredRef = React.useRef(false);

  // ---- helpers for sessionStorage ----
  const saveToSession = React.useCallback((title: string, files: File[], previewsArr: string[]) => {
    try {
      const filesPersist: PersistedFile[] = files.map((f, i) => ({
        name: f.name || `image-${i + 1}`,
        type: f.type || "image/jpeg",
        size: f.size || 0,
        preview: previewsArr[i], // dataURL
      }));
      const payload: PersistedState = { title, files: filesPersist };
      sessionStorage.setItem(SS_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to save uploader state to sessionStorage", e);
    }
  }, [SS_KEY]);

  const readAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const dataURLToFile = async (dataURL: string, name: string, type?: string) => {
    const res = await fetch(dataURL);
    const blob = await res.blob();
    return new File([blob], name, { type: type || blob.type });
  };

  // ---- Drop ----
  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const merged = [...selectedFiles, ...acceptedFiles].slice(0, 6);

      const existingCount = selectedFiles.length;
      const newOnes = merged.slice(existingCount);
      const newPreviews = await Promise.all(newOnes.map(readAsDataURL));
      const nextPreviews = [...previews, ...newPreviews].slice(0, 6);

      setSelectedFiles(merged);
      setPreviews(nextPreviews);
      form.setValue("images", merged);
      form.clearErrors("images");

      // 只有「已完成還原」才會寫（防止初始化時清空）
      const currentTitle = form.getValues("title") || "";
      if (hasRestoredRef.current) {
        saveToSession(currentTitle, merged, nextPreviews);
      }
    },
    [form, previews, selectedFiles, saveToSession]
  );

  // ---- Remove ----
  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== indexToRemove);
    const updatedPreviews = previews.filter((_, i) => i !== indexToRemove);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
    form.setValue("images", updatedFiles);

    const currentTitle = form.getValues("title") || "";
    if (hasRestoredRef.current) {
      saveToSession(currentTitle, updatedFiles, updatedPreviews);
    }
  };

  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 2_000_000,
    accept: { "image/png": [], "image/jpg": [], "image/jpeg": [] },
  });

  // ---- Submit ----
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // 送出時也保留目前快照（避免後續流程導致空存）
    saveToSession(values.title || "", selectedFiles, previews);
    await onUpload(values.images, values.title);
    // 不清除 sessionStorage：只有關閉 Tab 才會消失
  }

  const showErrors = form.formState.submitCount > 0;

  // ---- 還原（只在第一次裝載時執行） ----
  React.useEffect(() => {
    const raw = sessionStorage.getItem(SS_KEY);
    (async () => {
      try {
        if (raw) {
          const parsed: PersistedState = JSON.parse(raw);
          const limitFiles = (parsed.files ?? []).slice(0, 6);
          const restoredFiles = await Promise.all(
            limitFiles.map(f => dataURLToFile(f.preview, f.name, f.type))
          );
          const restoredPreviews = limitFiles.map(f => f.preview);

          setSelectedFiles(restoredFiles);
          setPreviews(restoredPreviews);
          form.setValue("images", restoredFiles);
          form.setValue("title", parsed.title || "");
          form.clearErrors("images");
        }
      } catch (e) {
        console.warn("Failed to restore uploader state from sessionStorage", e);
      } finally {
        // 標記已完成還原
        isRestoringRef.current = false;
        hasRestoredRef.current = true;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SS_KEY]);

  // ---- 僅追蹤「title 變更」：但需避免在還原/無檔案時覆蓋 ----
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name !== "title") return;
      if (isRestoringRef.current) return;                // 還原中不寫
      if (!hasRestoredRef.current) return;               // 還沒完成還原不寫
      if (selectedFiles.length === 0 || previews.length === 0) return; // 沒檔案不寫（避免清空）
      saveToSession(value.title || "", selectedFiles, previews);
    });
    return () => subscription.unsubscribe();
  }, [form, selectedFiles, previews, saveToSession]);

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* 標題輸入 */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full max-w-6xl mx-auto">
                <FormLabel>{translation?.title_header?.translation ?? "Title"}</FormLabel>
                <FormControl>
                  <Tooltip delayDuration={800}>
                    <TooltipTrigger asChild>
                      <Tooltip delayDuration={800}>
                        <TooltipTrigger asChild>
                          <Input
                            placeholder={translation?.title_input?.translation ?? "Enter a title"}
                            {...field}
                            className="hover:border-purple-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/70 outline-none transition-colors"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          {translation?.title_input?.tooltip ?? "Enter a video title here, you can change it later"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipTrigger>
                    <TooltipContent>
                      {translation?.title_input?.tooltip ?? "Enter a video title here, you can change it later"}
                    </TooltipContent>
                  </Tooltip>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 圖片上傳 */}
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full max-w-6xl mx-auto">
                <FormLabel className={showErrors && fileRejections.length !== 0 ? "text-destructive" : ""}>
                  {translation?.Uploaded_Thumbnail?.translation ?? "Upload Thumbnail"}
                </FormLabel>
                <FormControl>
                  <div
                    {...getRootProps()}
                    className="w-full mx-auto flex flex-col items-center justify-center gap-y-4 rounded-lg border border-foreground p-8 shadow-sm shadow-foreground cursor-pointer
             hover:border-purple-400 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-500/60 transition-colors"
                  >
                    {previews.length > 0 ? (
                      <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 w-full">
                        {previews.map((src, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={src}
                              alt={`preview-${i}`}
                              className="max-h-[120px] w-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile(i);
                              }}
                              className="absolute top-1 right-1 text-gray-500 text-xs rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:text-red-500"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ImagePlus className="size-32 text-muted-foreground" />
                    )}
                    <Input {...getInputProps()} type="file" multiple />
                    <p className="text-sm text-muted-foreground">
                      {translation?.upload_area_note?.translation ?? "Click here or drag images to upload (PNG, JPG, JPEG)"}
                    </p>
                  </div>
                </FormControl>
                <FormMessage />
                {showErrors && fileRejections.length > 0 && (
                  <p className="text-sm text-destructive mt-1">
                    {translation?.file_error?.translation ?? "Max size 2MB. Only PNG, JPG, JPEG allowed."}
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* 提交按鈕 */}
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className={`mx-auto block h-auto rounded-lg px-8 py-3 text-xl cursor-pointer transition-colors
            ${form.formState.isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
          >
            {form.formState.isSubmitting
              ? (translation?.submitting?.translation ?? "Submitting...")
              : (translation?.submit?.translation ?? "Submit")}
          </Button>
        </form>
      </Form>
    </TooltipProvider>
  );
};

export default MultiImageUploader;
