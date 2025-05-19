"use server";

import supabase from "@/config/supabase.config";

export const uploadThumbnailAndGetUrl = async (file:File) => {
try{
    const fileName=file.name+Date.now();
    const {data, error} = await supabase.storage.from('thumbnails').upload(fileName, file);
    if (error){
        console.log("upload thumbnail error ", error.message)
        throw new Error(error.message);
    }

    console.log("upload thumbnail success ",data)

    const { data : urlResponse} = await supabase.storage.from("thumbnails").getPublicUrl(fileName);
    console.log("upload thumbnail url ",urlResponse)

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