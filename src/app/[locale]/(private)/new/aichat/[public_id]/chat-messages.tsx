// app/[locale]/(private)/aichat/chat-messages.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Bot,
  User,
  Copy,
  Share,
  Check,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  CornerDownRight,
  Split,
  NotebookPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import ShareMessage from "@/components/ui/chat/share-message";
import { Skeleton } from "@/components/ui/skeleton";
import type { FileUIPart } from "@ai-sdk/ui-utils";
import type { UIMessage } from "./ui-messages";
import SelectionPopover from "./selection-popover";
import ReplyQuote from "./reply-quote";
import SubdialogSwitcher from "./subdialog-switcher";

type SubdialogPack = {
  items: { id: string; title?: string; content: string }[];
  activeIndex: number;
};

export default function ChatMessages({
  messages,
  status,
  onAddToVersions,
  onRequestInclude,
  onAddSelectionToNote,
  includedMessageId,
  getIncludedPreview,
  onEditSubmit,
  subdialogsByMessageId,
  onSwitchSubdialog,
  onFeedback, // ← NEW
  onBranchOut,
}: {
  messages: UIMessage[];
  status: "idle" | "streaming" | "loading" | "done";
  onAddToVersions: (imageUrl: string, messageId?: string) => void;
  onRequestInclude?: (payload: {
    messageId: string;
    role: "user" | "assistant";
    preview: string;
  }) => void;
  onAddSelectionToNote?: (payload: { messageId: string; selectedText: string }) => void;
  includedMessageId?: string | null;
  getIncludedPreview?: (content?: string) => string | null;
  onEditSubmit?: (messageId: string, newContent: string) => void;
  subdialogsByMessageId?: Record<string, SubdialogPack>;
  onSwitchSubdialog?: (messageId: string, nextIndex: number) => void;
  onFeedback?: (payload: { messageId: string; type: 'up' | 'down' | null }) => void;
  onBranchOut?: (payload: { messageId: number }) => Promise<void> | void;
}) {
  React.useEffect(() => {
    console.log("[ChatMessages] mounted");
    return () => console.log("[ChatMessages] unmounted");
  }, []);

  const messageRef = React.useRef<HTMLDivElement | null>(null);
  const [copiedMessages, setCopiedMessages] = React.useState<string>("");
  const [messageToShare, setMessageToShare] = React.useState<string>("");
  const [showShareModal, setShowShareModal] = React.useState<boolean>(false);

  // CHANGED: 只用 string 作為 key，避免 number/string 混用造成取值 miss
  const [feedback, setFeedback] = React.useState<Record<string, "up" | "down" | null>>({});

  // 選字浮層
  const [selOpen, setSelOpen] = React.useState(false);
  const [selRect, setSelRect] = React.useState<DOMRect | null>(null);
  const [selMsgId, setSelMsgId] = React.useState<string | null>(null);
  const [selText, setSelText] = React.useState<string>("");
  const popoverRef = React.useRef<HTMLDivElement | null>(null);

  // 編輯狀態
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editDraft, setEditDraft] = React.useState<string>("");

  React.useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollTop = messageRef.current.scrollHeight;
    }
  }, [messages, status, editingId]);

  const onCopy = (text?: string) => {
    const t = text ?? "";
    if (!t) {
      toast.error("沒有可複製的內容");
      return;
    }
    try {
      navigator.clipboard.writeText(t);
      setCopiedMessages(t);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  // CHANGED: 一律把 id 轉成字串 key，並在同一次 setState 中通知外層
  const handleFeedback = (id: string, type: "up" | "down") => {
    const key = String(id);
    setFeedback((prev) => {
      const current = prev[key] ?? null;
      const next: "up" | "down" | null = current === type ? null : type;

      // ❗❗ 重要：延後通知父層，避免在本次 render 期間觸發其他元件更新
      queueMicrotask(() => onFeedback?.({ messageId: key, type: next }));
      // 或用 setTimeout(() => onFeedback?.(...), 0)

      return { ...prev, [key]: next };
    });
  };

  // CHANGED: 初始化時使用字串 key
  React.useEffect(() => {
    setFeedback((prev) => {
      const next = { ...prev };
      for (const m of messages) {
        if (m.role !== "assistant") continue;
        const k = String(m.id ?? messages.indexOf(m));
        const uf = (m as any).user_feedback; // true | false | null | undefined

        // 只有後端提供了明確值才覆蓋（true/false）
        if (uf === true) next[k] = "up";
        else if (uf === false) next[k] = "down";
        // uf 為 null/undefined：保持現有（避免把樂觀狀態蓋掉）
      }
      return next;
    });
  }, [messages]);

  // 點外/滾動關閉選字浮層
  React.useEffect(() => {
    const onWindowPointerDown = (e: PointerEvent) => {
      if (popoverRef.current && popoverRef.current.contains(e.target as Node)) return;
      setSelOpen(false);
    };
    window.addEventListener("pointerdown", onWindowPointerDown, true);
    const container = messageRef.current;
    const onScroll = () => setSelOpen(false);
    container?.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onWindowPointerDown, true);
      container?.removeEventListener("scroll", onScroll);
    };
  }, []);

  React.useEffect(() => {
    if (editingId != null) {
      setSelOpen(false);
      window.getSelection()?.removeAllRanges();
    }
  }, [editingId]);

  const emptyState = (
    <div className="h-[75vh] flex items-center text-muted-foreground font-bold justify-center">
      <span className="flex flex-col">Welcome! Start the conversation when you’re ready.</span>
    </div>
  );

  const toPreview = (content?: string) => (content || "").replace(/\s+/g, " ").slice(0, 140);

  const handleMouseUp = (msgId: string) => {
    if (editingId != null) {
      setSelOpen(false);
      return;
    }
    const sel = window.getSelection?.();
    if (!sel || sel.isCollapsed) {
      setSelOpen(false);
      return;
    }
    try {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) {
        setSelOpen(false);
        return;
      }
      const selected = sel.toString().trim();
      if (!selected) {
        setSelOpen(false);
        return;
      }
      setSelMsgId(msgId);
      setSelText(selected);
      setSelRect(rect);
      setSelOpen(true);
    } catch {
      setSelOpen(false);
    }
  };

  const beginEdit = (id: string, initial: string) => {
    setEditingId(id);
    setEditDraft(initial);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
  };
  const submitEdit = (id: string) => {
    if (!editDraft.trim()) {
      toast.error("內容不可為空");
      return;
    }
    onEditSubmit?.(id, editDraft.trim());
    setEditingId(null);
    setEditDraft("");
  };

  // —— 編輯模式：寬度由「第一行」決定，上限後改為增高 —— //
  const editRef = React.useRef<HTMLTextAreaElement | null>(null);
  const shadowRef = React.useRef<HTMLSpanElement | null>(null);
  const [editWidth, setEditWidth] = React.useState<number>(240);

  const autoResize = React.useCallback(() => {
    const el = editRef.current;
    const shadow = shadowRef.current;
    const column = messageRef.current;
    if (!el || !shadow || !column) return;

    // 最大泡泡寬 = 訊息欄寬度 * 0.8
    const columnWidth = column.clientWidth || window.innerWidth;
    const maxBubbleWidth = Math.floor(columnWidth * 0.8);

    // 以「第一行文字」寬度決定泡泡寬
    const firstLine = (el.value || el.placeholder || "").split("\n", 1)[0] || "";
    shadow.textContent = firstLine.length ? firstLine : " ";
    const firstLineWidth = shadow.offsetWidth + 24; // 內距緩衝

    // 目標寬度（200px ~ maxBubbleWidth）
    const targetWidth = Math.min(Math.max(200, firstLineWidth), maxBubbleWidth);
    setEditWidth(targetWidth);          // ✅ 用 state 控制泡泡整體寬度
    el.style.width = "100%";            // ✅ 文字區吃滿容器寬度
    el.style.overflowX = "hidden";

    // 高度：自然高度上限（隨寬度而變），超出則出現垂直捲動
    el.style.height = "auto";
    const naturalHeight = el.scrollHeight;
    const maxH = Math.max(160, Math.floor(targetWidth * 0.6));
    const clamped = Math.min(naturalHeight, maxH);
    el.style.height = `${clamped}px`;
    el.style.overflowY = naturalHeight > maxH ? "auto" : "hidden";
  }, []);

  React.useLayoutEffect(() => {
    if (editingId != null) {
      requestAnimationFrame(autoResize);
    }
  }, [editingId, autoResize]);

  React.useEffect(() => {
    const onResize = () => editingId != null && autoResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [editingId, autoResize]);

  React.useEffect(() => {
    console.log("feedback changed", feedback);
  }, [feedback]);

  return (
    <div
      className="flex flex-col gap-7 mt-7 flex-1 h-[85vh] overflow-auto text-foreground"
      ref={messageRef}
    >
      {messages.length === 0 ? (
        emptyState
      ) : (
        messages.map((message) => {
          const isUser = message.role === "user";
          const messageId = message.id;
          const key = String(messageId); // CHANGED: 統一字串 key

          const historicalInclude = isUser ? getIncludedPreview?.(message.content) ?? null : null;

          const pack = isUser ? subdialogsByMessageId?.[key] : undefined;
          const activeIdx = pack?.activeIndex ?? 0;
          const total = pack?.items?.length ?? 0;

          const parts = Array.isArray(message.parts) ? message.parts : [];
          const filePart = parts.find(
            (p: any) =>
              p?.type === "file" && typeof p?.mimeType === "string" && p.mimeType.startsWith("image/")
          ) as FileUIPart | undefined;
          const imagePart = parts.find(
            (p: any) => p?.type === "image" && typeof p?.image === "string"
          ) as { type: "image"; image: string } | undefined;

          const includedHighlight = includedMessageId != null && includedMessageId === messageId;
          const isEditing = isUser && editingId === messageId;

          //console.log("render feedback", key, feedback[key]);

          return (
            <div
              key={String(messageId)}
              className={`flex gap-0 px-5 ${isUser ? "justify-end" : "justify-start"} group`}
            >
              {!isUser && (
                <div className="p-2">
                  <Bot size={40} className="border border-border rounded-full text-foreground" />
                </div>
              )}

              <div className={`flex flex-col gap-2 max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
                {/* ====== 普通泡泡（非編輯）：確保文字不溢出 ====== */}
                {message.content && !isEditing && (
                  <div
                    className={`
                      prose prose-invert text-sm
                      bg-muted text-foreground px-4 py-2 rounded-3xl
                      ${isUser ? "rounded-br-none" : "rounded-bl-none"}
                      relative ${includedHighlight ? "ring-2 ring-primary/60" : ""}
                      inline-block max-w-full
                      whitespace-pre-wrap break-words overflow-hidden
                    `}
                    style={{ cursor: "text", userSelect: "text" as const }}
                    onDoubleClick={() => {
                      if (isUser) beginEdit(messageId, message.content || "");
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      handleMouseUp(messageId);
                    }}
                  >
                    {isUser && historicalInclude ? <ReplyQuote text={historicalInclude} /> : null}
                    <ReactMarkdown>{message.content}</ReactMarkdown>

                    {message.status === "sending" && (
                      <span className="absolute -bottom-5 right-2 text-xs text-muted-foreground">
                        sending…
                      </span>
                    )}
                    {message.status === "error" && (
                      <span className="absolute -bottom-5 right-2 text-xs text-red-400">failed</span>
                    )}
                  </div>
                )}

                {/* ====== 編輯泡泡（使用者） ====== */}
                {isEditing && (
                  <div
                    className="
      bg-muted text-foreground px-4 py-3 rounded-3xl rounded-br-none
      border border-border inline-flex flex-col items-stretch
      max-w-[80%]
      whitespace-pre-wrap break-words overflow-hidden
    "
                    style={{ width: editWidth }}   // ✅ 整個泡泡寬
                  >
                    {/* 用來量「第一行」寬度的隱形 shadow */}
                    <span
                      ref={shadowRef}
                      className="absolute invisible text-sm leading-6 px-2 py-1"
                      style={{ whiteSpace: "pre", wordBreak: "normal" }}
                    />

                    {/* 上半：文字區（吃滿寬度） */}
                    <textarea
                      ref={editRef}
                      autoFocus
                      className="
    bg-transparent outline-none text-sm leading-6
    w-full px-2 py-1
    whitespace-pre-wrap break-words
  "
                      rows={1}
                      value={editDraft}
                      onChange={(e) => {
                        setEditDraft(e.target.value);
                        autoResize();
                      }}
                      onInput={autoResize}
                      onFocus={autoResize}
                      onKeyDown={(e) => {
                        // === Shift+Enter: 換行 ===
                        if (e.key === "Enter" && e.shiftKey) {
                          return; // ✅ 讓瀏覽器預設插入換行
                        }

                        // === Enter / Ctrl+Enter / Cmd+Enter: 送出 ===
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          submitEdit(String(messageId));
                        }
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                          e.preventDefault();
                          submitEdit(String(messageId));
                        }

                        // === Esc: 取消 ===
                        if (e.key === "Escape") {
                          e.preventDefault();
                          cancelEdit();
                        }
                      }}
                      placeholder="Edit your prompt..."
                      style={{ minHeight: "2.5rem" }}
                    />

                    {/* 下半：按鈕列（靠右） */}
                    <div className="mt-3 w-full flex justify-end gap-2">
                      <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
                      <Button onClick={() => submitEdit(String(messageId))}>Send</Button>
                    </div>
                  </div>
                )}

                {/* 助手工具列 */}
                {!isUser && !isEditing && (
                  <div
                    className={cn(
                      "flex gap-0 transition-opacity duration-300",
                      message.status === "sending" && "pointer-events-none opacity-30",
                      feedback[key] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <Button variant="ghost" size="icon" onClick={() => onCopy(message.content)}>
                      {copiedMessages === (message.content ?? "") ? <Check size={8} /> : <Copy size={8} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setMessageToShare(message.content ?? "");
                        setShowShareModal(true);
                      }}
                    >
                      <Share size={8} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        console.log("before click", key, feedback[key]);
                        handleFeedback(key, "up");
                        console.log("after click (same render)", key, feedback[key]);
                      }} className={cn(
                        "transition-colors",
                        // 父層和 svg 都強制套色，避免被 ghost/hover 覆蓋
                        feedback[key] === "up" && "!text-green-500 hover:!text-green-500 [&_svg]:!text-green-500"
                      )}
                      style={feedback[key] === "up" ? { color: "rgb(34 197 94)" } : undefined}

                      title="Like"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        console.log("before click", key, feedback[key]);
                        handleFeedback(key, "down");
                        console.log("after click (same render)", key, feedback[key]);
                      }} className={cn(
                        "transition-colors",
                        feedback[key] === "down" && "!text-red-500 hover:!text-red-500 [&_svg]:!text-red-500"
                      )}
                      title="Dislike"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Include this message"
                      onClick={() =>
                        onRequestInclude?.({
                          messageId,
                          role: "assistant",
                          preview: toPreview(message.content),
                        })
                      }
                    >
                      <CornerDownRight size={8} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Branch out"
                      onClick={() => {
                        const mid = Number(messageId);
                        if (Number.isFinite(mid)) {
                          onBranchOut?.({ messageId: mid });
                        } else {
                          toast.error("Invalid message id");
                        }
                      }}
                    >
                      <Split className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* 使用者工具列 */}
                {isUser && !isEditing && (
                  <div className="flex gap-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button variant="ghost" size="icon" onClick={() => onCopy(message.content)}>
                      {copiedMessages === (message.content ?? "") ? <Check size={8} /> : <Copy size={8} />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => beginEdit(messageId, message.content || "")}>
                      <Pencil size={8} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Include this message"
                      onClick={() =>
                        onRequestInclude?.({
                          messageId,
                          role: "user",
                          preview: toPreview(message.content),
                        })
                      }
                    >
                      <CornerDownRight size={8} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => toast("Add to Notes")}>
                      <NotebookPen size={8} />
                    </Button>
                  </div>
                )}

                {/* 子對話切換器 + Mock 回覆（僅使用者） */}
                {isUser && (subdialogsByMessageId?.[key]?.items?.length ?? 0) > 0 && (
                  <div className="w-full flex flex-col items-stretch gap-2 mt-1">
                    <SubdialogSwitcher
                      current={(subdialogsByMessageId![key].activeIndex ?? 0) + 1}
                      total={subdialogsByMessageId![key].items.length}
                      onPrev={() =>
                        onSwitchSubdialog?.(
                          key,
                          (subdialogsByMessageId![key].activeIndex - 1 +
                            subdialogsByMessageId![key].items.length) %
                          subdialogsByMessageId![key].items.length
                        )
                      }
                      onNext={() =>
                        onSwitchSubdialog?.(
                          key,
                          (subdialogsByMessageId![key].activeIndex + 1) %
                          subdialogsByMessageId![key].items.length
                        )
                      }
                    />
                    {(() => {
                      const pack = subdialogsByMessageId![key];
                      const item = pack.items[pack.activeIndex];
                      return (
                        <div
                          className="
                            prose prose-invert text-sm
                            bg-muted/60 text-foreground px-4 py-2 rounded-3xl
                            rounded-bl-none border border-border
                            whitespace-pre-wrap break-words overflow-hidden
                          "
                        >
                          {item.title ? (
                            <div className="text-xs text-muted-foreground mb-1">{item.title}</div>
                          ) : null}
                          <div className="whitespace-pre-wrap break-words">{item.content}</div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="p-2">
                  <User size={40} className="border border-border rounded-full text-foreground" />
                </div>
              )}
            </div>
          );
        })
      )}

      {(status === "streaming" || status === "loading") && (
        <div className="flex justify-start px-5">
          <Skeleton className="h-4 w-20 rounded bg-muted" />
        </div>
      )}

      {showShareModal && (
        <ShareMessage
          open={showShareModal}
          setOpen={setShowShareModal}
          messageToShare={messageToShare}
        />
      )}

      {/* 文字選取 Popover（全域單一） */}
      <SelectionPopover
        open={selOpen && editingId == null}
        anchorRect={selRect}
        containerRef={popoverRef}
        onInclude={() => {
          if (selMsgId == null) return;
          const msg = messages.find((m) => (m.id ?? messages.indexOf(m)) === selMsgId);
          if (!msg) return;
          const selected = (selText || "").trim();
          const previewSource = selected || (msg.content || "");
          onRequestInclude?.({
            messageId: selMsgId,
            role: msg.role === "user" ? "user" : "assistant",
            preview: toPreview(previewSource),
          });
          setSelOpen(false);
          window.getSelection()?.removeAllRanges();
        }}
        onAddNote={() => {
          if (!selText) return;
          onAddSelectionToNote?.({
            messageId: selMsgId as string,
            selectedText: selText,
          });
          toast.success("選取內容已加入筆記（UI-only）");
          setSelOpen(false);
          window.getSelection()?.removeAllRanges();
        }}
        onClose={() => {
          setSelOpen(false);
          window.getSelection()?.removeAllRanges();
        }}
      />
    </div>
  );
}
