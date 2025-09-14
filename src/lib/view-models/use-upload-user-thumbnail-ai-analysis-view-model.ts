// ------------------------------------------------------------
// 1️⃣ 主 ViewModel：useThumbnailUploadFlowViewModel
// ------------------------------------------------------------
// ✅ 建議的 ViewModel 拆分架構 for ImageUploaderClient 頁面

// ------------------------------------------------------------
// 1️⃣ 主 ViewModel：useThumbnailUploadFlowViewModel
// ------------------------------------------------------------
// 管理整個 "縮圖上傳 + 儲存 + 審查 + 選擇 + 評分" 的流程邏輯

// /lib/view-models/use-upload-user-thumbnail-ai-analysis-view-model.ts
"use client";

import toast from "react-hot-toast";
import userGlobalStore from "../global-store/users-store";
import { useThumbnailReviewViewModel }from "./use-thumbnail-review-view-model";
import { useUserChannelStore } from "../global-store/use-user-channel-store";
import { useVideoSettingViewModel } from "./use-video-setting-view-model";
import { uploadThumbnailAndGetUrlWithPath } from "@/actions/supabase/supabaseImages";
import { insertUserThumbnailWorkToSupabaseRPC } from "@/actions/supabase/supabase-upload-thumbnail-user-work";
import { useUploadImageViewModel } from "./use-upload-image-view-model"; // ✅ 新增
import { AIResponse } from "../schema/aiscore-schema";

export function useUploadUserThumbnailAIAnalysisViewModel(storageKey: string) {
  const { uploads, setUploads } = useThumbnailReviewViewModel(storageKey);
  const { selectedChannel } = useUserChannelStore();
  const { video_type, tags, titles, description } =
    useVideoSettingViewModel();
  const { theUser } = userGlobalStore(); // Clerk user

  // 從本地 IDB hook 取方法
  const { getAllVariantsByFileName } = useUploadImageViewModel({ max: 6 }); // ✅ 新增

  const handleUpload = async (files: File[], formtitle: string) => {
    if (files.length > 6) {
      toast.error("selected_too_many");
      return;
    }
    if (!theUser?.clerk_user_id) {
      toast.error("Not authenticated");
      return;
    }

    try {
      // 1) 產生本次 work 的 publicId，並立刻記在 sessionStorage（之後 VM 會用）
      const publicWorkId = "Thumbnail-" + crypto.randomUUID();
      sessionStorage.setItem(storageKey, publicWorkId);

      const newUploads: IUsersWorkVersion[] = [];
      const stuffList: IUserThumbnailStuff[] = [];

      for (const [index, file] of files.entries()) {
        const versionNumber = index + 1;
        const cleanName = file.name.replace(/\s+/g, "_");
        const basePath = `thumbnails/${theUser.clerk_user_id}/${publicWorkId}/${versionNumber}`;

        // 2) 嘗試從 IDB 取三尺寸；取不到就 fallback 用原始檔（確保 Card 立刻可顯示）
        const rec = await getAllVariantsByFileName(`${file.name}__${file.size}`);
        const originalBlob = rec?.original ?? file;
        const mediumBlob   = rec?.thumb400 ?? file;
        const smallBlob    = rec?.thumb200 ?? file;

        const toFile = (blob: Blob, name: string, type: string) =>
          blob instanceof File ? blob : new File([blob], name, { type });

        // 3) 正式上傳（有三尺寸就上傳三個；沒有就三個都用原始檔）
        const originalFile = toFile(originalBlob, cleanName, file.type);
        const { url: originalUrl } = await uploadThumbnailAndGetUrlWithPath(
          originalFile, `${basePath}/original/${cleanName}`
        );

        const mediumFile = toFile(mediumBlob, cleanName, file.type);
        const { url: mediumUrl } = await uploadThumbnailAndGetUrlWithPath(
          mediumFile, `${basePath}/medium/${cleanName}`
        );

        const smallFile = toFile(smallBlob, cleanName, file.type);
        const { url: smallUrl } = await uploadThumbnailAndGetUrlWithPath(
          smallFile, `${basePath}/small/${cleanName}`
        );

        // 4) 填 versions（UI 用 medium_url；沒有中圖就退回 original）
        newUploads.push({
          version_number: versionNumber,
          summary: null,
          user_note: null,
          stuff_public_id: null,
          status: "new",
          medium_url: mediumUrl ?? originalUrl ?? "",
        });

        // 5) 填 stuff（供 RPC）
        stuffList.push({
          small_url: smallUrl ?? originalUrl ?? "",
          medium_url: mediumUrl ?? originalUrl ?? "",
          original_url: originalUrl ?? "",
          name: file.name,
          description,
          content: null,
          mime_type: file.type,
          public_id: null,
          user_note: null,
          tags,
          source: "uploaded",
          type: "thumbnail",
          category: null,
          is_deleted: false,
          deleted_at: null,
          created_at: new Date().toISOString(),
        });
      }

      // 6) 先更新 UI（立刻看到 Card）+ 寫入 IDB（以 publicId 為 key）
      const mergedUploads = [...uploads, ...newUploads];
      setUploads(mergedUploads);

      // 7) 呼叫 RPC（成功與否不影響 UI 顯示）
      const input: IInsertUserWorkInput = {
        work: {
          worktype: video_type,
          description,
          status: "new",
          is_public: false,
          public_id: publicWorkId,
        },
        versions: newUploads.map((v) => ({
          version_number: v.version_number,
          image_url: v.medium_url ?? "",
          ai_score: v.ai_score,
          ai_comment: v.ai_comment,
        })),
        thumbnail: {
          medium_url: newUploads[0]?.medium_url ?? "",
          title: formtitle,
          description,
          platform: "youtube",
          tags,
          titles,
          user_channel_name: selectedChannel?.channel_name ?? null,
        },
        stuff: stuffList,
      };

      const result = await insertUserThumbnailWorkToSupabaseRPC(input);
      console.log("InsertUserWorkToSupabaseRPC result:", result);

      toast.success("✅ All files uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };

  function addVersion(newFile: IUsersWorkVersion) {
    setUploads([...uploads, newFile]);
  }
  function deleteVersion(index: number) {
    setUploads(uploads.filter((_, i) => i !== index));
  }

  return {
    uploads,
    setUploads,
    handleUpload,
    addVersion,
    deleteVersion,
  };
}


//AUTOSAVE 範例，暫時不需要
// import { useEffect } from "react";
// import { debounce } from "lodash"; // or自己寫

// const syncWorkVersions = async (uploads: UploadedVersions[], userWorkId: number) => {
//   await supabase.rpc("sync_user_work_versions", {
//     p_work_id: userWorkId,
//     p_versions: uploads.map((v, idx) => ({
//       version_number: idx + 1,
//       image_url: v.image_url,
//       ai_score: v.ai_score,
//       ai_comment: v.ai_feedback,
//     })),
//   });
// };

// export function useAutoSave(uploads: UploadedVersions[], userWorkId: number) {
//   useEffect(() => {
//     if (!userWorkId || uploads.length === 0) return;

//     const debounced = debounce(() => {
//       console.log("Autosaving versions to DB...");
//       syncWorkVersions(uploads, userWorkId);
//     }, 3000); // 停止操作 3 秒後自動保存

//     debounced();
//     return () => debounced.cancel();
//   }, [uploads, userWorkId]);
// }



// ===========================
// TABLE: users_work
// ===========================
export interface IUsersWork {
  created_at?: string;              // TIMESTAMPTZ (ISO string)
  public_id: string | null;        // TEXT
  clerk_user_id?: number;        // BIGINT (FK -> user_basic)
  worktype: string | null;         // TEXT
  description: string | null;      // TEXT
  current_version: number | null;  // INT
  status: string | null;           // TEXT
  deleted_at: string | null;       // TIMESTAMPTZ
  deleted_by: string | null;       // TEXT
  is_deleted: boolean;             // BOOLEAN DEFAULT false
  is_public: boolean;              // BOOLEAN DEFAULT false
}

// ===========================
// TABLE: users_work_counter
// ===========================
export interface IUsersWorkCounter {
  view_count: number;     // INT DEFAULT 0
  rate_count: number;     // INT DEFAULT 0
  like_count: number;     // INT DEFAULT 0
  version_count: number;  // INT DEFAULT 0
}

// ===========================
// TABLE: users_work_version
// ===========================
export interface IUsersWorkVersion {
  medium_url: string; // TEXT
  version_number: number;        // SMALLINT
  created_at?: string;            // TIMESTAMPTZ (ISO string)
  is_latest?: boolean;            // BOOLEAN DEFAULT false
  summary: string | null;        // TEXT
  user_note: string | null;      // TEXT
  ai_score?: Record<string, any> | null; // JSONB
  ai_comment?: string | null;     // TEXT
  stuff_public_id: string | null; // number
  status: string | null;         // TEXT
  isLoading?: boolean;      // LOCAL USE ONLY
  ai_feedback?: AIResponse | null; // LOCAL USE ONLY
}

// ===========================
// TABLE: thumbnail_work
// ===========================
export interface IThumbnailWork {
  medium_url: string | null;      // TEXT
  title: string | null;          // TEXT
  description: string | null;    // TEXT
  platform: string | null;       // TEXT
  user_note: string | null;      // TEXT
  titles: string[] | null;       // TEXT[]
  user_channel_id: number | null;   // number
  tags: Record<string, any> | null; // JSONB
  target_audience: number[] | null; // INT[]
  video_category: string | null;  // TEXT[]
}

export interface IUserThumbnailStuff {
  small_url: string;                // TEXT (not null)
  medium_url: string;               // TEXT (not null)
  original_url: string;             // TEXT (not null)
  name: string | null;              // TEXT
  description: string | null;       // TEXT
  content: Record<string, any> | null; // JSONB
  mime_type: string | null;         // TEXT
  public_id: string | null;         // TEXT
  user_note: string | null;         // TEXT
  tags: Record<string, any> | null; // JSONB
  source: string; //"uploaded" | "generated" | "created" | "bookmarked"; // TEXT with check constraint
  type: string; //"thumbnail" | "cover" | "icon" | "intext";             // TEXT with check constraint
  category: string | null;          // TEXT
  is_deleted: boolean;              // BOOLEAN DEFAULT false
  deleted_at: string | null;        // TIMESTAMPTZ
  created_at: string;               // TIMESTAMPTZ DEFAULT now()
}

interface IUserWorkWithDetails {
  work: IUsersWork;
  versions: IUsersWorkVersion[];
  thumbnail: IThumbnailWork;
  counter: IUsersWorkCounter;
}

export interface IInsertUserWorkInput {
  work: {
    worktype: string;
    description: string | null;
    status: string | null;
    is_public: boolean;
    public_id: string;
  };
  versions: {
    version_number: number;
    image_url: string;
    ai_score?: Record<string, any> | null;
    ai_comment?: string | null;
  }[];
  thumbnail: {
    medium_url: string;
    title: string;
    description: string | null;
    platform: string | null;
    tags: Record<string, any> | null;
    titles: string[];
    user_channel_name: string | null;
  };
  stuff: IUserThumbnailStuff[];
}