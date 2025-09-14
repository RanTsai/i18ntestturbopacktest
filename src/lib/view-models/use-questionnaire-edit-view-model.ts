// /lib/view-models/use-questionnaire-edit-view-model.ts
"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { useQuestionnaireStore } from "@/lib/global-store/human-review-questionaire-store"
import { Question } from "@/lib/schema/questionaire-schema"
import { createIDBStore } from "@/lib/idb/local-idb"

/**
 * 使用泛型 IDB 來存問題陣列
 * - dbName: questionaire-idb
 * - storeName: questionnaire-store
 */
const questionnaireIDB = createIDBStore<Question[]>("questionnaire-store", "questionaire-idb")

/** 預設最大歷史紀錄長度 */
const DEFAULT_HISTORY_LIMIT = 30

/** 深拷貝（優先使用 structuredClone） */
function deepClone<T>(obj: T): T {
  if (typeof structuredClone === "function") return structuredClone(obj)
  return JSON.parse(JSON.stringify(obj))
}

/** 比對是否相等（簡單版：JSON 字串） */
function isEqual(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return a === b
  }
}

type InitOptions = {
  /** 最大 Undo 歷史（預設 30） */
  historyLimit?: number
  /** 自動保存到 IDB（預設 true） */
  autoSaveToIDB?: boolean
  /** 目前的 publicId（若在「編輯既有項目」模式下） */
  publicId?: string | null
  /** 正在編輯的版本（未傳表示 latest / draft） */
  version?: number | "latest" | null
}

export function useQuestionnaireEditorViewModel(
  pageId: string,
  opts: InitOptions = {}
) {
  const historyLimit = opts.historyLimit ?? DEFAULT_HISTORY_LIMIT
  const autoSaveToIDB = opts.autoSaveToIDB ?? true
  const publicId = opts.publicId ?? null
  const version = opts.version ?? "latest"

  // 🔑 組合 IDB 儲存 key：同頁（pageId）+（選填）publicId + 版本（latest / number）
  const idbKey = useMemo(() => {
    const pid = pageId || "page"
    const pid2 = publicId ? `${pid}:${publicId}` : pid
    const v = version ?? "latest"
    return `${pid2}:${v}`
  }, [pageId, publicId, version])

  // 連接全域 store（只存「現在的問題狀態」）
  const {
    questions,
    setQuestions,
    editingId,
    setEditingId,
  } = useQuestionnaireStore()

  // Undo / Redo stack
  const undoStack = useRef<Question[][]>([])
  const redoStack = useRef<Question[][]>([])

  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // 用以防止初始化／載入時誤觸 pushToHistory
  const isBootstrapping = useRef<boolean>(false)

  // Debounce 計時器（用 number 型別避免 Next.js 客端的 NodeJS.Timeout 警告）
  const debounceTimer = useRef<number | null>(null)

  /** 將「當前狀態」推入 undo；同時清空 redo；限制長度 */
  const pushToHistory = useCallback((prevSnapshot: Question[]) => {
    if (isBootstrapping.current) return
    undoStack.current.push(deepClone(prevSnapshot))
    if (undoStack.current.length > historyLimit) undoStack.current.shift()
    // 任何新操作都清空 redo
    redoStack.current = []
    setCanUndo(undoStack.current.length > 0)
    setCanRedo(false)
  }, [historyLimit])

  /** Undo */
  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return
    const prev = undoStack.current.pop()!
    // push 當前狀態到 redo
    redoStack.current.push(deepClone(questions))
    setQuestions(prev)
    setCanUndo(undoStack.current.length > 0)
    setCanRedo(redoStack.current.length > 0)
  }, [questions, setQuestions])

  /** Redo */
  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return
    const next = redoStack.current.pop()!
    // push 當前狀態到 undo
    undoStack.current.push(deepClone(questions))
    setQuestions(next)
    setCanUndo(undoStack.current.length > 0)
    setCanRedo(redoStack.current.length > 0)
  }, [questions, setQuestions])

  /** Debounce 存 IDB */
  const debounceSaveToIDB = useCallback((next: Question[]) => {
    if (!autoSaveToIDB) return
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current)
    debounceTimer.current = window.setTimeout(() => {
      questionnaireIDB.set(idbKey, next)
    }, 300)
  }, [autoSaveToIDB, idbKey])

  /**
   * 內部統一寫入入口：
   * - 只有當「確實變更」時才推歷史
   * - 寫入全域 store
   * - Debounce 存到 IDB
   */
  const writeQuestions = useCallback((next: Question[], pushHistory = true) => {
    // 避免「相同內容」造成沒必要的歷史與重渲染
    if (isEqual(next, questions)) return
    if (pushHistory) pushToHistory(questions)
    setQuestions(next)
    debounceSaveToIDB(next)
  }, [questions, pushToHistory, setQuestions, debounceSaveToIDB])

  // === 包裝 mutations ===
  const setAll = useCallback((next: Question[]) => {
    writeQuestions(deepClone(next))
  }, [writeQuestions])

  const addQuestion = useCallback((q: Question) => {
    const next = [...questions, q]
    writeQuestions(next)
  }, [questions, writeQuestions])

  const updateQuestion = useCallback((id: string, partial: Partial<Question>) => {
    const next = questions.map(q => q.id === id ? { ...q, ...partial } : q)
    writeQuestions(next)
  }, [questions, writeQuestions])

  const deleteQuestion = useCallback((id: string) => {
    const next = questions.filter(q => q.id !== id)
    writeQuestions(next)
  }, [questions, writeQuestions])

  const reorderQuestions = useCallback((from: number, to: number) => {
    if (from === to) return
    const next = [...questions]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    writeQuestions(next)
  }, [questions, writeQuestions])

  // === 初始化/載入 ===

  /**
   * 手動保存目前 questions 到 IDB（立即，不經 debounce）
   */
  const saveToIDB = useCallback(async () => {
    await questionnaireIDB.set(idbKey, questions)
  }, [idbKey, questions])

  /**
   * 讀取 IDB（若有資料就覆蓋當前狀態並重置歷史）
   */
  const loadFromIDB = useCallback(async () => {
    const saved = await questionnaireIDB.get(idbKey)
    if (saved) {
      isBootstrapping.current = true
      setQuestions(saved)
      // 重置歷史
      undoStack.current = []
      redoStack.current = []
      setCanUndo(false)
      setCanRedo(false)
      isBootstrapping.current = false
    }
  }, [idbKey, setQuestions])

  /**
   * 清除此頁的本地快取（IDB）
   */
  const clearLocal = useCallback(async () => {
    await questionnaireIDB.delete(idbKey)
  }, [idbKey])

  /**
   * 以「伺服器回來的版本資料」初始化（編輯模式／開舊版）
   * - 不推入歷史
   * - 會清空 Undo/Redo
   */
  const initFromServer = useCallback((initialQuestions: Question[]) => {
    isBootstrapping.current = true
    setQuestions(deepClone(initialQuestions))
    undoStack.current = []
    redoStack.current = []
    setCanUndo(false)
    setCanRedo(false)
    // 同步一份到 IDB（避免 reload 後遺失）
    if (autoSaveToIDB) {
      questionnaireIDB.set(idbKey, initialQuestions)
    }
    isBootstrapping.current = false
  }, [autoSaveToIDB, idbKey, setQuestions])

  /**
   * 切換到另一個版本時，可以先呼叫 resetHistory() 清空歷史
   * 再用 initFromServer() 寫入新內容
   */
  const resetHistory = useCallback(() => {
    undoStack.current = []
    redoStack.current = []
    setCanUndo(false)
    setCanRedo(false)
  }, [])

  return {
    // 狀態
    questions,
    editingId,
    canUndo,
    canRedo,

    // 參數觀測（給除錯/診斷）
    idbKey,
    publicId,
    version,

    // 操作（mutations）
    setEditingId,
    setQuestions: setAll,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,

    // 控制
    undo,
    redo,
    resetHistory,

    // 初始化/載入
    initFromServer,
    saveToIDB,
    loadFromIDB,
    clearLocal,
  }
}
