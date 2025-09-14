// lib/idb/chat-local.ts
import { createIDBStore } from './local-idb'
import type { IChatProject, IChatThread, MessagesByThread} from "@/app/[locale]/(private)/new/aichat/[public_id]/ai-chat-thread-store"
export type ScopeId = string
export function makeScopeId(user_work_public_id?: string | null, version?: number | null): ScopeId {
  if (!user_work_public_id) return 'global'
  return version != null ? `work:${user_work_public_id}:v:${version}` : `work:${user_work_public_id}`
}

const stores = {
  scopes: createIDBStore<any>('scopes'),
  projects: createIDBStore<IChatProject>('projects'),
  threads: createIDBStore<IChatThread>('threads'),
  messages: createIDBStore<{ items: any[]; cursor?: string | null; hasMore?: boolean; updated_at?: string | null }>('messages'),
  indexes: createIDBStore<any>('indexes'),
  ops: createIDBStore<any>('ops'),
}

const k = {
  projectRow: (scope: ScopeId, pid: string) => `${scope}::project:${pid}`,
  threadRow:  (scope: ScopeId, tid: string) => `${scope}::thread:${tid}`,
  msgBucket:  (scope: ScopeId, tid: string) => `${scope}::messages:${tid}`,

  idxProjectIds:        (scope: ScopeId) => `${scope}::idx:projectIds`,
  idxThreadIdsByProj:   (scope: ScopeId, pid: string) => `${scope}::idx:threadIdsByProject:${pid}`, // pid or 'unassigned'
  idxOpIds:             (scope: ScopeId) => `${scope}::idx:opIds`,
  opItem:               (scope: ScopeId, opId: string) => `${scope}::op:${opId}`,
  scopeMeta:            (scope: ScopeId) => `${scope}`,
}

export const UNASSIGNED = 'unassigned'

/** -------- 讀：hydrate（IDB → VM payload） -------- */
export async function idbHydrateScope(scope: ScopeId): Promise<{
  projects: Record<string, IChatProject>
  threadsById: Record<string, IChatThread>
  threadIdsByProject: Record<string, string[]>
  messagesByThread: MessagesByThread
} | null> {
  // 讀索引
  const projectIds: string[] = (await stores.indexes.get(k.idxProjectIds(scope))) ?? []
  if (!projectIds.length) {
    // 沒有任何 project 索引，視為「此 scope 尚未初始化」
    return null
  }

  // 取 project rows
  const projectsEntries = await Promise.all(
    projectIds.map(async (pid) => [pid, await stores.projects.get(k.projectRow(scope, pid))] as const)
  )
  const projects: Record<string, IChatProject> = {}
  for (const [pid, row] of projectsEntries) {
    if (row) projects[pid] = row
  }

  // 取 threadIdsByProject（含 unassigned）
  const threadIdsByProject: Record<string, string[]> = {}
  const keysToRead = [k.idxThreadIdsByProj(scope, UNASSIGNED), ...projectIds.map(pid => k.idxThreadIdsByProj(scope, pid))]
  const values = await Promise.all(keysToRead.map(key => stores.indexes.get(key)))
  const mapKeys = [UNASSIGNED, ...projectIds]
  mapKeys.forEach((pid, i) => {
    threadIdsByProject[pid] = (values[i] ?? []) as string[]
  })

  // 取 thread rows
  const allThreadIds = Object.values(threadIdsByProject).flat()
  const threadRows = await Promise.all(
    allThreadIds.map(async (tid) => [tid, await stores.threads.get(k.threadRow(scope, tid))] as const)
  )
  const threadsById: Record<string, IChatThread> = {}
  for (const [tid, row] of threadRows) {
    if (row) threadsById[tid] = row
  }

  // messages：最小可用先不預抓（避免大量 IO），回傳空 bucket；需要時單獨讀
  const messagesByThread: MessagesByThread = {}

  return { projects, threadsById, threadIdsByProject, messagesByThread }
}

/** -------- 初始化/寫入：把 RPC 快照寫回 IDB（覆蓋式） -------- */
export async function idbPersistSnapshot(
  scope: ScopeId,
  snapshot: {
    projects: Record<string, IChatProject>
    threadsById: Record<string, IChatThread>
    threadIdsByProject: Record<string, string[]>
  }
) {
  const projectIds = Object.keys(snapshot.projects)
  await stores.indexes.set(k.idxProjectIds(scope), projectIds)

  // 專案 rows
  await Promise.all(projectIds.map(pid => stores.projects.set(k.projectRow(scope, pid), snapshot.projects[pid])))

  // thread 索引（含 unassigned）
  const tidsMap = snapshot.threadIdsByProject ?? {}
  const idxKeys = Object.keys(tidsMap)
  await Promise.all(idxKeys.map(pid => stores.indexes.set(k.idxThreadIdsByProj(scope, pid), tidsMap[pid])))

  // thread rows
  const threads = snapshot.threadsById ?? {}
  await Promise.all(Object.keys(threads).map(tid => stores.threads.set(k.threadRow(scope, tid), threads[tid])))
}

/** -------- 單筆行為：Row/Index 工具（樂觀更新用） -------- */
export async function idbUpsertProject(scope: ScopeId, row: IChatProject) {
  await stores.projects.set(k.projectRow(scope, row.public_id), row)
  // 確保在 projectIds 索引中
  const ids = (await stores.indexes.get(k.idxProjectIds(scope))) ?? []
  if (!ids.includes(row.public_id)) {
    await stores.indexes.set(k.idxProjectIds(scope), [row.public_id, ...ids])
  }
}

export async function idbSetProjectArchived(scope: ScopeId, pid: string, isArchived: boolean) {
  const row = await stores.projects.get(k.projectRow(scope, pid))
  if (!row) return
  await stores.projects.set(k.projectRow(scope, pid), { ...row, is_archived: isArchived, updated_at: new Date().toISOString() } as any)
}

export async function idbDeleteProject(scope: ScopeId, pid: string) {
  // 從 projectIds 移除
  const ids = (await stores.indexes.get(k.idxProjectIds(scope))) ?? []
  const next = ids.filter((x: string) => x !== pid)
  await stores.indexes.set(k.idxProjectIds(scope), next)
  // 清 project row
  await stores.projects.delete(k.projectRow(scope, pid))
  // 清該 project 的 thread index（但不刪 threads：由呼叫方負責搬家或軟刪）
  await stores.indexes.delete(k.idxThreadIdsByProj(scope, pid))
}

export async function idbUpsertThread(scope: ScopeId, row: IChatThread) {
  await stores.threads.set(k.threadRow(scope, row.public_id), row)
  // 確保它存在於對應索引
  const pid = row.chat_project_public_id ?? UNASSIGNED
  const ids = (await stores.indexes.get(k.idxThreadIdsByProj(scope, pid))) ?? []
  if (!ids.includes(row.public_id)) {
    await stores.indexes.set(k.idxThreadIdsByProj(scope, pid), [row.public_id, ...ids])
  }
}

export async function idbMoveThread(scope: ScopeId, tid: string, fromPid: string | null, toPid: string | null, position = 0) {
  const _from = fromPid ?? UNASSIGNED
  const _to = toPid ?? UNASSIGNED

  if (_from === _to) return

  const fromArr: string[] = (await stores.indexes.get(k.idxThreadIdsByProj(scope, _from))) ?? []
  const toArr: string[] = (await stores.indexes.get(k.idxThreadIdsByProj(scope, _to))) ?? []

  const nextFrom = fromArr.filter(id => id !== tid)
  const i = Math.max(0, Math.min(position, toArr.length))
  const nextTo = [...toArr.slice(0, i), tid, ...toArr.slice(i)]

  await stores.indexes.set(k.idxThreadIdsByProj(scope, _from), nextFrom)
  await stores.indexes.set(k.idxThreadIdsByProj(scope, _to), nextTo)

  // 更新 thread row 的歸屬
  const t = await stores.threads.get(k.threadRow(scope, tid))
  if (t) {
    await stores.threads.set(k.threadRow(scope, tid), { ...t, chat_project_public_id: toPid } as any)
  }
}

export async function idbDeleteThread(scope: ScopeId, tid: string) {
  // 從所有 project 索引移除
  const projectIds: string[] = (await stores.indexes.get(k.idxProjectIds(scope))) ?? []
  const allKeys = [k.idxThreadIdsByProj(scope, UNASSIGNED), ...projectIds.map(pid => k.idxThreadIdsByProj(scope, pid))]
  const arrs = await Promise.all(allKeys.map(key => stores.indexes.get(key)))

  await Promise.all(allKeys.map((key, i) => {
    const list: string[] = (arrs[i] ?? [])
    const next = list.filter(id => id !== tid)
    return stores.indexes.set(key, next)
  }))

  await stores.threads.delete(k.threadRow(scope, tid))
  await stores.messages.delete(k.msgBucket(scope, tid)) // 清訊息桶
}

/** -------- 操作佇列（可選：這版保留接口，先不啟動背景 worker） -------- */
export type PendingOp =
  | { type: 'renameProject'; pid: string; name: string }
  | { type: 'setProjectArchived'; pid: string; flag: boolean }
  | { type: 'deleteProject'; pid: string }
  | { type: 'renameThread'; tid: string; title: string }
  | { type: 'setThreadArchived'; tid: string; flag: boolean }
  | { type: 'deleteThread'; tid: string }
  | { type: 'moveThread'; tid: string; toPid: string | null }

export async function idbEnqueueOp(scope: ScopeId, op: PendingOp) {
  const opId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const opKey = k.opItem(scope, opId)
  const idxKey = k.idxOpIds(scope)
  const ids: string[] = (await stores.indexes.get(idxKey)) ?? []
  await stores.ops.set(opKey, { ...op, createdAt: new Date().toISOString(), status: 'pending' })
  await stores.indexes.set(idxKey, [...ids, opId])
}

export async function idbClearOp(scope: ScopeId, opId: string) {
  await stores.ops.delete(k.opItem(scope, opId))
  const idxKey = k.idxOpIds(scope)
  const ids: string[] = (await stores.indexes.get(idxKey)) ?? []
  await stores.indexes.set(idxKey, ids.filter(x => x !== opId))
}