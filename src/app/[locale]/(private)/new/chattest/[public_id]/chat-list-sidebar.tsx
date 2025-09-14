"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Trash2, Plus, ChevronsLeft, ChevronsRight, MessageSquare,
  FolderPlus, History, Search, MoreHorizontal, GripVertical, ChevronRight, ChevronDown
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { useAiChatThreadViewModel } from "./ai-chat-thread-view-model";
import { useAIChatStore, IChatProject, IChatThread, UNASSIGNED } from "./ai-chat-thread-store";
import ConfirmDeleteDialog from "@/components/ui/forms/confirm-delete-dialog";

import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  DndContext, DragEndEvent, DragStartEvent, DragOverEvent,
  useDroppable, PointerSensor, useSensor, useSensors,
  closestCenter, MeasuringStrategy, DragOverlay
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "@/components/ui/forms/sortable-item";

// ===== actions（保留需要的） =====
import { CachedTranslation } from "@/lib/idb/translation-idb";
function SidebarItemWithTooltip({ title }: { title: string }) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [isOverflowed, setIsOverflowed] = useState(false);
  useEffect(() => {
    const el = spanRef.current;
    if (el && el.scrollWidth > el.clientWidth) setIsOverflowed(true);
  }, [title]);

  const span = (
    <span ref={spanRef} className="text-sm text-gray-300 truncate max-w-[180px]">
      {title}
    </span>
  );
  if (!isOverflowed) return span;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{span}</TooltipTrigger>
        <TooltipContent side="top" align="start">{title}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
interface ChatListBarProps {
  initialTranslation?: CachedTranslation;
  userWorkPublicId?: string;
}

export default function ChatListBar({ initialTranslation, userWorkPublicId }: ChatListBarProps) {
  const [selectedChatForDelete, setSelectedThreadForDelete] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [openMenuThreadId, setOpenMenuThreadId] = useState<string | null>(null);

  const {
    // state
    projects,
    threadsById,
    threadIdsByProject,
    selectedThreadId,

    // 仍供 UI 用於本地暫建
    selectProject,
    selectThread,
    upsertProjects,
    upsertThreads,
    setThreadIdsForProject,
    setUserWorkPublicId,
    setVersionNumber,

    // 載入
    loadChatThreads,

    // VM：所有需同步後端的操作
    vmRenameProject,
    vmSetProjectArchived,
    vmDeleteProject,
    vmRenameThread,
    vmSetThreadArchived,
    vmDeleteThread,
    vmMoveThreadToProject,
    vmCreateProject
  } = useAiChatThreadViewModel();

  useEffect(() => {
    if (userWorkPublicId) {
      console.log("has user work public ID", userWorkPublicId);
      setUserWorkPublicId(userWorkPublicId);
      setVersionNumber(1);
    }

    localStorage.removeItem("ai-chat-thread-store");
    localStorage.removeItem("ai-chat-project-directory-store");
    loadChatThreads();
  }, []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed((s) => !s);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const setExpanded = (pid: string, v: boolean) =>
    setExpandedProjects((prev) => ({ ...prev, [pid]: v }));
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectNameDraft, setProjectNameDraft] = useState("");

  const startEditProject = (pid: string, name: string | null) => {
    setEditingProjectId(pid);
    setProjectNameDraft(name ?? "");
  };
  const cancelEditProject = () => {
    setEditingProjectId(null);
    setProjectNameDraft("");
  };

  // Sidebar 收納/展開
  const EXPANDED_W = 256;
  const COLLAPSED_W = 56;
  const collapsed = sidebarCollapsed;

  // --- Thread 編輯/封存（UI local toggle 狀態） ---
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [chatTitleDraft, setChatTitleDraft] = useState("");
  const [archivedThreadIds, setArchivedThreadIds] = useState<Record<string, boolean>>({});

  // DnD 狀態
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [overProjectId, setOverProjectId] = useState<string | null>(null);

  // ===== 封裝：選取聊天 → 載入 thread =====
  const handleSelectChat = (threadId: string) => {
    if (!threadId) return;
    if (selectedThreadId !== threadId) {
      selectThread(threadId);
      // 如需載入訊息，可在這裡觸發 RPC 再 replace/appendMessages
    }
  };

  const addProject = async () => {
    try {
      const created = await vmCreateProject("New Project");
      // 展開＋進入 rename 狀態（此時 id 是後端真實 public_id）
      setExpanded(created.public_id, true);
      selectProject(created.public_id);
      startEditProject(created.public_id, created.name ?? "New Project");
    } catch (e) {
      console.error(e);
    }
  };

  // ===== Projects：rename / archive / delete（走 VM，同步後端）=====
  const renameProject = async (pid: string, nextName: string) => {
    try {
      await vmRenameProject(pid, nextName.trim() || "Untitled Project");
    } catch (e) {
      console.error(e);
    } finally {
      setEditingProjectId(null);
      setProjectNameDraft("");
    }
  };

  const deleteProject = async (pid: string) => {
    try {
      await vmDeleteProject(pid);
    } catch (e) {
      console.error(e);
    }
  };

  const archiveProject = async (pid: string) => {
    try {
      await vmSetProjectArchived(pid, true);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleProjectExpand = (pid: string) => {
    setExpanded(pid, !(expandedProjects?.[pid] ?? false));
  };

  // ===== New Chat：建立 thread（本地暫建）→ 選取 =====
  const handleNewChat = (projectId?: string | null) => {
    const title = "New Chat";
    const tempId = `tmp_${Date.now()}`;

    const newThread: IChatThread = {
      public_id: tempId,
      title,
      ai_summary: null,
      is_deleted: false,
      is_archived: false,
      chat_project_public_id: projectId ?? null,
      parent_thread_public_id: null,
      origin_message_id: null,
    };

    // 1) upsert threads（本地）
    upsertThreads([newThread]);

    // 2) 放到該 project 或 UNASSIGNED 的頂部（本地）
    const key = projectId ?? UNASSIGNED;
    const cur = threadIdsByProject[key] ?? [];
    setThreadIdsForProject(key, [tempId, ...cur]);

    // 3) 選取（本地）
    selectProject(projectId ?? null);
    selectThread(tempId);

    // TODO: 呼叫後端建立 thread，拿正式 id 後再把 tempId 替換（已有 store.replaceThreadId 可用）
  };

  // ===== Chats：刪除（VM，同步後端）=====
  const handleDeleteChat = async (threadId: string) => {
    setSelectedThreadForDelete(threadId);
    try {
      await vmDeleteThread(threadId);
    } catch (e) {
      console.error(e);
    } finally {
      setSelectedThreadForDelete(null);
    }
  };

  // ===== Chat UI：封存/改名（VM 同步） =====
  const isChatArchived = (tid: string) => archivedThreadIds[tid] || threadsById[tid]?.is_archived;

  const toggleArchiveChat = async (tid: string) => {
    console.log("toggleArchiveChat tid", tid)

    try {
      const next = !isChatArchived(tid);
      setArchivedThreadIds((prev) => ({ ...prev, [tid]: next })); // 本地快速反饋
      await vmSetThreadArchived(tid, next);
    } catch (e) {
      console.error(e);
    }
  };

  const startEditChat = (t: IChatThread) => {
    console.log("startEditChat tid", t.public_id, "nextTitle", t.title)

    setEditingThreadId(t.public_id);
    setChatTitleDraft(t.title ?? "");
  };

  const commitEditChat = async (tid: string) => {
    const nextTitle = chatTitleDraft.trim() || "Untitled";
    try {
      console.log("commitEditChat tid", tid, "nextTitle", nextTitle)
      await vmRenameThread(tid, nextTitle);
    } catch (e) {
      console.error(e);
    } finally {
      setEditingThreadId(null);
      setChatTitleDraft("");
    }
  };

  // ===== 便捷查找：ThreadId 所屬 project =====
  const findProjectIdByThread = (tid: string): string | null => {
    // 先用實體上的 project 欄位
    const p = threadsById[tid]?.chat_project_public_id;
    if (p !== undefined && p !== null) return p;

    // 不在實體上 → 從群組反查
    for (const [pid, arr] of Object.entries(threadIdsByProject)) {
      if (arr.includes(tid)) return pid === UNASSIGNED ? null : pid;
    }
    return null;
  };

  // ===== DnD：sensors =====
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // ===== DnD：handlers =====
  const onDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id); // chat-xxx
    if (id.startsWith("chat-")) {
      setActiveThreadId(id.replace("chat-", ""));
    }
  };

  const onDragOver = (e: DragOverEvent) => {
    const activeId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;

    if (!overId || !activeId.startsWith("chat-")) {
      setOverProjectId(null);
      return;
    }
    if (overId.startsWith("proj-")) {
      setOverProjectId(overId.replace("proj-", ""));
      return;
    }
    if (overId.startsWith("chat-")) {
      const overThreadId = overId.replace("chat-", "");
      const pid = findProjectIdByThread(overThreadId);
      setOverProjectId(pid);
      return;
    }
    setOverProjectId(null);
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    setOverProjectId(null);

    if (!over) {
      setActiveThreadId(null);
      return;
    }

    const activeId = String(active.id); // chat-xxx
    if (!activeId.startsWith("chat-")) {
      setActiveThreadId(null);
      return;
    }

    const threadId = activeId.replace("chat-", "");
    const overId = String(over.id);

    try {
      if (overId.startsWith("proj-")) {
        const pid = overId.replace("proj-", "");
        // 丟到專案容器 → 插入到最前（VM 會同步 DB）
        await vmMoveThreadToProject(threadId, pid, 0);
        setActiveThreadId(null);
        return;
      }

      if (overId.startsWith("chat-")) {
        const overThreadId = overId.replace("chat-", "");
        const pid = findProjectIdByThread(overThreadId);
        // 丟到某 chat 上 → 放到該 project 的最前
        await vmMoveThreadToProject(threadId, pid, 0);
        setActiveThreadId(null);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    setActiveThreadId(null);
  };

  // ===== 計算未分配 chats =====
  const unassignedIds = threadIdsByProject[UNASSIGNED] ?? [];
  const unassignedChats = unassignedIds
    .map((id) => threadsById[id])
    .filter(Boolean) as IChatThread[];

  // ===== ChatRowInner：共用的聊天列內容（供 SortableItem render-props 使用）====
  const ChatRowInner: React.FC<{
    chat: IChatThread;
    setNodeRef: (el: HTMLElement | null) => void;
    style: React.CSSProperties | undefined;
    listeners?: React.HTMLAttributes<HTMLElement>;
    attributes?: React.HTMLAttributes<HTMLElement>;
  }> = ({ chat, setNodeRef, style, listeners, attributes }) => {
    const isActive = selectedThreadId === chat.public_id;
    const archived = isChatArchived(chat.public_id);

    return (
      <div
        ref={setNodeRef}
        style={{ ...style, transition: style?.transition || "transform 180ms ease" }}
        className={clsx(
          // 固定高度、固定內距，避免尺寸跳動；相對定位給右上角控制列用
          "group/chat-row relative flex items-center px-2 py-1 rounded-md w-full mb-2 cursor-pointer select-none",
          "min-h-8 pr-12 pl-2",            // ← 右邊預留三點選單寬度，左邊再加點緩衝
          archived && "opacity-60",
          isActive
            ? "bg-blue-600 text-white hover:bg-blue-600"
            : "hover:bg-[var(--muted)]"
        )}
        onClick={() => { if (!activeThreadId) handleSelectChat(chat.public_id); }}
        onDoubleClick={(e) => { e.stopPropagation(); startEditChat(chat); }}
      >
        {/* 左側：把手 + icon + title 區 */}
        <div className="flex items-center gap-2 min-w-0">
          {/* 把手：始終佔寬，不重排；hover 才顯示，不閃爍 */}
          <span
            {...(listeners ?? {})}
            {...(attributes ?? {})}
            className={clsx(
              "grid place-items-center rounded active:cursor-grabbing",
              "w-6 h-6 shrink-0",                    // ← 固定尺寸避免跳動
              isActive ? "hover:bg-blue-500/70" : "hover:bg-[var(--muted)]",
              "opacity-0 pointer-events-none",
              "group-hover/chat-row:opacity-100 group-hover/chat-row:pointer-events-auto",
              "focus-visible:opacity-100 focus-visible:pointer-events-auto",
              "transition-opacity will-change-[opacity]" // ← 平滑不閃爍
            )}
            title="Drag"
            aria-label="Drag handle"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </span>

          <MessageSquare className="h-4 w-4 shrink-0" />

          {editingThreadId === chat.public_id ? (
            <input
              autoFocus
              value={chatTitleDraft}
              onChange={(e) => setChatTitleDraft(e.target.value)}
              onBlur={() => commitEditChat(chat.public_id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEditChat(chat.public_id);
                if (e.key === "Escape") { setEditingThreadId(null); setChatTitleDraft(""); }
              }}
              className="bg-transparent outline-none text-xs leading-5 border-b border-transparent focus:border-[var(--border)] min-w-0 flex-1"
              onPointerDown={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-xs leading-5 text-gray-300 truncate max-w-[180px]">
              {chat.title ?? "Untitled"}
            </span>
          )}
        </div>

        {/* 右上角：三點選單 + 刪除（絕對定位，不會被 ScrollBar 蓋住，也不佔用排版） */}
        <div
          className={clsx(
            "absolute top-1 right-10 flex items-center gap-1",
            "opacity-0 group-hover/chat-row:opacity-100 transition-opacity will-change-[opacity]",
            "pointer-events-none group-hover/chat-row:pointer-events-auto"
          )}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu
            modal={false}
            onOpenChange={(open) => setOpenMenuThreadId(open ? chat.public_id : null)}
          >
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-[var(--muted)]"
                aria-haspopup="menu"
                title="More"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-40 z-[999]"    // ← 確保蓋過 ScrollArea 滾動層
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuItem onClick={() => startEditChat(chat)}>Rename</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleArchiveChat(chat.public_id)}>
                {isChatArchived(chat.public_id) ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setConfirmDeleteId(chat.public_id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-[var(--muted)]"
            title="Delete"
            onClick={() => setConfirmDeleteId(chat.public_id)}
          >
            <Trash2 className="h-4 w-4 text-[var(--muted-foreground)]" />
          </button>
        </div>
      </div>
    );
  };


  // ===== ProjectRow =====
  const ProjectRow: React.FC<{ project: IChatProject }> = ({ project }) => {
    const pid = project.public_id;
    const expanded = !!expandedProjects[pid];
    const isEditing = editingProjectId === pid;

    const { isOver, setNodeRef } = useDroppable({ id: `proj-${pid}` });
    const highlight = isOver || overProjectId === pid;

    const threadIds = threadIdsByProject[pid] ?? [];
    const chats = threadIds.map((id) => threadsById[id]).filter(Boolean) as IChatThread[];

    return (
      <div
        ref={setNodeRef}
        className={clsx("rounded-md group", highlight && "ring-2 ring-primary/60")}
        onMouseEnter={() => { }}
        onMouseLeave={() => { }}
      >
        {/* Header */}
        <div className="relative rounded-md px-2 py-1 hover:bg-[var(--muted)]">
          <div className="flex items-center gap-2 min-w-0 pr-10">
            <motion.button
              className="h-6 w-6 grid place-items-center rounded hover:bg-[var(--muted)] shrink-0"
              onClick={(e) => { e.stopPropagation(); toggleProjectExpand(pid); }}
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse" : "Expand"}
              title={expanded ? "Collapse" : "Expand"}
              initial={false}
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>

            {isEditing ? (
              <input
                autoFocus
                value={projectNameDraft}
                onChange={(e) => setProjectNameDraft(e.target.value)}
                onBlur={() => { renameProject(pid, projectNameDraft); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") renameProject(pid, projectNameDraft);
                  if (e.key === "Escape") cancelEditProject();
                }}
                className="bg-transparent outline-none text-xs leading-5 border-b border-transparent focus:border-[var(--border)] min-w-0 flex-1"
                onPointerDown={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="text-xs leading-5 truncate"
                onDoubleClick={(e) => { e.stopPropagation(); startEditProject(pid, project.name); setProjectNameDraft(project.name ?? ""); }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {project.name ?? "(Untitled Project)"}
              </span>
            )}
          </div>

          {/* 右上角三點選單（絕對定位，hover 顯示） */}
          <div
            className={clsx(
              "absolute top-1 right-5",
              "opacity-0 group-hover:opacity-100 transition-opacity will-change-[opacity]"
            )}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-[var(--muted)]"
                  aria-haspopup="menu"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 z-[999]"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <DropdownMenuItem onClick={() => { startEditProject(pid, project.name); }}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => archiveProject(pid)}>
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => deleteProject(pid)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Chats in project */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="pl-6 mt-1 space-y-1 min-h-[8px]"
            >
              <SortableContext
                items={chats.map((c) => `chat-${c.public_id}`)}
                strategy={verticalListSortingStrategy}
              >
                {chats.map((chat) => (
                  <SortableItem key={`chat-${chat.public_id}`} id={`chat-${chat.public_id}`}>
                    {({ setNodeRef, style, listeners, attributes }) => (
                      <ChatRowInner
                        chat={chat}
                        setNodeRef={setNodeRef}
                        style={style}
                        listeners={listeners}
                        attributes={attributes}
                      />
                    )}
                  </SortableItem>
                ))}
              </SortableContext>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ===== 主體 UI =====
  return (
    <TooltipProvider delayDuration={800}>
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        collisionDetection={closestCenter}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      >
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] overflow-hidden relative z-40"
          aria-expanded={!collapsed}
        >
          {/* 收納：整面可點展開 */}
          {collapsed && (
            <button
              className="absolute inset-0 z-0 bg-transparent"
              onClick={() => toggleSidebar()}
              aria-label="Expand sidebar"
              title="Expand"
            />
          )}

          {/* 頂部：收納/展開切換 */}
          <div className="p-2 flex justify-end">
            <button
              onClick={() => toggleSidebar()}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-[var(--muted)] relative z-20"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
            </button>
          </div>

          <AnimatePresence initial={false} mode="wait">
            {collapsed ? (
              // ===== 收納：ICON Rail =====
              <motion.div
                key="collapsed-rail"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="pb-4 relative z-10"
              >
                <div className="flex flex-col items-center gap-3">
                  {/* New Project（UI-only） */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => { e.stopPropagation(); addProject(); }}
                        className="h-10 w-10 rounded-xl bg-[var(--muted)] hover:bg-[var(--accent)] inline-flex items-center justify-center"
                        aria-label="New Project"
                        title="New Project"
                      >
                        <FolderPlus className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">New Project</TooltipContent>
                  </Tooltip>

                  {/* New Chat（接上 handleNewChat） */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleNewChat(); }}
                        className="h-10 w-10 rounded-xl bg-[var(--muted)] hover:bg-[var(--accent)] inline-flex items-center justify-center"
                        aria-label="New Chat"
                        title="New Chat"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">New Chat</TooltipContent>
                  </Tooltip>

                  {/* Historical Projects（UI-only） */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => { e.stopPropagation(); /* TODO: open history projects */ }}
                        className="h-10 w-10 rounded-xl bg-[var(--muted)] hover:bg-[var(--accent)] inline-flex items-center justify-center"
                        aria-label="Historical Projects"
                        title="Historical Projects"
                      >
                        <History className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Historical Projects</TooltipContent>
                  </Tooltip>

                </div>
              </motion.div>
            ) : (
              // ===== 展開：完整版 =====
              <motion.div
                key="expanded-content"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4 pt-0 space-y-6"
              >
                {/* 🔍 Search（UI-only） */}
                <div className="relative pt-2">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <Input
                    placeholder="Search chats..."
                    className="pl-8 pr-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        // TODO: 搜尋
                      }
                    }}
                  />
                </div>

                {/* Projects Header + New buttons */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Projects</span>
                  <div className="flex items中心 gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={addProject}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-[var(--muted)]"
                          aria-label="New Project"
                          title="New Project"
                        >
                          <FolderPlus className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">New Project</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleNewChat(); }}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-[var(--muted)] disabled:opacity-50"
                          aria-label="New Chat"
                          title="New Chat"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">New Chat</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Unified scroll area: Projects + Your chats */}
                <ScrollArea className="h-[900px] pr-0.5">
                  {/* Projects */}
                  <div className="space-y-1 mb-4">
                    {projects.filter((p) => !p.is_archived).length === 0 && (
                      <div className="text-xs text-muted-foreground px-2 py-1">No projects. Create one.</div>
                    )}
                    {projects.filter((p) => !p.is_archived).map((p) => (
                      <ProjectRow key={p.public_id} project={p} />
                    ))}
                  </div>

                  {/* Your chats（未分配） */}
                  <div>
                    <Separator />
                    <div className="px-2 py-2 text-xs text-muted-foreground">Unassigned</div>

                    <SortableContext
                      items={unassignedChats.map((c) => `chat-${c.public_id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {unassignedChats.map((chat) => (
                        <SortableItem key={`chat-${chat.public_id}`} id={`chat-${chat.public_id}`}>
                          {({ setNodeRef, style, listeners, attributes }) => (
                            <ChatRowInner
                              chat={chat}
                              setNodeRef={setNodeRef}
                              style={style}
                              listeners={listeners}
                              attributes={attributes}
                            />
                          )}
                        </SortableItem>
                      ))}
                    </SortableContext>
                  </div>
                </ScrollArea>

                {/* 刪除聊天 Dialog（保留）*/}
                 <ConfirmDeleteDialog
                id={confirmDeleteId}
                onConfirm={(id) => handleDeleteChat(id)}
                onClose={() => setConfirmDeleteId(null)}
              />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>

        {/* Drag overlay：讓被拖的 chat 有視覺回饋 */}
        <DragOverlay dropAnimation={null}>
          {activeThreadId ? (
            <div className="px-2 py-1 rounded-md bg-[var(--muted)]/90 shadow-lg border border-[var(--border)] flex items-center gap-2 pointer-events-none">
              <GripVertical className="h-4 w-4" />
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm truncate max-w-[180px]">
                {threadsById[activeThreadId]?.title ?? "Moving..."}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </TooltipProvider>
  );
}
