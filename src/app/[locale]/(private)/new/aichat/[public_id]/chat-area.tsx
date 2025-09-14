// app/[locale]/(private)/aichat/chat-area.tsx
"use client";

import React, { useMemo, useState, useRef } from "react";
import { Send, ImagePlus, Upload, Square } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Messages from "./chat-messages";
import ChatTabSwitcher, { ChatTab } from "@/components/ui/chat/chat-tab-switcher";
import ThumbnailVersionList from "@/components/ui/chat/thumbnail-version-list";
import { Button } from "@/components/ui/button";
import SendStopButton from "./send-stop-button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";


import type { ThumbnailVersion } from "@/components/ui/chat/mockdata";

// VM hooks
import { useActiveMessages, useAiChatThreadViewModel } from "./ai-chat-thread-view-model";
import { useAiChatMessageViewModel } from "./ai-chat-message-view-model";
import { toUIMessageFromThread } from "./ui-messages";
import { useAIChatStore } from "./ai-chat-thread-store";
import { useShallow } from "zustand/shallow";

import IncludeBar, { type IncludedMeta } from "./ai-chat-include-bar";
import AttachmentsBar, {
  type AttachmentItem,
} from "./attachement-bar";
import userGlobalStore from "@/lib/global-store/users-store";

const MAX_ATTACH = 6;

type LocalEcho = {
  id: string;
  text: string; // 送出時的 inputDraft
  thumbs: { id: string; url?: string; name: string }[];
  includePreview?: string; // IncludeBar 的 preview（如果當下有）
};
function contentHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return String(h);
}
const MessagesMemo = React.memo(Messages);


export default function ChatArea() {
  //暫時資料，開通刪除
  const [localEchoes, setLocalEchoes] = useState<LocalEcho[]>([]);
  const [includeDecorations, setIncludeDecorations] = useState<Record<string, string>>({});

  const msgs = useActiveMessages();
  const { inputDraft, isStreaming, setInput, send, attachUrl, clearAttachments } =
    useAiChatMessageViewModel();

  const { vmSetMessageFeedback, selectedThreadId, vmBranchOutFromMessage, userWorkPublicId, selectThread } = useAiChatThreadViewModel();

  const [activeTab, setActiveTab] = useState<ChatTab>("chat");
  const [versions, setVersions] = useState<ThumbnailVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | undefined>(undefined);

  // Include（單選）
  const [includedMessage, setIncludedMessage] = useState<IncludedMeta | null>(null);

  // Attachments（UI-only 清單，用於顯示縮圖與移除）
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

  // 拖曳狀態（顯示 Overlay）
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const uiMessages = useMemo(() => msgs.map(toUIMessageFromThread), [msgs]);

  const isThreadLoading = useAIChatStore(
    useShallow((s) => {
      const tid = s.selectedThreadId;
      return tid ? !!s.messagesByThread[tid]?.isLoading : false;
    })
  );

  const handleAddToVersions = (imageUrl: string, messageId?: number) => {
    const newVersion: ThumbnailVersion = {
      id: `v-${Date.now()}`,
      imageUrl,
      versionLabel: `v-${versions.length + 1}`,
      title: "Untitled Thumbnail",
      date: new Date().toISOString(),
      rating: 0,
      description: "Added from AI message",
      linkedMessageId: String(messageId ?? ""),
      annotations: [],
    };
    setVersions((prev) => [...prev, newVersion]);
  };

  const handleStop = async () => {
    try {
      if (typeof stop === "function") {
        await stop();                 // 真正中止串流（若 VM 已實作）
      } else {
        // UI-only 回退：通知一下，並讓使用者再次可送出
        toast.success("已請求停止（UI-only）");
      }
    } catch (e: any) {
      toast.error(e?.message || "停止失敗");
    }
  };

  // —— 新增：將多檔加入附件列（UI）並呼叫 attachUrl（若你想先純 UI，可註解掉上傳呼叫）——
  const addFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;

    // 僅接受圖片
    const imgs = arr.filter((f) => f.type?.startsWith("image/"));
    if (!imgs.length) {
      toast.error("僅支援圖片檔");
      return;
    }

    // 檢查上限
    if (attachments.length + imgs.length > MAX_ATTACH) {
      toast.error(`最多 ${MAX_ATTACH} 張圖片`);
    }
    const allowed = imgs.slice(0, Math.max(0, MAX_ATTACH - attachments.length));

    // 產生本地預覽 & UI 項目
    const newItems: AttachmentItem[] = allowed.map((f) => ({
      id: `${Date.now()}-${f.name}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      size: f.size,
      type: f.type,
      previewUrl: URL.createObjectURL(f),
      status: "uploading",
      progress: 0,
    }));
    setAttachments((prev) => [...prev, ...newItems]);
    newItems.forEach((it) => startProgress(it.id));

    //模擬進度，開通刪除
    setTimeout(() => {
      newItems.forEach((it) => {
        stopProgress(it.id);
        setAttachments((prev) =>
          prev.map((a) =>
            a.id === it.id ? { ...a, progress: 100, status: "done" } : a
          )
        );
      });
    }, 1200);

    // // 你現有的上傳流程（想純 UI 先註解這段）
    // for (const f of allowed) {
    //   try {
    //     const res = await uploadThumbnailAndGetUrl(f);
    //     if (!res.success || !res.url) throw new Error("Upload failed");
    //     await attachUrl(res.url, { mimeType: f.type, name: f.name });
    //   } catch (e) {
    //     console.error(e);
    //     toast.error(`上傳失敗：${f.name}`);
    //   }
    // }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // —— Drag & Drop 到整個 Chat Area —— //
  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDraggingOver) setIsDraggingOver(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // 僅當真正離開容器時才關
    if (e.currentTarget === e.target) {
      setIsDraggingOver(false);
    }
  };
  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const dt = e.dataTransfer;
    if (!dt?.files?.length) return;
    await addFiles(dt.files);
  };

  // File input（點按上傳）
  const onPickFiles = async (files?: FileList | null) => {
    if (!files?.length) return;
    await addFiles(files);
  };

  const onSubmit = async (e: React.FormEvent) => {
    sessionStorage.removeItem("ai-chat-session-store");
    e.preventDefault();
    try {
      if (attachments.length || inputDraft.trim()) {
        const echo: LocalEcho = {
          id: `echo-${Date.now()}`,
          text: inputDraft,
          thumbs: attachments.map(a => ({ id: a.id, url: a.previewUrl, name: a.name })),
          includePreview: includedMessage?.preview,
        };
        setLocalEchoes(prev => [...prev, echo]);
      }
      if (includedMessage?.preview && inputDraft.trim()) {
        const key = contentHash(inputDraft.trim());
        setIncludeDecorations((prev) => ({ ...prev, [key]: includedMessage.preview }));
      }

      // 這裡暫不處理 include/attachments 實際注入；UI-only。
      await send();
      clearAttachments?.();

      // 送出後 UI 行為（可調整）：
      setIncludedMessage(null);
      // 如果你要送出就清空附件列：
      setAttachments([]);
      setLocalEchoes([]);
      setIncludedMessage(null);

      // 保留 attachments 視覺 or 清空，依你偏好。若想清空，打開下一行：
      // setAttachments([]);
    } catch (err: any) {
      toast.error(err?.message || "送出失敗");
    }
  };
  const progressTimers = useRef<Record<string, number>>({});

  /** 啟動一個 UI 模擬進度（0→90%）的計時器 */
  const startProgress = (id: string) => {
    stopProgress(id); // 保險：先清
    const tick = () => {
      setAttachments((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          if (a.status !== "uploading") return a;
          const curr = a.progress ?? 0;
          // 逐漸減速：早期快、後期慢；最高先衝到 90%
          const inc = Math.max(1, Math.round((100 - curr) / 12));
          const next = Math.min(90, curr + inc);
          return { ...a, progress: next };
        })
      );
    };
    const interval = window.setInterval(tick, 180);
    progressTimers.current[id] = interval;
  };

  const stopProgress = (id: string) => {
    const t = progressTimers.current[id];
    if (t) {
      clearInterval(t);
      delete progressTimers.current[id];
    }
  };

  return (
    <div
      className="relative bg-[var(--background)] text-[var(--foreground)] h-screen grid grid-rows-[auto_1fr_auto]"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Header + Tabs */}
      <div className="sticky top-0 z-20 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="flex justify-between items-center px-5 py-4">
          <ChatTabSwitcher value={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* —— Drag Overlay —— */}
      {isDraggingOver && (
        <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center">
          <div className="rounded-2xl border-2 border-dashed border-primary/60 bg-background/80 px-6 py-8 text-center shadow-xl">
            <div className="flex flex-col items-center gap-2">
              <Upload className="size-6" />
              <div className="text-sm">拖曳圖片到此處（最多 {MAX_ATTACH} 張）</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 px-5 overflow-auto">
        {activeTab === "chat" ? (<>
          <MessagesMemo
            messages={uiMessages}
            status={isStreaming ? "streaming" : isThreadLoading ? "loading" : "done"}
            onAddToVersions={(url) => handleAddToVersions(url)}
            onRequestInclude={(payload) =>
              setIncludedMessage({
                id: payload.messageId,
                role: payload.role,
                preview: payload.preview,
              })}
            onFeedback={({ messageId, type }) => {
              console.log("messageId", messageId, "type", type, "selectedThread Id", selectedThreadId);
              if (!selectedThreadId) return;
              console.log("messageId2", messageId, "type", type);
              const feedback = type === 'up' ? true : type === 'down' ? false : null;
              vmSetMessageFeedback(selectedThreadId, messageId, feedback).catch((e) => {
                // 失敗提示（可選）
                console.error(e);
                toast.error(e?.message || "Failed to set feedback");
              });
            }
            }
            onBranchOut={async ({ messageId }) => {
              const res = await vmBranchOutFromMessage(selectedThreadId!, messageId, {
                newTitle: "branch",
              });

              if (!res.newThreadPublicId) {
                toast.error("Branch out failed");
                return;
              }

              const newId = res.newThreadPublicId;
              toast.success("Branch created");

              // ✅ UI 決定怎麼開新 thread
              // A：開新分頁
              window.open(`${window.location.pathname}?t=${encodeURIComponent(newId)}`, "_blank");

              // B：同頁跳轉
              // router.push(`/${locale}/aichat/${newId}`);
            }}


//             onBranchOut={async ({ messageId }) => {
//   const res = await vmBranchOutFromMessage(selectedThreadId!, messageId, { newTitle: "branch" });
//   if (!res?.newThreadPublicId) {
//     toast.error("Branch out failed");
//     return;
//   }
//   const newId = res.newThreadPublicId;
//   toast.success("Branch created");

//   // 更新 URL（保留其他 query）
//   const sp = new URLSearchParams(window.location.search);
//   sp.set("t", newId);
//   router.replace(`${pathname}?${sp.toString()}`, { scroll: false });

//   // 立刻選中（同頁有效）
//   selectThread(newId);
// }}

            onAddSelectionToNote={() => {
              toast.success("已加入筆記（UI-only）");
            }}
            includedMessageId={includedMessage?.id ?? null}
            getIncludedPreview={(content) => {
              const key = contentHash((content || "").trim());
              return includeDecorations[key] ?? null;
            }}
          />
          {/* ✅ 本地回聲（UI-only） */}
          {localEchoes.map(echo => (
            <LocalEchoBubble key={echo.id} echo={echo} />
          ))}</>
        ) : (
          <ThumbnailVersionList
            versions={versions}
            selectedId={selectedVersionId}
            onSelect={(v) => setSelectedVersionId(v.id)}
          />
        )}
      </div>

      {/* Input Bar */}
      {activeTab === "chat" && (
        <div className="p-5 bg-[var(--card)] border-t border-[var(--border)]">
          {/* 單選引用（Include） */}
          <IncludeBar
            included={includedMessage}
            onClear={() => setIncludedMessage(null)}
            className="mb-3"
          />

          {/* 附件列（圖片縮圖 + 移除） */}
          <AttachmentsBar
            items={attachments}
            onRemove={removeAttachment}
            className="mb-3"
            thumbSize={120}
          />

          <form onSubmit={onSubmit} className="relative flex gap-2">
            <input
              name="prompt"
              value={inputDraft}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 bg-transparent border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none pr-10"
            />
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              id="upload-image"
              onChange={(e) => onPickFiles(e.target.files)}
            />
            <label htmlFor="upload-image" className="cursor-pointer">
              <Button variant="ghost" size="icon" type="button">
                <ImagePlus size={18} />
              </Button>
            </label>

            <SendStopButton isStreaming={isStreaming} onStop={handleStop} />

          </form>
        </div>
      )}
    </div>
  );
}


function LocalEchoBubble({ echo }: { echo: LocalEcho }) {
  return (
    <div className="flex gap-0 px-5 justify-end group mt-4">
      <div className="flex flex-col gap-2 max-w-[70%] items-end">
        {/* 文字泡泡 */}
        {echo.text?.trim() ? (
          <div className="
            prose prose-invert text-sm bg-muted text-foreground px-4 py-2
            rounded-3xl rounded-br-none relative
          ">
            <div className="whitespace-pre-wrap">{echo.text}</div>
            {/* include 預覽（若有） */}
            {echo.includePreview && (
              <div className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">
                Replying to: {echo.includePreview}
              </div>
            )}
            <span className="absolute -bottom-5 right-2 text-xs text-muted-foreground">
              sending…
            </span>
          </div>
        ) : null}

        {/* 圖片縮圖格（2~3欄自適應） */}
        {echo.thumbs.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {echo.thumbs.map(t => (
              <div key={t.id} className="relative w-28 h-28 rounded-lg overflow-hidden border border-border bg-muted">
                {t.url ? (
                  <img src={t.url} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-[10px] text-muted-foreground">Image</div>
                )}
                {/* 角落 sending 標記 */}
                <div className="absolute top-1 left-1 text-[10px] px-1 py-0.5 rounded bg-black/50 text-white">
                  sending
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-2">
        {/* 右側使用者頭像（保持一致視覺） */}
        <div className="size-10 rounded-full border border-border grid place-items-center">U</div>
      </div>
    </div>
  );
}