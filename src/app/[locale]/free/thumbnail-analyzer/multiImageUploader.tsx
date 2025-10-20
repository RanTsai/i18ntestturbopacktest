"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ImagePlus, XCircle } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { PageTranslations } from "@/i18n/interface";
import { useUploadImageViewModel } from "@/lib/view-models/use-upload-image-view-model";
import { useVideoSettingViewModel } from "@/lib/view-models/use-video-setting-view-model";
import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";

type FormSchema = z.infer<typeof formSchema>;

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  images: z.any().refine((files) => Array.isArray(files) && files.length > 0, "Please upload at least one image"),
});

const MultiImageUploader: React.FC<{
  onUpload: (files: File[], title: string) => Promise<void>;
  onSubmitted: () => void;          // 👈 新增：通知父層切換為 submitted
  submitted: boolean;               // 👈 新增：由父層控制是否已提交（本元件不使用它渲染，只作為備查）
  translation?: PageTranslations;
  storageKey: string;
  onPreviewCountChange?: (n: number) => void   // ⬅️ 新增
  resetToken?: number;                      // ⬅️ 新增
  onStartUpload?: (count: number) => void;

}> = ({ onUpload, onSubmitted, translation, onPreviewCountChange, resetToken, onStartUpload }) => {


  const form = useForm<FormSchema>({
    resolver: zodResolver(
      formSchema
        .extend({
          title: z.string().min(1, {
            message: translation?.title_error?.tooltip ?? "Title is required",
          }),
        })
        .extend({
          images: z.any().refine(
            (files) => Array.isArray(files) && files.length > 0,
            translation?.file_required?.translation ?? "Please upload at least one image"
          ),
        })
    ),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { title: "", images: [] },
  });

  const {
    selectedFiles,
    previews,
    hasRestored,
    restoredTitle,
    addFiles,
    removeAt,
    saveToSession,
    resetAll,
  } = useUploadImageViewModel({ max: 6 });

  const {
    titles,
    setTitles,
    title: vmTitle,
    setTitle: setVmTitle,
    selectedTitle,
  } = useVideoSettingViewModel();

  const activeIndex = useMemo(() => {
    const idx = titles.findIndex((t) => t === selectedTitle);
    return idx >= 0 ? idx : 0;
  }, [titles, selectedTitle]);

  const lastVmTitleRef = useRef<string>(vmTitle);
  const lastFormTitleRef = useRef<string>("");

  useEffect(() => {
    const sub = form.watch((val, { name }) => {
      if (name !== "title") return;
      const t = val.title ?? "";
      if (lastFormTitleRef.current === t) return;
      lastFormTitleRef.current = t;

      // 更新 store.title
      setVmTitle(t);

      // ✅ 只有在 titles 有內容時才同步對應那筆
      if (titles.length > 0) {
        const arr = [...titles];
        const idx = Math.min(Math.max(activeIndex, 0), arr.length - 1);
        arr[idx] = t;
        setTitles(arr);
      }
    });
    return () => sub.unsubscribe();
  }, [form, titles, activeIndex, setVmTitle, setTitles]);

  useEffect(() => {
    if (resetToken === undefined) return;

    (async () => {
      // 1) 先清 VM（預設：清 state + 清 session + 刪掉這次 session 的 IDB）
      await resetAll();

      // 2) 再清 RHF 表單狀態 & 錯誤
      form.reset({ title: "", images: [] });
      form.clearErrors();

      // 3) 也把這兩個 ref 歸零，避免 VM→Form、Form→VM 的同步殘留
      lastVmTitleRef.current = "";
      lastFormTitleRef.current = "";

      // 4) 如果你有 onPreviewCountChange，通知父層現在是 0
      onPreviewCountChange?.(0);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  useEffect(() => {
    if (lastVmTitleRef.current !== vmTitle) {
      form.setValue("title", vmTitle ?? "", { shouldDirty: true, shouldValidate: true });
      lastVmTitleRef.current = vmTitle ?? "";
    }
  }, [vmTitle, form]);

  // Dropzone
  const onDrop = React.useCallback(
    async (accepted: File[]) => {
      const { merged, mergedMetas } = await addFiles(accepted);
      form.setValue("images", merged);
      form.clearErrors("images");
      if (hasRestored) {
        const currentTitle = form.getValues("title") || "";
        saveToSession(currentTitle, mergedMetas);
      }
    },
    [addFiles, form, hasRestored, saveToSession]
  );

  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 2_000_000,
    accept: { "image/png": [], "image/jpg": [], "image/jpeg": [] },
  });

  // 移除單張
  const handleRemoveFile = async (index: number) => {
    const { files, metas: ms } = await removeAt(index);
    form.setValue("images", files);
    if (hasRestored) {
      const currentTitle = form.getValues("title") || "";
      saveToSession(currentTitle, ms);
    }
  };

  // 初次還原完成 → 把 VM 狀態灌回表單
  React.useEffect(() => {
    if (!hasRestored) return;
    if (selectedFiles.length > 0) {
      form.setValue("images", selectedFiles);
      form.clearErrors("images");
    }
    if (restoredTitle) {
      form.setValue("title", restoredTitle);
    }
  }, [hasRestored]); // eslint-disable-line

  // 僅追蹤 title 改變 → 有檔案且已還原才寫入 session
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name !== "title") return;
      if (!hasRestored) return;
      if (selectedFiles.length === 0 || previews.length === 0) return;
      saveToSession(value.title || "");
    });
    return () => subscription.unsubscribe();
  }, [form, hasRestored, selectedFiles.length, previews.length, saveToSession]);

  useEffect(() => {
    onPreviewCountChange?.(previews.length);
  }, [previews.length, onPreviewCountChange]);
  // 送出
  async function onSubmit(values: FormSchema) {
    const ok = await form.trigger("title");
    if (!ok) return;

    const finalTitle = (vmTitle || "").trim();
    if (!finalTitle) {
      form.setError("title", { type: "manual", message: "Title is required" });
      return;
    }
    onStartUpload?.(values.images?.length ?? 0);

    await onUpload(values.images, finalTitle);
    onSubmitted();
  }

  const showErrors = form.formState.submitCount > 0;

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
                      <Input
                        {...field}
                        placeholder={translation?.title_input?.translation ?? "Enter a title"}
                        className="
      border
      hover:border-purple-400
      focus:border-2
      focus-visible:outline-none
      focus-visible:ring-0
      focus-visible:ring-offset-0
      focus-visible:border-purple-600
      transition-colors
    "
                      />


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
                      <div className="
      grid w-full gap-3
      grid-cols-[repeat(auto-fit,minmax(160px,1fr))]  /* base: 自動 1~3 欄 */
      md:grid-cols-3                                   /* md 以上固定 3 欄 */
      lg:grid-cols-6                                   /* lg 以上固定 6 欄 */
    ">
                        {previews.map((src, i) => (
                          <div key={i} className="relative group">
                            <Image
                              src={src}
                              alt={`preview-${i}`}
                              width={160}
                              height={120}
                              sizes="(min-width: 1024px) 16.6vw, (min-width: 768px) 33vw, 50vw"
                              className="w-full aspect-[4/3] object-cover rounded-lg"  /* 讓圖片填滿格子 */
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile(i);
                              }}
                              className="absolute top-1 right-1 text-red-500 text-xs rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:text-purple-500"
                              aria-label="remove image"
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
