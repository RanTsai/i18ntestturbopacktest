'use client';

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ImagePlus, XCircle } from "lucide-react";
import { useParams } from 'next/navigation';
import useTranslationStore from "@/lib/global-store/use-translation-store";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const MultiImageUploader: React.FC<{
  onUpload: (files: File[], title: string) => Promise<void>;
}> = ({ onUpload }) => {
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const { getTranslation } = useTranslationStore();
  const { locale } = useParams() as { locale: string };
  const pageId = "signed_up_upload_review";
  const translations = getTranslation(pageId, locale) || {};

  const formSchema = z.object({
    title: z.string().min(1, { message: translations?.title_error?.tooltip ?? "Title is required" }),
    images: z
      .any()
      .refine((files) => Array.isArray(files) && files.length > 0, translations?.file_required?.translation ?? "Please upload at least one image"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",          // ✅ 只在提交時驗證
    reValidateMode: "onChange",// ✅ 提交後邊改邊驗證
    defaultValues: {
      title: "",
      images: [],
    },
  });

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const previewsArray: string[] = [];
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          previewsArray.push(reader.result as string);
          setPreviews([...previewsArray]);
        };
        reader.readAsDataURL(file);
      });

      setSelectedFiles(acceptedFiles);
      form.setValue("images", acceptedFiles);
      form.clearErrors("images");
    },
    [form]
  );

  const handleRemoveFile = (indexToRemove: number) => {
    const updatedPreviews = previews.filter((_, i) => i !== indexToRemove);
    const updatedFiles = selectedFiles.filter((_, i) => i !== indexToRemove);
    setPreviews(updatedPreviews);
    setSelectedFiles(updatedFiles);
    form.setValue("images", updatedFiles);
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 2_000_000,
    accept: { "image/png": [], "image/jpg": [], "image/jpeg": [] },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await onUpload(values.images, values.title);
  }

  // 🔸（可選）只在按過提交後才顯示 Dropzone 的錯誤
  const showErrors = form.formState.submitCount > 0;

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* 標題輸入：不會在 onBlur 就報錯，改為提交才驗證 */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full max-w-6xl mx-auto">
                <FormLabel>{translations?.title_header?.translation ?? "Title"}</FormLabel>
                <FormControl>
                  <Tooltip delayDuration={800}>
                    <TooltipTrigger asChild>
                      <Tooltip delayDuration={800}>
                        <TooltipTrigger asChild>
                          <Input
                            placeholder={translations?.title_input?.translation ?? "Enter a title"}
                            {...field}
                            className="hover:border-purple-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/70 outline-none transition-colors"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          {translations?.title_input?.tooltip ?? "Enter a video title here, you can change it later"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipTrigger>
                    <TooltipContent>
                      {translations?.title_input?.tooltip ?? "Enter a video title here, you can change it later"}
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
                <FormLabel
                  className={
                    // 🔸 可選：讓紅色只在送出後且有錯時出現
                    showErrors && fileRejections.length !== 0 ? "text-destructive" : ""
                  }
                >
                  {translations?.Uploaded_Thumbnail?.translation ?? "Upload Thumbnail"}
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
                      {translations?.upload_area_note?.translation ?? "Click here or drag images to upload (PNG, JPG, JPEG)"}
                    </p>
                  </div>
                </FormControl>

                {/* 表單層級的 images 驗證訊息（只會在 submit 後出現） */}
                <FormMessage />

                {/* 🔸（可選）Dropzone 拒收的訊息若也想延後到提交後再顯示，就加 showErrors 判斷 */}
                {showErrors && fileRejections.length > 0 && (
                  <p className="text-sm text-destructive mt-1">
                    {translations?.file_error?.translation ?? "Max size 2MB. Only PNG, JPG, JPEG allowed."}
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
              ? (translations?.submitting?.translation ?? "Submitting...")
              : (translations?.submit?.translation ?? "Submit")}
          </Button>
        </form>
      </Form>
    </TooltipProvider>
  );
};

export default MultiImageUploader;
