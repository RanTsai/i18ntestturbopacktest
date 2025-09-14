import toast from "react-hot-toast";

/**
 * 下載圖片到本地端
 * @param url 圖片 URL
 * @param filename 預設檔名 (預設 thumbnail.jpg)
 */
export async function handleDownload(url: string, filename = "thumbnail.jpg") {
  try {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.click();

    // 釋放記憶體
    window.URL.revokeObjectURL(blobUrl);
    toast.success("✅ Download successful!");
  } catch (error) {
    console.error("Download failed:", error);
    toast.error("❌ Download failed");
  }
}
