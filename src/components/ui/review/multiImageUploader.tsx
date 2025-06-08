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
import { ImagePlus } from "lucide-react";

const MultiImageUploader: React.FC<{
  onUpload: (files: File[], title: string) => void;
}> = ({ onUpload }) => {
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);

  const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    images: z
      .any()
      .refine((files) => Array.isArray(files) && files.length > 0, "Please upload at least one image"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
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
    onUpload(values.images, values.title);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* 標題輸入 */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
<FormItem className="w-full max-w-6xl mx-auto">
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a title" {...field} />
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
              <FormLabel className={fileRejections.length !== 0 ? "text-destructive" : ""}>
                <h2 className="text-xl font-semibold tracking-tight">Upload your images</h2>
              </FormLabel>
              <FormControl>
                <div
                  {...getRootProps()}
                  className="w-full mx-auto flex flex-col items-center justify-center gap-y-4 rounded-lg border border-foreground p-8 shadow-sm shadow-foreground cursor-pointer"
                >
                  {previews.length > 0 ? (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 w-full">
                      {/* <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 w-full"> */}

                      {previews.map((src, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={src}
                            alt={`preview-${i}`}
                            className="max-h-[120px] w-full object-cover rounded-lg"
                          />
                          {/* X Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(i);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full p-1
            opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ImagePlus className="size-32 text-muted-foreground" />
                  )}
                  <Input {...getInputProps()} type="file" multiple />
                  <p className="text-sm text-muted-foreground">
                    Click here or drag images to upload (PNG, JPG, JPEG)
                  </p>
                </div>
              </FormControl>
              {fileRejections.length > 0 ? (
                <FormMessage>Max size 2MB. Only PNG, JPG, JPEG allowed.</FormMessage>
              ) : (
                <FormMessage />
              )}
            </FormItem>
          )}
        />

        {/* 提交按鈕 */}
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="mx-auto block h-auto rounded-lg px-8 py-3 text-xl"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default MultiImageUploader;
