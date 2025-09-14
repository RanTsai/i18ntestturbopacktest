"use client";
import { useCallback, useMemo } from "react";
import {
  useAIChatStore,
  IChatProject,
  IChatThread,
  ThreadsById,
  ThreadIdsByProject,
  MessagesByThread,
  UNASSIGNED,
} from "./ai-chat-thread-store";
import {
  fetchALLChatThreadFromSupabaseRPC,
  renameProject as saRenameProject,
  setProjectArchived as saSetProjectArchived,
  deleteProject as saDeleteProject,
  renameThread as saRenameThread,
  setThreadArchived as saSetThreadArchived,
  deleteThread as saDeleteThread,
  moveThreadToProject as saMoveThreadToProject,
  createProject as saCreateProject,
  // NEW: 用于 tmp 线程改名即创建
  createChatThreadIfNeeded as saCreateChatThreadIfNeeded,
} from "@/actions/supabase/supabase-ai-chat";
import { useShallow } from "zustand/shallow";

import {
  makeScopeId,
  idbHydrateScope,
  idbPersistSnapshot,
  idbUpsertProject,
  idbSetProjectArchived,
  idbDeleteProject,
  idbUpsertThread,
  idbMoveThread,
  idbDeleteThread,
  idbEnqueueOp,
} from "@/lib/idb/chat-idb";

/** 後端 RPC 的單一形狀 */
type RpcPayload = {
  projects: Record<string, IChatProject>;
  threadsById: ThreadsById;
  threadIdsByProject: ThreadIdsByProject;
  messagesByThread?: MessagesByThread;
};

const isTmpId = (id: string | null | undefined) => !!id && id.startsWith("tmp_");

export function useActiveMessages() {
  const bucket = useAIChatStore(
    useShallow((s) => {
      const tid = s.selectedThreadId;
      return tid ? s.messagesByThread[tid] : undefined;
    })
  );

  return useMemo(() => {
    const items = bucket?.items ?? [];
    const sorted = [...items].sort((a: any, b: any) => {
      const ta = a.created_at ? +new Date(a.created_at) : a.client_ts ?? 0;
      const tb = b.created_at ? +new Date(b.created_at) : b.client_ts ?? 0;
      if (ta !== tb) return ta - tb;
      return String(a.chat_message_id).localeCompare(String(b.chat_message_id));
    });
    return sorted;
  }, [bucket]);
}

export function useActiveThread() {
  const thread = useAIChatStore(
    useShallow((s) => {
      const tid = s.selectedThreadId;
      return tid ? (s.threadsById[tid] ?? null) : null;
    })
  );
  return thread;
}

export function useAiChatThreadViewModel() {
  const {
    // state
    projects,
    projectsById,
    threadsById,
    threadIdsByProject,
    messagesByThread,
    selectedProjectId,
    selectedThreadId,
    userWorkPublicId,
    versionNumber,

    // store actions（UI 仍需）
    upsertProjects,
    upsertThreadsForProject,
    upsertThreads,
    setThreadIdsForProject,
    selectProject,
    selectThread,
    setUserWorkPublicId,
    setVersionNumber,
    // 直接用 store 内既有的移动方法（本地）
    moveThreadToProject,
  } = useAIChatStore();

  const nowIso = () => new Date().toISOString();

  /** 注入 payload 到 store */
  const hydrateFromRPC = useCallback(
    (payload: RpcPayload) => {
      const projectsById = payload.projects ?? {};
      const projectsArr = Object.values(projectsById).sort((a, b) =>
        a.created_at > b.created_at ? -1 : 1
      );

      const rawMsgs = payload.messagesByThread ?? {};
      const bucketizedMsgs = Object.fromEntries(
        Object.entries(rawMsgs).map(([tid, arr]) => [
          tid,
          {
            items: Array.isArray(arr) ? (arr as any[]) : [],
            cursor: null,
            hasMore: false,
            isLoading: false,
          },
        ])
      ) as MessagesByThread;

      useAIChatStore.setState({
        projects: projectsArr,
        projectsById,
        threadsById: payload.threadsById ?? {},
        threadIdsByProject: payload.threadIdsByProject ?? {},
        messagesByThread: bucketizedMsgs,
      });

      const firstProjectId = projectsArr[0]?.public_id ?? null;
      const firstProjectFirstThread =
        firstProjectId && (payload.threadIdsByProject?.[firstProjectId]?.[0] ?? null);

      const unassignedFirstThread = payload.threadIdsByProject?.[UNASSIGNED]?.[0] ?? null;
      const firstThreadId = firstProjectFirstThread ?? unassignedFirstThread ?? null;

      if (firstProjectId) selectProject(firstProjectId);
      if (firstThreadId) selectThread(firstThreadId);
    },
    [selectProject, selectThread]
  );

  /** local-first 加载 */
  const loadChatThreads = useCallback(
    async (uw?: string | null, ver?: number | null) => {
      const scope = makeScopeId(uw ?? null, ver ?? null);

      // 1) 先 IDB
      try {
        const local = await idbHydrateScope(scope);
        if (local) {
          hydrateFromRPC({
            projects: local.projects,
            threadsById: local.threadsById,
            threadIdsByProject: local.threadIdsByProject,
            messagesByThread: {},
          });
        }
      } catch (e) {
        console.warn("[IDB] hydrate failed:", e);
      }

      // 2) 再拉 Supabase → 覆盖写回 IDB + VM
      try {
        const { data, success, message } = await fetchALLChatThreadFromSupabaseRPC(
          uw ?? null,
          ver ?? null
        );
        if (!success || !data) {
          console.error("❌ fetchALLChatThreadFromSupabaseRPC failed:", message);
          return;
        }
        const payload = data as RpcPayload;

        await idbPersistSnapshot(scope, {
          projects: payload.projects ?? {},
          threadsById: payload.threadsById ?? {},
          threadIdsByProject: payload.threadIdsByProject ?? {},
        });

        hydrateFromRPC(payload);
      } catch (err: any) {
        console.error("❌ RPC error:", err?.message ?? String(err));
      }
    },
    [hydrateFromRPC]
  );

  // ============== Project 相关（与之前一致） ==============
  const vmCreateProject = useCallback(
    async (name: string | null = "New Project", uw?: string | null, ver?: number | null) => {
      const scope = makeScopeId(uw ?? null, ver ?? null);

      const { data, success, message } = await saCreateProject({ name });
      if (!success || !data) throw new Error(message ?? "createProject failed");
      const created = data as IChatProject;

      useAIChatStore.setState((s) => {
        const nextProjectsById = { ...s.projectsById, [created.public_id]: created };
        const nextProjects = Object.values(nextProjectsById).sort((a, b) =>
          a.created_at > b.created_at ? -1 : 1
        );
        const nextThreadIdsByProject = {
          ...s.threadIdsByProject,
          [created.public_id]: s.threadIdsByProject[created.public_id] ?? [],
        };
        return { projectsById: nextProjectsById, projects: nextProjects, threadIdsByProject: nextThreadIdsByProject };
      });

      await idbUpsertProject(scope, created);
      return created;
    },
    []
  );

  const vmRenameProject = useCallback(
    async (pid: string, nextName: string, uw?: string | null, ver?: number | null) => {
      const scope = makeScopeId(uw ?? null, ver ?? null);
      const prev = useAIChatStore.getState();
      const prevById = prev.projectsById;
      const prevArr = prev.projects;

      const p = prevById[pid];
      if (p) {
        const optimistic = { ...p, name: nextName, updated_at: nowIso() } as IChatProject;
        useAIChatStore.setState({
          projectsById: { ...prevById, [pid]: optimistic },
          projects: prevArr.map((x) => (x.public_id === pid ? optimistic : x)),
        });
        await idbUpsertProject(scope, optimistic);
        await idbEnqueueOp(scope, { type: "renameProject", pid, name: nextName });
      }

      const res = await saRenameProject(pid, nextName);
      if (!res.success || !res.data) {
        useAIChatStore.setState({ projectsById: prevById, projects: prevArr });
        const rollback = prevById[pid];
        if (rollback) await idbUpsertProject(scope, rollback);
        throw new Error(res.message || "renameProject failed");
      } else {
        const serverRow = res.data as IChatProject;
        useAIChatStore.setState((s) => {
          const nextProjectsById = { ...s.projectsById, [serverRow.public_id]: serverRow };
          const nextProjects = Object.values(nextProjectsById).sort((a, b) =>
            a.created_at > b.created_at ? -1 : 1
          );
          return { projectsById: nextProjectsById, projects: nextProjects };
        });
        await idbUpsertProject(scope, serverRow);
      }
    },
    []
  );

  const vmSetProjectArchived = useCallback(
    async (pid: string, flag: boolean, uw?: string | null, ver?: number | null) => {
      const scope = makeScopeId(uw ?? null, ver ?? null);
      const prev = useAIChatStore.getState();
      const prevById = prev.projectsById;
      const prevArr = prev.projects;

      const p = prevById[pid];
      if (p) {
        const optimistic = { ...p, is_archived: flag, updated_at: nowIso() } as IChatProject;
        useAIChatStore.setState({
          projectsById: { ...prevById, [pid]: optimistic },
          projects: prevArr.map((x) => (x.public_id === pid ? optimistic : x)),
        });
        await idbSetProjectArchived(scope, pid, flag);
        await idbEnqueueOp(scope, { type: "setProjectArchived", pid, flag });
      }

      const res = await saSetProjectArchived(pid, flag);
      if (!res.success || !res.data) {
        useAIChatStore.setState({ projectsById: prevById, projects: prevArr });
        const rollback = prevById[pid];
        if (rollback) await idbUpsertProject(scope, rollback);
        throw new Error(res.message || "setProjectArchived failed");
      } else {
        const serverRow = res.data as IChatProject;
        useAIChatStore.setState((s) => {
          const nextProjectsById = { ...s.projectsById, [serverRow.public_id]: serverRow };
          const nextProjects = Object.values(nextProjectsById).sort((a, b) =>
            a.created_at > b.created_at ? -1 : 1
          );
          return { projectsById: nextProjectsById, projects: nextProjects };
        });
        await idbUpsertProject(scope, serverRow);
      }
    },
    []
  );

  const vmDeleteProject = useCallback(
    async (pid: string, uw?: string | null, ver?: number | null) => {
      const scope = makeScopeId(uw ?? null, ver ?? null);
      const prev = useAIChatStore.getState();

      useAIChatStore.setState((s) => {
        const byId = { ...s.projectsById };
        delete byId[pid];
        const projects = Object.values(byId).sort((a, b) => (a.created_at > b.created_at ? -1 : 1));

        const victimIds = s.threadIdsByProject[pid] ?? [];
        const nextMap = { ...s.threadIdsByProject };
        delete nextMap[pid];
        nextMap[UNASSIGNED] = [...victimIds, ...(nextMap[UNASSIGNED] ?? [])];

        const threadsById = { ...s.threadsById };
        for (const tid of victimIds) {
          const t = threadsById[tid];
          if (t) threadsById[tid] = { ...t, chat_project_public_id: null } as any;
        }

        const selectedProjectId = s.selectedProjectId === pid ? null : s.selectedProjectId;
        const selectedThreadId =
          s.selectedThreadId && victimIds.includes(s.selectedThreadId) ? null : s.selectedThreadId;

        return {
          projectsById: byId,
          projects,
          threadIdsByProject: nextMap,
          threadsById,
          selectedProjectId,
          selectedThreadId,
        };
      });

      // IDB 乐观
      const victims = prev.threadIdsByProject[pid] ?? [];
      await idbDeleteProject(scope, pid);
      for (const tid of victims) {
        await idbMoveThread(scope, tid, pid, null, 0);
      }
      await idbEnqueueOp(scope, { type: "deleteProject", pid });

      const res = await saDeleteProject(pid);
      if (!res.success) {
        useAIChatStore.setState(prev);
        await loadChatThreads(uw ?? null, ver ?? null);
        throw new Error(res.message || "deleteProject failed");
      }
    },
    [loadChatThreads]
  );

  // ============== Thread 相关（新增 tmp_* 分流） ==============

  /** 找出某 thread 当前所属的 projectId（用本地 store） */
  const findProjectIdByThread = useCallback(
    (tid: string): string | null => {
      const p = useAIChatStore.getState().threadsById[tid]?.chat_project_public_id;
      if (p !== undefined && p !== null) return p;
      for (const [pid, arr] of Object.entries(useAIChatStore.getState().threadIdsByProject)) {
        if (arr.includes(tid)) return pid === UNASSIGNED ? null : (pid as string);
      }
      return null;
    },
    []
  );

  // --- Thread: rename ---
  const vmRenameThread = useCallback(
    async (tid: string, nextTitle: string, uw?: string | null, ver?: number | null) => {
      const scope = makeScopeId(uw ?? null, ver ?? null);
      const prev = useAIChatStore.getState();
      const prevThreadsById = prev.threadsById;

      // NEW: 如果是临时线程（还没发过消息），改名 = 直接在 Supabase 创建正式线程
      if (isTmpId(tid)) {
        const tmpThread = prevThreadsById[tid];
        const targetProjectPublicId = tmpThread?.chat_project_public_id ?? null;

        // 1) 调用 create_if_needed 创建正式 thread（用新的标题）
        const res = await saCreateChatThreadIfNeeded({
          threadPublicId: null,
          projectPublicId: targetProjectPublicId,
          titleSeed: nextTitle,
          userWorkPublicId: uw ?? null,
        });
        if (!res.success || !res.data?.thread_public_id) {
          // 失败就只回滚本地标题（保持临时线程仍在）
          throw new Error(res.message || "create_chat_thread_if_needed failed");
        }
        const newId = res.data.thread_public_id;

        // 2) 用新 id 替换本地/IDB
        useAIChatStore.setState((s) => {
          const fromPid = targetProjectPublicId ?? UNASSIGNED;
          const list = s.threadIdsByProject[fromPid] ?? [];
          const pos = Math.max(0, list.indexOf(tid));

          // a) threadsById：删除旧的、插入新的
          const newThread: IChatThread = {
            ...(s.threadsById[tid] ?? {
              is_deleted: false,
              is_archived: false,
              ai_summary: null,
              parent_thread_public_id: null,
              origin_message_id: null,
            }),
            public_id: newId,
            title: nextTitle,
            updated_at: nowIso(),
          } as IChatThread;

          const threadsById = { ...s.threadsById };
          delete threadsById[tid];
          threadsById[newId] = newThread;

          // b) threadIdsByProject：替换 tmpId → newId（维持位置）
          const nextMap = { ...s.threadIdsByProject };
          const cur = [...(nextMap[fromPid] ?? [])];
          const idx = cur.indexOf(tid);
          if (idx >= 0) {
            cur.splice(idx, 1, newId);
          } else {
            // 如果没找到（极少数情况），就插到指定位置
            cur.splice(pos, 0, newId);
          }
          nextMap[fromPid] = cur;

          // c) 选择项：如正在编辑该 thread，则同步选中
          const selectedThreadId = s.selectedThreadId === tid ? newId : s.selectedThreadId;

          return { threadsById, threadIdsByProject: nextMap, selectedThreadId };
        });

        // 3) IDB：删除临时 → upsert 新 id（位置在 IDB 里可能变动到最前，属可接受权衡）
        await idbDeleteThread(scope, tid);
        const newRow: IChatThread = {
          ...(prevThreadsById[tid] ?? {
            is_deleted: false,
            is_archived: false,
            ai_summary: null,
            parent_thread_public_id: null,
            origin_message_id: null,
          }),
          public_id: newId,
          title: nextTitle,
          updated_at: nowIso(),
        } as IChatThread;
        await idbUpsertThread(scope, newRow);

        // ⚠️ 这里不再调用 renameThread RPC，因为已由 create_if_needed 完成「创建 + 标题设置」
        return;
      }

      // ===== 非临时线程：维持既有的 rename 流程 =====
      const t = prevThreadsById[tid];
      if (t) {
        const optimistic = { ...t, title: nextTitle, updated_at: nowIso() } as IChatThread;
        useAIChatStore.setState({ threadsById: { ...prevThreadsById, [tid]: optimistic } });
        await idbUpsertThread(scope, optimistic);
        await idbEnqueueOp(scope, { type: "renameThread", tid, title: nextTitle });
      }

      const res = await saRenameThread(tid, nextTitle);
      if (!res.success || !res.data) {
        useAIChatStore.setState({ threadsById: prevThreadsById });
        const rollback = prevThreadsById[tid];
        if (rollback) await idbUpsertThread(scope, rollback);
        throw new Error(res.message || "renameThread failed");
      } else {
        const serverRow = res.data as unknown as IChatThread;
        useAIChatStore.setState((s) => ({
          threadsById: { ...s.threadsById, [serverRow.public_id]: serverRow },
        }));
        await idbUpsertThread(scope, serverRow);
      }
    },
    []
  );

  // --- Thread: archive/unarchive ---
  const vmSetThreadArchived = useCallback(
    async (tid: string, isArchived: boolean, uw?: string | null, ver?: number | null) => {
      const scope = makeScopeId(uw ?? null, ver ?? null);
      const prev = useAIChatStore.getState();
      const prevThreadsById = prev.threadsById;

      // NEW: 临时线程 → 只做本地 & IDB，不打 API
      if (isTmpId(tid)) {
        const t = prevThreadsById[tid];
        if (t) {
          const optimistic = { ...t, is_archived: isArchived, updated_at: nowIso() } as IChatThread;
          useAIChatStore.setState({ threadsById: { ...prevThreadsById, [tid]: optimistic } });
          await idbUpsertThread(scope, optimistic);
        }
        return;
      }

      // 非临时 → 原流程
      const t = prevThreadsById[tid];
      if (t) {
        const optimistic = { ...t, is_archived: isArchived, updated_at: nowIso() } as IChatThread;
        useAIChatStore.setState({ threadsById: { ...prevThreadsById, [tid]: optimistic } });
        await idbUpsertThread(scope, optimistic);
        await idbEnqueueOp(scope, { type: "setThreadArchived", tid, flag: isArchived });
      }

      const res = await saSetThreadArchived(tid, isArchived);
      if (!res.success || !res.data) {
        useAIChatStore.setState({ threadsById: prevThreadsById });
        const rollback = prevThreadsById[tid];
        if (rollback) await idbUpsertThread(scope, rollback);
        throw new Error(res.message || "setThreadArchived failed");
      } else {
        const serverRow = res.data as unknown as IChatThread;
        useAIChatStore.setState((s) => ({
          threadsById: { ...s.threadsById, [serverRow.public_id]: serverRow },
        }));
        await idbUpsertThread(scope, serverRow);
      }
    },
    []
  );

  // --- Thread: delete (軟刪) ---
  const vmDeleteThread = useCallback(
    async (tid: string, uw?: string | null, ver?: number | null) => {
      const scope = makeScopeId(uw ?? null, ver ?? null);
      const prev = useAIChatStore.getState();

      // VM 本地删除
      useAIChatStore.setState((s) => {
        const nextMap = { ...s.threadIdsByProject };
        for (const key of Object.keys(nextMap)) {
          nextMap[key] = nextMap[key].filter((id) => id !== tid);
        }
        const threadsById = { ...s.threadsById };
        delete threadsById[tid];
        const messagesByThread = { ...s.messagesByThread };
        delete messagesByThread[tid];
        const selectedThreadId = s.selectedThreadId === tid ? null : s.selectedThreadId;
        return { threadIdsByProject: nextMap, threadsById, messagesByThread, selectedThreadId };
      });

      // IDB 本地删除
      await idbDeleteThread(scope, tid);

      // NEW: 临时线程 → 不打 API，直接结束
      if (isTmpId(tid)) return;

      // 非临时 → 原流程
      await idbEnqueueOp(scope, { type: "deleteThread", tid });
      const res = await saDeleteThread(tid);
      if (!res.success) {
        useAIChatStore.setState(prev);
        await loadChatThreads(uw ?? null, ver ?? null);
        throw new Error(res.message || "deleteThread failed");
      }
    },
    [loadChatThreads]
  );

  // --- Thread: move to project / unassigned ---
  const vmMoveThreadToProject = useCallback(
    async (tid: string, toPid: string | null, position = 0, uw?: string | null, ver?: number | null) => {
      const scope = makeScopeId(uw ?? null, ver ?? null);
      const prev = useAIChatStore.getState();

      // VM 乐观移动
      moveThreadToProject(tid, toPid, position);

      const fromPid = findProjectIdByThread(tid);

      // IDB 乐观移动
      await idbMoveThread(scope, tid, fromPid, toPid, position);

      // NEW: 临时线程 → 不打 API
      if (isTmpId(tid)) return;

      await idbEnqueueOp(scope, { type: "moveThread", tid, toPid });
      const res = await saMoveThreadToProject(tid, toPid);
      if (!res.success || !res.data) {
        useAIChatStore.setState(prev);
        await loadChatThreads(uw ?? null, ver ?? null);
        throw new Error(res.message || "moveThreadToProject failed");
      } else {
        const serverRow = res.data as unknown as IChatThread;
        useAIChatStore.setState((s) => ({
          threadsById: { ...s.threadsById, [serverRow.public_id]: serverRow },
        }));
        await idbUpsertThread(scope, serverRow);
      }
    },
    [findProjectIdByThread, moveThreadToProject, loadChatThreads]
  );


  

  return {
    // -------- state --------
    projects,
    projectsById,
    threadsById,
    threadIdsByProject,
    messagesByThread,
    selectedProjectId,
    selectedThreadId,
    userWorkPublicId,
    versionNumber,

    // -------- store actions (UI 仍需) --------
    upsertProjects,
    upsertThreadsForProject,
    upsertThreads,
    setThreadIdsForProject,
    selectProject,
    selectThread,
    setUserWorkPublicId,
    setVersionNumber,

    // -------- data snapshot loader --------
    loadChatThreads,

    // -------- VM business methods --------
    vmCreateProject,
    vmRenameProject,
    vmSetProjectArchived,
    vmDeleteProject,
    vmRenameThread,
    vmSetThreadArchived,
    vmDeleteThread,
    vmMoveThreadToProject,
  };
}

