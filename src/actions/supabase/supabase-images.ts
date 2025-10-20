//This file is used to process images with Supabase

"use server";
import supabase from "@/config/supabase.config";
import { getErrorMessage } from "@/lib/utils/message-utils";

export const uploadThumbnailAndGetUrlFreeUser = async (file:File) => {
try{
    const fileName=file.name+Date.now();
    const {error} = await supabase.storage.from('thumbnails/freeuser').upload(fileName, file,{
        upsert: true, // 如果同名檔案存在則覆蓋
      });
    if (error){
        // console.log("upload thumbnail error ", error.message)
        throw new Error(error.message);
    }

    // console.log("upload thumbnail success ",data)

    const { data : urlResponse} = await supabase.storage.from("thumbnails/freeuser").getPublicUrl(fileName);
    // console.log("upload thumbnail url ",urlResponse)

    return {
        success : true,
        url : urlResponse.publicUrl        
    }

}catch (error:unknown){
  const message = getErrorMessage(error);
    return {
        success:false,
        message: message
    }
}
}

export const uploadThumbnailAndGetUrlWithPath = async (file:File, path: string) => {
  //console.log("uploadThumbnailAndGetUrlWithPath called with path:", path);
try {
    const { error } = await supabase.storage
      .from("thumbnails")
      .upload(path, file, {
        upsert: true, // 如果同名檔案存在則覆蓋
      });

      //console.log("Supabase upload error:", error);
    if (error) throw new Error(error.message);
    

    const { data: urlResponse } = supabase.storage
      .from("thumbnails")
      .getPublicUrl(path);

      //console.log("Supabase public URL response:", urlResponse);
    return {
      success: true,
      url: urlResponse.publicUrl,
      path,
    };
  } catch (error: unknown) {
     const message = getErrorMessage(error);
     console.error("Error in uploadThumbnailAndGetUrlWithPath:", message);
    return {
        success:false,
        message: message
    }
  }
};
