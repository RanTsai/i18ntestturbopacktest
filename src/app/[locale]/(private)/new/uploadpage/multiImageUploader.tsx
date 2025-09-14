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
import { useParams } from "next/navigation";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { PageTranslations } from "@/i18n/interface";
import { useUploadImageViewModel } from "@/lib/view-models/use-upload-image-view-model";

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
}> = ({ onUpload, onSubmitted, submitted, translation, storageKey }) => {
  const { locale } = useParams() as { locale: string };
  const pageId = "signed_up_upload_review";

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
  } = useUploadImageViewModel({ max: 6 });

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

  // 送出
  async function onSubmit(values: FormSchema) {
    // 先把快照留下
    saveToSession(values.title || "");
    await onUpload(values.images, values.title);

    // ✅ 改為呼叫父層：父層自己設置 hasUploaderSubmitted 並處理 localStorage
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
                        placeholder={translation?.title_input?.translation ?? "Enter a title"}
                        {...field}
                        className="hover:border-purple-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/70 outline-none transition-colors"
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
