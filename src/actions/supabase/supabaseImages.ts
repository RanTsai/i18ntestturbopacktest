//This file is used to process images with Supabase

"use server";
import supabase from "@/config/supabase.config";

export const uploadThumbnailAndGetUrl = async (file:File) => {
try{
    const fileName=file.name+Date.now();
    const {data, error} = await supabase.storage.from('thumbnails').upload(fileName, file);
    if (error){
        // console.log("upload thumbnail error ", error.message)
        throw new Error(error.message);
    }

    // console.log("upload thumbnail success ",data)

    const { data : urlResponse} = await supabase.storage.from("thumbnails").getPublicUrl(fileName);
    // console.log("upload thumbnail url ",urlResponse)

    return {
        success : true,
        url : urlResponse.publicUrl        
    }

}catch (error:any){
    return {
        success:false,
        message: error.message
    }
}
}

export const getUserImage = async () => {
try{
       return {
        success : true,
        url : ["https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails//TheMonkeyMan%20V3.jpg"]
    }

}catch (error:any){
    return {
        success:false,
        message: error.message
    }
}
}