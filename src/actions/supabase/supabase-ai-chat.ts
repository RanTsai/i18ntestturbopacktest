// "use server"
// import { auth } from "@clerk/nextjs/server";
// import supabase from "@/config/supabase.config";
// import type { ChatAttachmentPart } from "@/lib/schema/chat-attachments"
// import { getErrorMessage } from "@/lib/utils/message-utils";

// export type JSONValue =
//   | string
//   | number
//   | boolean
//   | null
//   | { [key: string]: JSONValue }
//   | JSONValue[];


// export async function fetchALLChatThreadFromSupabaseRPC(user_work_public_id?: string | null, version_number?: number | null) {
//   try {
//     // 1. 取得 Clerk 使用者
//     const clerkUser = await auth();
//     if (!clerkUser.userId) {
//       console.error("Not authenticated");
//       return {
//         success: false,
//         code: "USER_NOT_AUTHENTICATED",
//         message: "USER NOT AUTHENTICATED",
//         data: null,
//       };
//     }

//     // 2. 驗證 input
//     //const parsed = IInsertHumanReviewInput.parse(input);

//     // 3. 呼叫 RPC
//     //console.log("Calling fetch_ai_chat_threads_by_user with work_id:", user_work_public_id, "user id", clerkUser.userId);
//     const { data, error } = await supabase.rpc("fetch_ai_chat_threads_by_user", {
//       p_clerk_user_id: clerkUser.userId, // 🚩 RPC 內會自己找 supabase_user_id
//       p_user_work_public_id: user_work_public_id,
//       p_version_number: version_number ?? null
//     });

//     //console.log("fetched data", data, "error", error ?? "no error");
//     if (error || !data) {
//       console.error("error fetch_ai_chat_threads_by_user ", error?.message);
//       return {
//         success: false,
//         message: error?.message ?? "Failed to insert human Revew",
//         data: null,
//       };
//     }
//     //console.log("fetch_ai_chat_threads_by_user successful", data);

//     return {
//       success: true,
//       message: "All chats fetched successfully",
//       data,
//     };
//   } catch (err: unknown) {
//     const error = err as Error;
//     //console.error("caught error fetch_ai_chat_threads_by_user ", error.message);

//     return {
//       success: false,
//       message: error.message,
//       data: null,
//     };
//   }
// }


// /**
//  * insert AI chat Project到supabase的function
//  * @param input 
//  * @returns 
//  */
// export async function insertAIChatProjectToSupabaseRPC(input: IInsertAIChatProjectToSupabase) {
//   try {
//     // 1. 取得 Clerk 使用者
//     const clerkUser = await auth();
//     if (!clerkUser.userId) {
//       console.error("Not authenticated");
//       return {
//         success: false,
//         code: "USER_NOT_AUTHENTICATED",
//         message: "USER NOT AUTHENTICATED",
//         data: null,
//       };
//     }

//     // 2. 驗證 input
//     //const parsed = IInsertHumanReviewInput.parse(input);

//     // 3. 呼叫 RPC
//     console.log("Calling insert_human_review RPC with input:", input);
//     const { data, error } = await supabase.rpc("insert_ai_chat_message", {
//       p_clerk_user_id: clerkUser.userId, // 🚩 RPC 內會自己找 supabase_user_id
//       p_input: input,
//     });

//     if (error || !data) {
//       console.error("error insert_human_review_with_versions ", error?.message);
//       return {
//         success: false,
//         message: error?.message ?? "Failed to insert human Revew",
//         data: null,
//       };
//     }
//     console.log("insert_human_review_with_versions Human Review inserted successfully");

//     return {
//       success: true,
//       message: "Human Review inserted successfully",
//       data,
//     };
//   }  catch (err: unknown) {
//     const error = err as Error;
//     console.error("caught error insert_human_review_with_versions ", error?.message);

//     return {
//       success: false,
//       message: error.message ?? "Unknown error",
//       data: null,
//     };
//   }
// }


// //--------------------------------Run by Server API Route------------------------------
// export async function createChatThreadIfNeeded(input: {
//   threadPublicId?: string | null;
//   projectPublicId?: string | null;
//   titleSeed?: string | null;
//   userWorkPublicId?: string | null;
// }) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       return {
//         success: false,
//         code: "USER_NOT_AUTHENTICATED",
//         message: "USER NOT AUTHENTICATED",
//         data: null,
//       };
//     }
//     console.log("creating chat in supabase with work id", input.userWorkPublicId);

//     const { data, error } = await supabase.rpc("rpc_create_chat_thread_if_needed", {
//       p_clerk_user_id: userId,
//       p_thread_public_id: input.threadPublicId ?? null,
//       p_project_public_id: input.projectPublicId ?? null,
//       p_title: input.titleSeed ?? null,
//       p_user_work_public_id: input.userWorkPublicId ?? null,
//     });

//     // ⚠️ setof text → data 是 string[]
//     const thread_public_id: string | undefined =
//       Array.isArray(data)
//         ? (typeof data[0] === "string" ? data[0] : undefined)
//         : undefined;

//     if (error || !thread_public_id) {
//       console.log("error in creating chat thread return", error, data);
//       return {
//         success: false,
//         message: error?.message ?? "Failed to create/resolve chat thread",
//         data: null,
//       };
//     }

//     return {
//       success: true,
//       message: "Thread ready",
//       data: { thread_public_id },
//     };
//   } catch (err: unknown) {
//     const error = err as Error;
//     //console.log("error in creating chat thread", error?.message ?? error);
//     return {
//       success: false,
//       message: error?.message ?? "Unknown error",
//       data: null,
//     };
//   }
// }

// // ---------------------------------------------------------
// // 重跑前版本
// // ---------------------------------------------------------

// export type PersistChatRunInput = {
//   threadPublicId: string;

//   userText: string;
//   userAttachments?: ChatAttachmentPart[];
//   userReferenceId?: string | null;
//   userParentMessageId?: number | null;
//   userVersionNumber?: number | null;
//   userStructured?: any | null;
//   userPublicId?: string | null;
//   userAssetIds?: bigint[];
//   userChatVariant?: any | null;
//   userMessageIndex?: number | null;

//   assistantText: string;
//   assistantStructured?: any;
//   assistantReferenceId?: string | null;
//   assistantParentMessageId?: number | null;
//   assistantVersionNumber?: number | null;
//   assistantPublicId?: string | null;
//   assistantChatVariant?: any | null;
//   assistantMessageIndex?: number | null;
//   // 🟦 新增：AI 生成的圖片附件（工具回傳）
//   assistantAttachments?: any[];
// };

// export type PersistChatRunOutput = {
//   user_message_id: number;
//   user_message_index: number;
//   assistant_message_id: number;
//   assistant_message_index: number;
// };

// export async function persistChatRun(
//   payload: PersistChatRunInput
// ): Promise<{ success: boolean; data?: PersistChatRunOutput; message?: string }> {
//   try {
//     const { userId } = await auth();
//     if (!userId) return { success: false, message: 'Not authenticated' };

//     // ---- user content ----
//     const p_user_content =
//       typeof payload.userText === 'string' && payload.userText.trim()
//         ? { type: 'text', text: payload.userText }
//         : null;

//     const p_user_attachments =
//       Array.isArray(payload.userAttachments) && payload.userAttachments.length > 0
//         ? payload.userAttachments.map((a) => ({
//           type: 'file',
//           url: a.url,
//           mimeType: a.mimeType ?? null,
//           name: a.name ?? null,
//           bytes: a.bytes ?? null,
//           stuffId: a.stuffId ?? null,
//           // 這邊可選：若要把 variants 一起塞入 content，可加上 variants
//           variants: a.variants ?? null,
//         }))
//         : null;

//     // ---- assistant content（關鍵：把生成圖片合併進 parts）----
//     const assistantParts =
//       Array.isArray(payload.assistantAttachments) && payload.assistantAttachments.length > 0
//         ? payload.assistantAttachments.map((a) => ({
//           type: 'file',
//           // 優先使用小圖顯示；保留 variants 方便日後 lightbox
//           url: a.variants?.small ?? a.variants?.medium ?? a.url,
//           mimeType: a.mimeType ?? 'image/*',
//           name: a.name ?? null,
//           bytes: a.bytes ?? null,
//           stuffId: a.stuffId ?? null,
//           variants: a.variants ?? null,
//         }))
//         : null;

//     const p_assistant_content =
//       typeof payload.assistantText === 'string' && payload.assistantText.trim()
//         ? assistantParts
//           ? { type: 'text', text: payload.assistantText, parts: assistantParts }
//           : { type: 'text', text: payload.assistantText }
//         : // 理論上 assistant 一定會有 text；這裡保險
//         (assistantParts ? { type: 'text', text: '', parts: assistantParts } : null);
//     console.log("payload.userChatVariant", payload.userChatVariant, "payload.assistantChatVariant", payload.assistantChatVariant);

//     const { data, error } = await supabase.rpc('rpc_persist_chat_run_6', {
//       p_clerk_user_id: userId,
//       p_thread_public_id: payload.threadPublicId,

//       p_user_public_id: payload.userPublicId ?? null,
//       p_user_content,
//       p_user_structured: payload.userStructured ?? null,
//       p_user_reference_public_id: payload.userReferenceId ?? null,
//       p_user_parent_message_id: payload.userParentMessageId ?? null,
//       p_user_version_number: payload.userVersionNumber ?? null,
//       p_user_attachments: p_user_attachments, // 由 RPC 併入 user.content.parts
//       p_user_asset_ids: payload.userAssetIds ?? null,
//       p_user_chat_variant: payload.userChatVariant ?? null,

//       p_assistant_public_id: payload.assistantPublicId ?? null,
//       p_assistant_content, // ← 直接含 parts（RPC 對 assistant 不再額外合併）
//       p_assistant_structured: payload.assistantStructured ?? null,
//       p_assistant_reference_public_id: payload.assistantReferenceId ?? null,
//       p_assistant_parent_message_id: payload.assistantParentMessageId ?? null,
//       p_assistant_version_number: payload.assistantVersionNumber ?? null,
//       p_assistant_chat_variant: payload.assistantChatVariant ?? null,

//       p_user_message_index: payload.userMessageIndex ?? null,
//       p_assistant_message_index: payload.assistantMessageIndex ?? null,
//     });
//     console.log("data", data, "error", error);

//     if (error || !data) {
//       return { success: false, message: error?.message ?? 'rpc_persist_chat_run_5 failed' };
//     }

//     const user_message_id: number = data?.[0]?.user_message_id ?? 0;
//     const assistant_message_id: number = data?.[0]?.assistant_message_id ?? 0;
//     const user_message_index: number = data?.[0]?.user_message_index ?? 0;
//     const assistant_message_index: number = data?.[0]?.assistant_message_index ?? 0;

//     return {
//       success: true,
//       data: { user_message_id, assistant_message_id, user_message_index, assistant_message_index },
//       message: 'Chat run persisted (v4)',
//     };
//   } catch (err: unknown) {
//     const error = err as Error;
//     console.error('error in persistChatRun v5', error?.message ?? error);
//     return { success: false, message: error?.message ?? 'Unknown error' };
//   }
// }


// // ---------------------------------------------------------
// // 3) （可選）空殼 Thread 軟刪（串流啟動失敗或早期中斷）
// // ---------------------------------------------------------
// export async function softDeleteChatThreadIfNoMessages(input: {
//   threadPublicId: string;
// }) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       return {
//         success: false,
//         code: "USER_NOT_AUTHENTICATED",
//         message: "USER NOT AUTHENTICATED",
//         data: null,
//       };
//     }

//     const { data, error } = await supabase.rpc(
//       "rpc_soft_delete_chat_thread_if_no_messages",
//       {
//         p_clerk_user_id: userId,
//         p_thread_public_id: input.threadPublicId,
//       }
//     );

//     if (error) {
//       return {
//         success: false,
//         message: error.message ?? "Failed to soft delete thread",
//         data: null,
//       };
//     }

//     return {
//       success: true,
//       message: data ? "Deleted" : "Not deleted",
//       data: { deleted: Boolean(data) },
//     };
//   } catch (err: unknown) {
//     const error = err as Error;
//     return {
//       success: false,
//       message: error?.message ?? "Unknown error",
//       data: null,
//     };
//   }
// }

// /** ===== Commons ===== */
// export interface IInsertAIChatProjectToSupabase {
//   supabase_user_id: number;
//   public_id: string;
//   name: string | null;
//   ai_summary?: string | null;
//   asset_id?: number[] | null;
//   status: string | null;
//   user_note?: string | null;
//   user_work_public_id?: string | null; //讓supabase在RPC裡面找
//   version_number?: number | null; //讓supabase在RPC裡面找
// }

// export interface IInsertAIChatThreadToSupabase {
//   user_work_public_id?: string | null;
//   public_id: string;
//   title: string | null;
//   ai_summary?: string | null;
//   asset_id?: number[] | null;
//   status: string | null;
//   user_note?: string | null;
//   persona: number | null;
//   chat_project_public_id?: string | null;
//   parent_thread_public_id?: string | null;
//   origin_message_index?: number | null;
// }

// //________________________________________________________________________
// export type ISODateString = string;

// //----------------------------Side bar Project和Thread-----------------------------------

// type Result<T> = { success: boolean; message?: string; data?: T };

// type ProjectRow = {
//   public_id: string;
//   name: string | null;
//   is_archived: boolean;
//   is_deleted: boolean;
//   updated_at: string | null;
// };

// type ThreadRow = {
//   public_id: string;
//   title: string | null;
//   chat_project_public_id: string | null;
//   is_archived: boolean;
//   is_deleted: boolean;
//   updated_at: string | null;
// };

// /** 共用：確保登入並回傳 userId */
// async function requireUserId(): Promise<Result<{ userId: string }>> {
//   const { userId } = await auth();
//   if (!userId) {
//     return { success: false, message: 'USER NOT AUTHENTICATED' };
//   }
//   return { success: true, data: { userId } };
// }

// /** 共用：處理 RPC 回傳的 jsonb 格式 { success, message?, data? } */
// function unwrapRpc<T>(fnName: string, rpcData: any): Result<T> {
//   try {
//     if (!rpcData || typeof rpcData !== 'object') {
//       return { success: false, message: `[${fnName}] Empty RPC response` };
//     }
//     if (rpcData.success) {
//       return { success: true, data: rpcData.data as T };
//     }
//     return { success: false, message: rpcData.message ?? `[${fnName}] RPC returned failure` };
//   } catch (err: unknown) {
//     const error = err as Error;
//     return { success: false, message: `[${fnName}] Parse error: ${error?.message ?? String(error)}` };
//   }
// }

// export async function createProject(input: { name?: string | null }): Promise<Result<ProjectRow>> {
//   try {
//     // 1) 驗證登入
//     const me = await requireUserId();
//     if (!me.success) return { success: false, message: me.message };

//     // 2) 正規化名稱
//     const name = (input?.name ?? "New Project").trim();

//     // 3) 呼叫 RPC
//     const { data, error } = await supabase.rpc("create_chat_project", {
//       p_clerk_user_id: me.data!.userId,
//       p_name: name,
//     });

//     if (error || !data) {
//       console.error("[createProject] RPC error:", error?.message);
//       return { success: false, message: error?.message ?? "create_chat_project failed" };
//     }

//     // 4) unwrap RPC 的包裝
//     return unwrapRpc<ProjectRow>("create_chat_project", data);
//   } catch (err: unknown) {
//     const error = err as Error;
//     console.error("[createProject] caught error:", error?.message ?? err);
//     return { success: false, message: error?.message ?? "Unknown error" };
//   }
// }

// /* --------------------------------
//  * Project actions
//  * -------------------------------- */
// export async function renameProject(projectPublicId: string, name: string): Promise<Result<ProjectRow>> {
//   const authRes = await requireUserId();
//   if (!authRes.success) return { success: false, message: authRes.message };

//   try {
//     console.log('[renameProject] ->', projectPublicId, name);
//     const { data, error } = await supabase.rpc('rpc_project_rename', {
//       p_clerk_user_id: authRes.data!.userId,
//       p_project_public_id: projectPublicId,
//       p_name: name,
//     });

//     if (error || !data) {
//       console.error('[renameProject] RPC error', error?.message);
//       return { success: false, message: error?.message ?? 'rpc_project_rename failed' };
//     }
//     return unwrapRpc<ProjectRow>('rpc_project_rename', data);
//   } catch (err: unknown) {
//     const error = err as Error;
//     console.error('[renameProject] caught', error?.message);
//     return { success: false, message: error?.message ?? 'Unknown error' };
//   }
// }

// export async function setProjectArchived(
//   projectPublicId: string,
//   isArchived: boolean
// ): Promise<Result<ProjectRow>> {
//   const authRes = await requireUserId();
//   if (!authRes.success) return { success: false, message: authRes.message };

//   try {
//     console.log("[setProjectArchived] ->", projectPublicId, isArchived);
//     const { data, error } = await supabase.rpc("rpc_project_set_archived", {
//       p_clerk_user_id: authRes.data!.userId,
//       p_project_public_id: projectPublicId,
//       p_is_archived: isArchived,
//     });

//     if (error || !data) {
//       console.error("[setProjectArchived] RPC error", error?.message);
//       return {
//         success: false,
//         message: error?.message ?? "rpc_project_set_archived failed",
//       };
//     }
//     return unwrapRpc<ProjectRow>("rpc_project_set_archived", data);
//   } catch (err: unknown) {
//     const message = getErrorMessage(err);
//     console.error("[setProjectArchived] caught", message);
//     return { success: false, message };
//   }
// }

// export async function deleteProject(
//   projectPublicId: string
// ): Promise<Result<ProjectRow>> {
//   const authRes = await requireUserId();
//   if (!authRes.success) return { success: false, message: authRes.message };

//   try {
//     console.log("[deleteProject] ->", projectPublicId);
//     const { data, error } = await supabase.rpc("rpc_project_delete", {
//       p_clerk_user_id: authRes.data!.userId,
//       p_project_public_id: projectPublicId,
//     });

//     if (error || !data) {
//       console.error("[deleteProject] RPC error", error?.message);
//       return {
//         success: false,
//         message: error?.message ?? "rpc_project_delete failed",
//       };
//     }
//     return unwrapRpc<ProjectRow>("rpc_project_delete", data);
//   } catch (err: unknown) {
//     const message = getErrorMessage(err);
//     console.error("[deleteProject] caught", message);
//     return { success: false, message };
//   }
// }


// /* --------------------------------
//  * Thread actions
//  * -------------------------------- */


// export async function renameThread(threadPublicId: string, title: string): Promise<Result<ThreadRow>> {
//   const authRes = await requireUserId();
//   if (!authRes.success) return { success: false, message: authRes.message };

//   try {
//     console.log("[renameThread] ->", threadPublicId, title);
//     const { data, error } = await supabase.rpc("rpc_thread_rename", {
//       p_clerk_user_id: authRes.data!.userId,
//       p_thread_public_id: threadPublicId,
//       p_title: title,
//     });

//     if (error || !data) {
//       console.error("[renameThread] RPC error", error?.message);
//       return { success: false, message: error?.message ?? "rpc_thread_rename failed" };
//     }
//     return unwrapRpc<ThreadRow>("rpc_thread_rename", data);
//   } catch (err: unknown) {
//     const message = getErrorMessage(err);
//     console.error("[renameThread] caught", message);
//     return { success: false, message };
//   }
// }

// export async function setThreadArchived(threadPublicId: string, isArchived: boolean): Promise<Result<ThreadRow>> {
//   const authRes = await requireUserId();
//   if (!authRes.success) return { success: false, message: authRes.message };

//   try {
//     console.log("[setThreadArchived] ->", threadPublicId, isArchived);
//     const { data, error } = await supabase.rpc("rpc_thread_set_archived", {
//       p_clerk_user_id: authRes.data!.userId,
//       p_thread_public_id: threadPublicId,
//       p_is_archived: isArchived,
//     });

//     if (error || !data) {
//       console.error("[setThreadArchived] RPC error", error?.message);
//       return { success: false, message: error?.message ?? "rpc_thread_set_archived failed" };
//     }
//     return unwrapRpc<ThreadRow>("rpc_thread_set_archived", data);
//   } catch (err: unknown) {
//     const message = getErrorMessage(err);
//     console.error("[setThreadArchived] caught", message);
//     return { success: false, message };
//   }
// }

// export async function deleteThread(threadPublicId: string): Promise<Result<ThreadRow>> {
//   const authRes = await requireUserId();
//   if (!authRes.success) return { success: false, message: authRes.message };

//   try {
//     console.log("[deleteThread] ->", threadPublicId);
//     const { data, error } = await supabase.rpc("rpc_thread_delete", {
//       p_clerk_user_id: authRes.data!.userId,
//       p_thread_public_id: threadPublicId,
//     });

//     if (error || !data) {
//       console.error("[deleteThread] RPC error", error?.message);
//       return { success: false, message: error?.message ?? "rpc_thread_delete failed" };
//     }
//     return unwrapRpc<ThreadRow>("rpc_thread_delete", data);
//   } catch (err: unknown) {
//     const message = getErrorMessage(err);
//     console.error("[deleteThread] caught", message);
//     return { success: false, message };
//   }
// }

// export async function moveThreadToProject(
//   threadPublicId: string,
//   projectPublicId: string | null
// ): Promise<Result<ThreadRow>> {
//   const authRes = await requireUserId();
//   if (!authRes.success) return { success: false, message: authRes.message };

//   try {
//     console.log("[moveThreadToProject] ->", threadPublicId, "→", projectPublicId ?? "(unassigned)");
//     const { data, error } = await supabase.rpc("rpc_thread_move_to_project", {
//       p_clerk_user_id: authRes.data!.userId,
//       p_thread_public_id: threadPublicId,
//       p_project_public_id: projectPublicId, // null = Unassigned
//     });

//     if (error || !data) {
//       console.error("[moveThreadToProject] RPC error", error?.message);
//       return { success: false, message: error?.message ?? "rpc_thread_move_to_project failed" };
//     }
//     return unwrapRpc<ThreadRow>("rpc_thread_move_to_project", data);
//   } catch (err: unknown) {
//     const message = getErrorMessage(err);
//     console.error("[moveThreadToProject] caught", message);
//     return { success: false, message };
//   }
// }

// // -------------------- 1) setMessageFeedback --------------------

// type SAResult<T> = { success: boolean; message?: string; data?: T };

// export type SetMessageFeedbackData = {
//   messageId: string;
//   threadPublicId: string;
//   userFeedback: boolean | null; // true=like, false=dislike, null=clear
// };

// export async function setMessageFeedback(
//   input: SetMessageFeedbackData
// ): Promise<SAResult<SetMessageFeedbackData>> {
//   const me = await requireUserId();
//   if (!me.success) return { success: false, message: me.message };

//   try {
//     console.log(
//       "setting feedback message index",
//       input.messageId,
//       "thread_public_id",
//       input.threadPublicId,
//       "p_feedback",
//       input.userFeedback
//     );

//     const { data, error } = await supabase.rpc("rpc_message_set_feedback", {
//       p_clerk_user_id: me.data!.userId,
//       p_thread_public_id: input.threadPublicId,
//       p_message_public_id: input.messageId,
//       p_feedback: input.userFeedback,
//     });

//     console.log("data", data, "error", error ?? "no error");

//     if (error || !data) {
//       return { success: false, message: error?.message ?? "rpc_message_set_feedback failed" };
//     }
//     return unwrapRpc<SetMessageFeedbackData>("rpc_message_set_feedback", data);
//   } catch (err: unknown) {
//     const message = getErrorMessage(err);
//     console.error("[setMessageFeedback] caught", message);
//     return { success: false, message };
//   }
// }

// // -------------------- 2) addThreadNote --------------------

// export type AddThreadNoteInput = {
//   threadPublicId: string;
//   noteText: string;
//   // 綁定到某則訊息（可選）
//   messageIndex?: number | null;
//   // 區塊選取的純文字（可選，RPC 可存入 jsonb 裡）
//   selectedText?: string | null;
// };

// export type AddThreadNoteData = {
//   note_id: number;               // DB 內部 bigint -> number
//   note_public_id?: string | null;
//   thread_public_id: string;
//   message_index?: number | null;
// };

// export async function addThreadNote(
//   input: AddThreadNoteInput
// ): Promise<SAResult<AddThreadNoteData>> {
//   const me = await requireUserId();
//   if (!me.success) return { success: false, message: me.message };

//   try {
//     const { data, error } = await supabase.rpc("rpc_add_thread_note", {
//       p_clerk_user_id: me.data!.userId,
//       p_thread_public_id: input.threadPublicId,
//       p_message_index: input.messageIndex ?? null,
//       p_note_text: input.noteText,
//       p_selected_text: input.selectedText ?? null,
//     });

//     if (error || !data) {
//       return { success: false, message: error?.message ?? "rpc_add_thread_note failed" };
//     }
//     return unwrapRpc<AddThreadNoteData>("rpc_add_thread_note", data);
//   } catch (err: unknown) {
//     const message = getErrorMessage(err);
//     console.error("[addThreadNote] caught", message);
//     return { success: false, message };
//   }
// }

// // -------------------- Branch Out --------------------

// export async function branchOutThread(input: {
//   parentThreadPublicId: string;
//   branchFromMessageId: string;        // bigint in DB；前端用 string 即可
//   newTitle?: string | null;
// }): Promise<Result<{ new_thread_public_id: string; copied_count: number }>> {
//   try {
//     const { userId } = await auth();
//     if (!userId) return { success: false, message: "USER NOT AUTHENTICATED" };

//     const { data, error } = await supabase.rpc("rpc_branch_thread_from_message", {
//       p_clerk_user_id: userId,
//       p_parent_thread_public_id: input.parentThreadPublicId,
//       p_branch_from_message_public_id: input.branchFromMessageId,
//       p_new_title: input.newTitle ?? null,
//     });

//     if (error || !data) {
//       console.error("[branchOutThread] RPC error:", error?.message, data);
//       return { success: false, message: error?.message ?? "rpc_branch_out_thread failed" };
//     }

//     // RPC 統一回 jsonb：{ success, message, data: { new_thread_public_id, copied_count } }
//     const ok = Boolean(data?.success);
//     if (!ok) {
//       return { success: false, message: data?.message ?? "RPC returned failure" };
//     }
//     const payload = data?.data || {};
//     return {
//       success: true,
//       data: {
//         new_thread_public_id: String(payload.new_thread_public_id),
//         copied_count: Number(payload.copied_count ?? 0),
//       },
//     };
//   } catch (err: unknown) {
//     const message = getErrorMessage(err);
//     console.error("[branchOutThread] caught:", message);
//     return { success: false, message };
//   }
// }



// /** =========================================
//  * chat_project
//  * ======================================= */
// export interface ChatProjectRow {
//   chat_project_id: number;          // PK
//   supabase_user_id: number;
//   public_id: string;
//   created_at: ISODateString;
//   is_deleted: boolean;
//   is_archived: boolean;

//   updated_at: ISODateString | null;
//   updated_by: number | null;

//   name: string | null;
//   ai_summary: string | null;

//   asset_id: number[] | null;
//   status: string | null;
//   user_note: string | null;

//   note_public_id: string[] | null;
//   notes_id: number[] | null;

//   user_work_version_id: number | null;
// }


// export interface ChatProjectUpdate {
//   chat_project_id?: number;
//   supabase_user_id?: number;
//   public_id?: string;
//   created_at?: ISODateString;
//   is_deleted?: boolean;
//   is_archived?: boolean;

//   updated_at?: ISODateString | null;
//   updated_by?: number | null;

//   name?: string | null;
//   ai_summary?: string | null;

//   asset_id?: number[] | null;
//   status?: string | null;
//   user_note?: string | null;

//   note_public_id?: string[] | null;
//   notes_id?: number[] | null;

//   user_work_version_id?: number | null;
// }

// /** =========================================
//  * chat_thread
//  * ======================================= */
// export interface ChatThreadRow {
//   chat_thread_id: number;           // PK
//   user_work_id: number | null;
//   public_id: string;
//   created_at: ISODateString;
//   is_deleted: boolean;
//   is_archived: boolean;

//   updated_at: ISODateString | null;
//   updated_by: number | null;

//   title: string | null;
//   ai_summary: string | null;

//   asset_id: number[] | null;
//   status: string | null;
//   user_note: string | null;

//   note_public_id: string[] | null;
//   notes_id: number[] | null;

//   persona: number | null;

//   chat_project_id: number | null;
//   user_work_version_id: number | null;
//   supabase_user_id: number;

//   parent_thread_id: number | null;
//   origin_message_id: number | null;
// }



// export interface ChatThreadUpdate {
//   chat_thread_id?: number;
//   user_work_id?: number | null;
//   public_id?: string;
//   created_at?: ISODateString;
//   is_deleted?: boolean;
//   is_archived?: boolean;

//   updated_at?: ISODateString | null;
//   updated_by?: number | null;

//   title?: string | null;
//   ai_summary?: string | null;

//   asset_id?: number[] | null;
//   status?: string | null;
//   user_note?: string | null;

//   note_public_id?: string[] | null;
//   notes_id?: number[] | null;

//   persona?: number | null;

//   chat_project_id?: number | null;
//   user_work_version_id?: number | null;
//   supabase_user_id?: number;

//   parent_thread_id?: number | null;
//   origin_message_id?: number | null;
// }

// /** =========================================
//  * chat_message
//  * ======================================= */
// export interface ChatMessageRow {
//   chat_message_id: number;          // PK
//   chat_thread_id: number;
//   created_at: ISODateString;

//   content: any | null;
//   asset_id: number | null;

//   user_note: string | null;
//   note_id: number[] | null;
//   reference_id: string | null;

//   ai_persona: number | null;
//   system_prompt_id: number | null;

//   message_index: number | null;
//   parent_message_id: number | null;

//   is_user: boolean;
//   persona: number[] | null;

//   structure: any | null;
//   latest_chat_run_id: number | null;

//   user_feedback: boolean | null;
//   chat_variant: any | null;

//   version_number: number | null;   // smallint
//   has_branch: boolean;
//   children_branch: any | null;
// }


// export interface ChatMessageUpdate {
//   chat_message_id?: number;
//   chat_thread_id?: number;
//   created_at?: ISODateString;

//   content?: any | null;
//   asset_id?: number | null;

//   user_note?: string | null;
//   note_id?: number[] | null;
//   reference_id?: string | null;

//   ai_persona?: number | null;
//   system_prompt_id?: number | null;

//   message_index?: number | null;
//   parent_message_id?: number | null;

//   is_user?: boolean;
//   persona?: number[] | null;

//   structure?: any | null;
//   latest_chat_run_id?: number | null;

//   user_feedback?: boolean | null;
//   chat_variant?: any | null;

//   version_number?: number | null;
//   has_branch?: boolean;
//   children_branch?: any | null;
// }
