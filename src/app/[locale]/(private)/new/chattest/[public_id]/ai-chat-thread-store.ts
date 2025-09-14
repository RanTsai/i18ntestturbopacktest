"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------- Types ----------------------

export type IChatProject = {
  public_id: string;
  name: string | null;
  ai_summary: string | null;
  is_deleted: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string | null;
};

export type IChatThread = {
  public_id: string;
  title: string | null;
  ai_summary: string | null;
  is_deleted: boolean;
  is_archived: boolean;
  chat_project_public_id: string | null; // null = not assigned
  parent_thread_public_id: string | null;
  origin_message_id: number | null;
};

export type IChatMessage = {
  chat_message_id: number | string;
  created_at: string;
  content: any | null;
  asset_id: number | null;
  user_note: string | null;
  note_id: number[] | null;
  reference_id: string | null;
  ai_persona: number | null;
  system_prompt_id: number | null;
  message_index: number;
  parent_message_id: number | null;
  is_user: boolean;
  persona: number[] | null;
  structure: any | null;
  latest_chat_run_id: number | null;
  user_feedback: boolean | null;
  chat_variant: any | null;
  version_number: number | null;
  has_branch: boolean;
  children_branch: any | null;

  /** 前端排序用；樂觀加入時立即寫入 */
  client_ts?: number;
  /** UI/store 內可選；RPC 邊界常用 */
  thread_id?: string | null;
  /** 狀態：串流中/成功/失敗（最小可用版必備） */
  status?: MessageStatus;
  /** 是否暫時 id（可選；多半用 chat_message_id 前綴也可判斷） */
  is_temp?: boolean;
};
type MessageStatus = 'sending' | 'sent' | 'error';


// ---------------------- Normalized Shapes ----------------------

export type ThreadsById = Record<string, IChatThread>;
export type ThreadIdsByProject = Record<string /* projectId|'unassigned' */, string[]>;

export type MessagesBucket = {
  items: IChatMessage[];
  cursor?: string | null;
  hasMore?: boolean;
  isLoading?: boolean;
};
export type MessagesByThread = Record<string /* threadId */, MessagesBucket>;

export type ProjectsById = Record<string, IChatProject>;

const UNASSIGNED_KEY = "unassigned";
// ---------------------- Store Type ----------------------

type AIThreadStore = {
  projects: IChatProject[];
  projectsById: ProjectsById;

  threadsById: ThreadsById;
  threadIdsByProject: ThreadIdsByProject;

  messagesByThread: MessagesByThread;

  selectedProjectId: string | null;
  selectedThreadId: string | null;
  userWorkPublicId: string | null;
  versionNumber: number | null;

  reset: () => void;

  upsertProjects: (ps: IChatProject[], sortBy?: (a: IChatProject, b: IChatProject) => number) => void;
  upsertThreadsForProject: (pid: string | typeof UNASSIGNED_KEY, ts: IChatThread[]) => void;
  upsertThreads: (ts: IChatThread[]) => void;
  setThreadIdsForProject: (pid: string, ids: string[]) => void;

  moveThreadToProject: (threadId: string, toPid: string | null, position?: number) => void;

  replaceMessages: (tid: string, msgs: IChatMessage[], meta?: { cursor?: string | null; hasMore?: boolean }) => void;
  appendMessages: (tid: string, msgs: IChatMessage[], meta?: { cursor?: string | null; hasMore?: boolean }) => void;
  setMessagesLoading: (tid: string, loading: boolean) => void;

  selectProject: (pid: string | null) => void;
  selectThread: (tid: string | null) => void;
  replaceThreadId: (tempId: string, realId: string) => void,
  setUserWorkPublicId: (publicId: string) => void,
  setVersionNumber: (version: number) => void,

};

// ---------------------- Partialize ----------------------

const partialize = (s: AIThreadStore) => ({
  projects: s.projects,
  projectsById: s.projectsById,
  threadsById: s.threadsById,
  threadIdsByProject: s.threadIdsByProject,
  selectedProjectId: s.selectedProjectId,
  selectedThreadId: s.selectedThreadId,
  // ❌ 不持久化 messagesByThread
});

// ---------------------- Store ----------------------

export const useAIChatStore = create<AIThreadStore>()(
  persist(
    (set, get) => ({
      projects: [],
      projectsById: {},
      threadsById: {},
      threadIdsByProject: { [UNASSIGNED_KEY]: [] },
      messagesByThread: {},
      selectedProjectId: null,
      selectedThreadId: null,
      userWorkPublicId: "",
      versionNumber: 0,

      reset: () =>
        set({
          projects: [],
          projectsById: {},
          threadsById: {},
          threadIdsByProject: { [UNASSIGNED_KEY]: [] },
          messagesByThread: {},
          selectedProjectId: null,
          selectedThreadId: null,
          userWorkPublicId: "",
          versionNumber: 0,
        }),

      upsertProjects: (ps, sortBy) =>
        set((s) => {
          const byId = { ...s.projectsById };
          for (const p of ps) byId[p.public_id] = p;

          const projects = Object.values(byId);
          projects.sort(
            sortBy ??
            ((a, b) => (a.created_at > b.created_at ? -1 : 1)) // 預設新到舊
          );

          return { projectsById: byId, projects };
        }),

      upsertThreadsForProject: (pid, ts) =>
        set((s) => {
          const byId = { ...s.threadsById };
          const ids: string[] = [];
          for (const t of ts) {
            byId[t.public_id] = t;
            ids.push(t.public_id);
          }
          return {
            threadsById: byId,
            threadIdsByProject: {
              ...s.threadIdsByProject,
              [pid ?? UNASSIGNED_KEY]: ids,
            },
          };
        }),

      upsertThreads: (ts) =>
        set((s) => {
          const byId = { ...s.threadsById };
          for (const t of ts) byId[t.public_id] = t;
          return { threadsById: byId };
        }),

      setThreadIdsForProject: (pid, ids) =>
        set((s) => ({
          threadIdsByProject: { ...s.threadIdsByProject, [pid]: ids },
        })),

      moveThreadToProject: (tid, toPid, position = 0) =>
        set((s) => {
          // 找來源 pid
          let fromPid: string | null = null;
          for (const [pid, arr] of Object.entries(s.threadIdsByProject)) {
            if (arr.includes(tid)) {
              fromPid = pid;
              break;
            }
          }
          const targetPid = toPid ?? UNASSIGNED_KEY;

          const nextMap: ThreadIdsByProject = { ...s.threadIdsByProject };
          if (fromPid) nextMap[fromPid] = nextMap[fromPid].filter((id) => id !== tid);

          const target = nextMap[targetPid] ?? [];
          const i = Math.max(0, Math.min(position, target.length));
          nextMap[targetPid] = [...target.slice(0, i), tid, ...target.slice(i)];

          // 同步 thread 內的 project 欄位（可選）
          const t = s.threadsById[tid];
          const byId = t
            ? { ...s.threadsById, [tid]: { ...t, chat_project_public_id: toPid } }
            : s.threadsById;

          return { threadIdsByProject: nextMap, threadsById: byId };
        }),

      replaceMessages: (tid, msgs, meta) =>
        set((s) => ({
          messagesByThread: {
            ...s.messagesByThread,
            [tid]: {
              items: msgs,
              cursor: meta?.cursor ?? null,
              hasMore: meta?.hasMore,
              isLoading: false,
            },
          },
        })),

      appendMessages: (tid, msgs, meta) =>
        set((s) => {
          const prev = s.messagesByThread[tid]?.items ?? [];
          return {
            messagesByThread: {
              ...s.messagesByThread,
              [tid]: {
                items: [...prev, ...msgs],
                cursor: meta?.cursor ?? s.messagesByThread[tid]?.cursor ?? null,
                hasMore: meta?.hasMore ?? s.messagesByThread[tid]?.hasMore,
                isLoading: false,
              },
            },
          };
        }),

      setMessagesLoading: (tid, loading) =>
        set((s) => ({
          messagesByThread: {
            ...s.messagesByThread,
            [tid]: {
              items: s.messagesByThread[tid]?.items ?? [],
              cursor: s.messagesByThread[tid]?.cursor ?? null,
              hasMore: s.messagesByThread[tid]?.hasMore,
              isLoading: loading,
            },
          },
        })),

      selectProject: (pid) => set({ selectedProjectId: pid }),
      selectThread: (tid) => set({ selectedThreadId: tid }),

      setUserWorkPublicId: (publicId) => set({ userWorkPublicId: publicId }),
      setVersionNumber: (version) => set({ versionNumber: version }),

      replaceThreadId: (tempId, realId) =>
        set((s) => {
          if (!tempId || !realId || tempId === realId) return {};

          // 1) threadsById key 換名
          const t = s.threadsById[tempId];
          const nextThreadsById = { ...s.threadsById };
          if (t) {
            delete nextThreadsById[tempId];
            nextThreadsById[realId] = { ...t, public_id: realId };
          }

          // 2) threadIdsByProject 陣列中的 id 替換
          const nextMap: ThreadIdsByProject = {};
          for (const [pid, arr] of Object.entries(s.threadIdsByProject)) {
            nextMap[pid] = arr.map((id) => (id === tempId ? realId : id));
          }

          // 3) messagesByThread bucket key 換名
          const nextMsgs: MessagesByThread = { ...s.messagesByThread };
          if (s.messagesByThread[tempId]) {
            nextMsgs[realId] = s.messagesByThread[tempId];
            delete nextMsgs[tempId];
          }

          // 4) selectedThreadId 若是 temp 也要換
          const nextSelected = s.selectedThreadId === tempId ? realId : s.selectedThreadId;

          return {
            threadsById: nextThreadsById,
            threadIdsByProject: nextMap,
            messagesByThread: nextMsgs,
            selectedThreadId: nextSelected,
          };
        }),
    }),

    {
      name: "ai-chat-session-store",
      storage: {
        getItem: (name) => {
          const item = sessionStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
      partialize,
    }
  )
);

export const useThreadsOfProject = (pid: string | null) => {
  const key = pid ?? UNASSIGNED_KEY;
  return useAIChatStore((s) =>
    (s.threadIdsByProject[key] ?? []).map((id) => s.threadsById[id]).filter(Boolean)
  );
};

export const useActiveMessages = () =>
  useAIChatStore((s) =>
    s.selectedThreadId ? s.messagesByThread[s.selectedThreadId]?.items ?? [] : []
  );

export const UNASSIGNED = UNASSIGNED_KEY;
