"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderPlus,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Check,
  X,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

// shadcn ui
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

// ===== Mock Data =====
type Chat = { id: string; title: string };
type Project = { id: string; name: string; chats: Chat[] };

const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Cooking Channel Thumbnails",
    chats: [
      { id: "c1", title: "探索紅色背景" },
      { id: "c2", title: "標題字體測試" },
    ],
  },
  {
    id: "p2",
    name: "Tech Review Thumbnails",
    chats: [
      { id: "c3", title: "AI 相機封面設計" },
      { id: "c4", title: "暗色風格探討" },
    ],
  },
];

const MOCK_ARCHIVED: Project[] = [
  {
    id: "pA",
    name: "Travel Vlog #2023 Recap",
    chats: [{ id: "cA1", title: "溫暖色調方案" }],
  },
  {
    id: "pB",
    name: "Gaming Highlights 2",
    chats: [{ id: "cB1", title: "霓虹電光風" }],
  },
];

// 產 id
const nid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 9)}`;

interface Props {
  onSelectProject?: (project: Project) => void;
  onSelectChat?: (project: Project, chat: Chat) => void;
}

export default function ProjectChatSidebar({ onSelectProject, onSelectChat }: Props) {
  // Sidebar 收納 / 展開
  const EXPANDED_W = 256;
  const COLLAPSED_W = 56;
  const [collapsed, setCollapsed] = useState(false);

  // 現役 / 歷史
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [archived, setArchived] = useState<Project[]>(MOCK_ARCHIVED);

  // 展開狀態
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({
    p1: true,
    p2: true,
  });
  const [archivedExpanded, setArchivedExpanded] = useState(false);

  // 選中
  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id ?? "");
  const [activeChatId, setActiveChatId] = useState<string>(projects[0]?.chats?.[0]?.id ?? "");

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId]
  );
  const activeChat = useMemo(
    () => activeProject?.chats.find((c) => c.id === activeChatId) ?? null,
    [activeProject, activeChatId]
  );

  // 對話框：rename / delete
  type Target =
    | { type: "project"; id: string; name: string }
    | { type: "chat"; id: string; name: string; projectId: string };

  const [renameTarget, setRenameTarget] = useState<Target | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Target | null>(null);

  // 動畫
  const sectionSlide = {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
  };

  // ===== Project 操作 =====
  const toggleProject = (pid: string) => {
    setExpandedProjects((prev) => ({ ...prev, [pid]: !prev[pid] }));
  };

  const addProject = () => {
    const np: Project = { id: nid("p"), name: "New Project", chats: [] };
    setProjects((prev) => [np, ...prev]);
    setActiveProjectId(np.id);
    setActiveChatId("");
    setExpandedProjects((prev) => ({ ...prev, [np.id]: true }));
    onSelectProject?.(np);
  };

  const renameProject = (pid: string, name: string) => {
    setProjects((prev) => prev.map((p) => (p.id === pid ? { ...p, name } : p)));
  };

  const deleteProject = (pid: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== pid));
    if (pid === activeProjectId) {
      const next = projects.find((p) => p.id !== pid) ?? null;
      setActiveProjectId(next?.id ?? "");
      setActiveChatId(next?.chats?.[0]?.id ?? "");
      if (next) onSelectProject?.(next);
    }
  };

  // ===== Chat 操作 =====
  const addChat = (pid: string) => {
    const nc: Chat = { id: nid("c"), title: "New Chat" };
    setProjects((prev) =>
      prev.map((p) => (p.id === pid ? { ...p, chats: [nc, ...p.chats] } : p))
    );
    setActiveProjectId(pid);
    setActiveChatId(nc.id);
    const proj = projects.find((p) => p.id === pid) ?? null;
    if (proj) onSelectChat?.(proj, nc);
  };
  const addChatToActive = () => {
    if (!activeProjectId) return;
    addChat(activeProjectId);
  };

  const renameChat = (pid: string, cid: string, title: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === pid ? { ...p, chats: p.chats.map((c) => (c.id === cid ? { ...c, title } : c)) } : p
      )
    );
  };

  const deleteChat = (pid: string, cid: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === pid ? { ...p, chats: p.chats.filter((c) => c.id !== cid) } : p
      )
    );
    if (cid === activeChatId) {
      const proj = projects.find((p) => p.id === pid);
      const nextChat = proj?.chats.find((c) => c.id !== cid) ?? null;
      setActiveChatId(nextChat?.id ?? "");
      if (proj && nextChat) onSelectChat?.(proj, nextChat);
    }
  };

  // ===== Rename / Delete Dialog 控制 =====
  const openRename = (t: Target) => {
    setRenameTarget(t);
    setRenameValue(t.name);
  };
  const confirmRename = () => {
    if (!renameTarget) return;
    if (renameTarget.type === "project") {
      renameProject(renameTarget.id, renameValue.trim() || "Untitled");
    } else {
      renameChat(renameTarget.projectId, renameTarget.id, renameValue.trim() || "Untitled");
    }
    setRenameTarget(null);
  };
  const openDelete = (t: Target) => setDeleteTarget(t);
  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "project") deleteProject(deleteTarget.id);
    else deleteChat(deleteTarget.projectId, deleteTarget.id);
    setDeleteTarget(null);
  };

  // ===== 歷史專案 =====
  const openArchivedProject = (pid: string) => {
    const proj = archived.find((p) => p.id === pid);
    if (!proj) return;
    setArchived((prev) => prev.filter((p) => p.id !== pid));
    setProjects((prev) => [proj, ...prev]);
    setActiveProjectId(proj.id);
    setActiveChatId(proj.chats[0]?.id ?? "");
    setExpandedProjects((prev) => ({ ...prev, [proj.id]: true }));
    onSelectProject?.(proj);
  };

  // ===== 鍵盤快捷鍵：Delete / Enter =====
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKeyDown = (e: KeyboardEvent) => {
      // 只在 Sidebar 本身或其子孫元素聚焦時響應
      if (!el.contains(document.activeElement)) return;

      // 刪除：先刪 Chat，無 Chat 再刪 Project
      if (e.key === "Delete") {
        e.preventDefault();
        if (activeChat && activeProject) {
          openDelete({ type: "chat", id: activeChat.id, name: activeChat.title, projectId: activeProject.id });
        } else if (activeProject) {
          openDelete({ type: "project", id: activeProject.id, name: activeProject.name });
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeChat, activeProject]);

    const [searchTerm, setSearchTerm] = useState("");

      const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;
    const term = searchTerm.toLowerCase();
    return projects
      .map((p) => ({
        ...p,
        chats: p.chats.filter((c) => c.title.toLowerCase().includes(term)),
      }))
      .filter(
        (p) => p.name.toLowerCase().includes(term) || p.chats.length > 0
      );
  }, [projects, searchTerm]);

  return (
    <TooltipProvider delayDuration={700}>
      <motion.aside
        ref={containerRef}
        initial={false}
        animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="sticky top-0 h-screen bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] overflow-hidden z-40"
        aria-expanded={!collapsed}
        tabIndex={0} // 讓容器可聚焦以接鍵盤事件
      >
        {/* 收納狀態：整個區域可點展開 */}
        {collapsed && (
          <button
            className="absolute inset-0 z-10 bg-transparent"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            title="Expand"
          />
        )}

        {/* 頂部切換鈕 */}
        <div className="p-2 flex justify-end">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-[var(--muted)] relative z-20"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* 展開內容 */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="sidebar-content"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col p-4 pt-0 space-y-4"
            >
                 {/* 🔍 搜尋框 */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search chats..."
                  className="pl-8 pr-8"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      // TODO: 呼叫 Supabase/後端 API 搜尋
                      console.log("Search submit:", searchTerm);
                    }
                  }}
                />
                {searchTerm && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Projects Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Projects</span>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-[var(--muted)]"
                        onClick={addProject}
                        aria-label="Add project"
                        title="Add Project"
                      >
                        <FolderPlus className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">New Project</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-[var(--muted)] disabled:opacity-50"
                        onClick={addChatToActive}
                        disabled={!activeProjectId}
                        aria-label="Add chat"
                        title="New Chat in Current Project"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">New Chat</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Projects + Chats */}
              <ScrollArea className="flex-1 pr-2">
                <div className="space-y-2">
                  {projects.map((p) => {
                    const isExpanded = !!expandedProjects[p.id];
                    const isActiveProject = p.id === activeProjectId;

                    return (
                      <div key={p.id} className="rounded-md">
                        {/* Project Row（含 hover 操作） */}
                        <div
                          className={clsx(
                            "group relative flex items-center justify-between px-2 py-1 rounded-md transition-colors",
                            isActiveProject ? "bg-[var(--muted)] text-[var(--foreground)]" : "hover:bg-[var(--muted)]"
                          )}
                          onMouseDown={() => {
                            setActiveProjectId(p.id);
                            setActiveChatId(p.chats[0]?.id ?? "");
                            onSelectProject?.(p);
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <button
                              className="h-6 w-6 grid place-items-center rounded hover:bg-[var(--muted)]"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleProject(p.id);
                              }}
                              aria-label={isExpanded ? "Collapse project" : "Expand project"}
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>

                            <Folder className="h-4 w-4 shrink-0" />
                            <span className="truncate">{p.name}</span>
                          </div>

                          {/* Hover Actions */}
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="px-2 h-7 inline-flex items-center rounded-md border border-[var(--sidebar-border)] bg-[var(--muted)] hover:bg-blue-600 hover:text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveProjectId(p.id);
                                    setActiveChatId(p.chats[0]?.id ?? "");
                                    onSelectProject?.(p);
                                  }}
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  Use
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left">Open Project</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-blue-600 hover:text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openRename({ type: "project", id: p.id, name: p.name });
                                  }}
                                  aria-label="Rename project"
                                  title="Rename"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left">Rename</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-blue-600 hover:text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDelete({ type: "project", id: p.id, name: p.name });
                                  }}
                                  aria-label="Delete project"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left">Delete</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>

                        {/* Chats（含 hover 操作） */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div {...sectionSlide} className="pl-6 mt-1 space-y-1">
                              {p.chats.length === 0 && (
                                <div className="text-xs text-muted-foreground px-2 py-1">No chats. Create one.</div>
                              )}

                              {p.chats.map((c) => {
                                const isActiveChat = c.id === activeChatId;
                                return (
                                  <div
                                    key={c.id}
                                    className={clsx(
                                      "group relative flex items-center justify-between px-2 py-1 rounded-md transition-colors",
                                      isActiveChat ? "bg-[var(--muted)]" : "hover:bg-[var(--muted)]"
                                    )}
                                    onMouseDown={() => {
                                      setActiveProjectId(p.id);
                                      setActiveChatId(c.id);
                                      onSelectChat?.(p, c);
                                    }}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <MessageSquare className="h-4 w-4 shrink-0" />
                                      <span className="truncate text-sm">{c.title}</span>
                                    </div>

                                    {/* Hover Actions */}
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            className="px-2 h-7 inline-flex items-center rounded-md border border-[var(--sidebar-border)] bg-[var(--muted)] hover:bg-blue-600 hover:text-white"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveProjectId(p.id);
                                              setActiveChatId(c.id);
                                              onSelectChat?.(p, c);
                                            }}
                                          >
                                            <Check className="h-3.5 w-3.5 mr-1" />
                                            Use
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="left">Open Chat</TooltipContent>
                                      </Tooltip>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-blue-600 hover:text-white"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openRename({ type: "chat", id: c.id, name: c.title, projectId: p.id });
                                            }}
                                            aria-label="Rename chat"
                                            title="Rename"
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="left">Rename</TooltipContent>
                                      </Tooltip>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-blue-600 hover:text-white"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openDelete({ type: "chat", id: c.id, name: c.title, projectId: p.id });
                                            }}
                                            aria-label="Delete chat"
                                            title="Delete"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="left">Delete</TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Historical Projects */}
              <div className="space-y-1">
                <button
                  className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-[var(--muted)]"
                  onClick={() => setArchivedExpanded((v) => !v)}
                  aria-expanded={archivedExpanded}
                >
                  <span className="text-xs font-semibold text-muted-foreground">Historical Projects</span>
                  {archivedExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                <AnimatePresence initial={false}>
                  {archivedExpanded && (
                    <motion.div {...sectionSlide} className="pl-2 space-y-1">
                      {archived.length === 0 && (
                        <div className="text-xs text-muted-foreground px-2 py-1">No archived projects.</div>
                      )}
                      {archived.map((p) => (
                        <div
                          key={p.id}
                          className="group relative flex items-center justify-between px-2 py-1 rounded hover:bg-[var(--muted)]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Folder className="h-4 w-4 shrink-0" />
                            <span className="truncate text-sm">{p.name}</span>
                          </div>

                          {/* Hover action：Open */}
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="px-2 h-7 inline-flex items-center rounded-md border border-[var(--sidebar-border)] bg-[var(--muted)] hover:bg-blue-600 hover:text-white"
                                  onClick={() => openArchivedProject(p.id)}
                                  aria-label="Open project"
                                  title="Open Project"
                                >
                                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                  Open
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left">Open</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="text-xs text-muted-foreground mt-1">© 2025 Mr. Click</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rename Dialog（Enter 送出） */}
        <Dialog open={!!renameTarget} onOpenChange={() => setRenameTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>重新命名</DialogTitle>
              <DialogDescription>
                {renameTarget?.type === "project" ? "請輸入新的 Project 名稱" : "請輸入新的 Chat 名稱"}
              </DialogDescription>
            </DialogHeader>
            <Input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="New name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmRename();
                }
              }}
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setRenameTarget(null)}>取消</Button>
              <Button onClick={confirmRename}>確認</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>確認刪除</DialogTitle>
              <DialogDescription className="text-destructive">
                此動作無法復原。確定要刪除「{deleteTarget?.name}」嗎？
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>取消</Button>
              <Button variant="destructive" onClick={confirmDelete}>刪除</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.aside>
    </TooltipProvider>
  );
}

