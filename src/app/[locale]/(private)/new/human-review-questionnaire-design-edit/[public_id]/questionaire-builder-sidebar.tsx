// app/[locale]/(private)/humanreviewdesign/questionaire-builder-sidebar.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  History,
  GitBranch,
  Link2,
  Loader2,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useQuestionnaireStore } from '@/lib/global-store/human-review-questionaire-store'
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableSidebarItem from '@/components/ui/treeview/sortable-sidebar-item'
import MyChannelSelector from "@/components/upload/channel-selector"
import { CachedTranslation } from "@/lib/idb/translation-idb"
import { useTranslationViewModel } from "@/lib/view-models/use-translation-view-model"
import { useQuestionRefContext } from "@/context/question-ref-context"   // 👈 新增
import { useHumanReviewBundleViewModel } from "@/lib/view-models/use-human-review-bundle-view-model"

// ---- 新增：版本列表示意型別（由父層餵資料）----
export type VersionListItem = {
  version_number: number
  created_at: string   // ISO string
  is_latest: boolean
  summary?: string | null
}

interface Props {
  initialTranslation?: CachedTranslation;

  // ---- 新增：版本區塊所需的資料與事件 ----
  versions?: VersionListItem[]                  // 版本清單
  activeVersion?: number | null                 // 當前選取的版本號（latest=目前版）
}

export default function QuestionaireBuilderSideBar({
  initialTranslation,
}: Props) {

  const { locale } = useParams() as { locale: string };
  const pageId = "device_preview_page";
  const { translation, hydrateTranslation } = useTranslationViewModel(pageId, locale);

  useEffect(() => {
    if (initialTranslation) {
      hydrateTranslation(initialTranslation.content, initialTranslation.version);
    }
  }, [initialTranslation]);

  const {
    questions,
    deleteQuestion,
    reorderQuestions,
    updateQuestion,
    editingId,
  } = useQuestionnaireStore()

  const {
    versionsUI,
    loadingVersions,
    onSelectVersion,
  } = useHumanReviewBundleViewModel();

  const questionRefs = useQuestionRefContext();  // 👈 新增

  const [isUserDefinedQuestionaireExpanded, setExpanded] = useState(true)
  const [isGeneralQuestionaireExpanded, setGeneralExpanded] = useState(true)
  const [isMyChannelsExpanded, setMyChannelsExpanded] = useState(true)

  // ---- 新增：Versions 區塊展開狀態 ----
  const [isVersionsExpanded, setVersionsExpanded] = useState(true)

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = questions.findIndex((q) => q.id === active.id)
    const newIndex = questions.findIndex((q) => q.id === over.id)
    reorderQuestions(oldIndex, newIndex)
  }

  const handleRename = (id: string, newLabel: string) => {
    updateQuestion(id, { label: newLabel })
  }

  const scrollToQuestion = (id: string) => {
    const el = questionRefs.current?.[id];
    if (!el) return;

    // 右側 main 的容器，建議你已加上 data-scroll-container
    const container =
      el.closest<HTMLElement>('[data-scroll-container]') ||
      (document.querySelector('[data-scroll-container]') as HTMLElement | null);

    if (!container) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    const offsetTop = eRect.top - cRect.top + container.scrollTop - 16; // 避開 sticky header

    container.scrollTo({ top: offsetTop, behavior: "smooth" });
  };

  // ===== 新增：收納/展開控制 =====
  const EXPANDED_W = 256 // Tailwind w-64
  const COLLAPSED_W = 56 // 窄側欄
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="sticky top-0 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] overflow-hidden z-40 h-[calc(100vh)]"
      aria-expanded={!collapsed}
    >
      {/* 收納時：整個 Sidebar 自己是一層透明可點擊區，點一下展開 */}
      {collapsed && (
        <button
          className="absolute inset-0 z-10 bg-transparent"
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          title="Expand"
        />
      )}

      {/* 頂部：收納/展開按鈕（永遠可見） */}
      <div className="p-2 flex justify-end">
        <button
          onClick={() => setCollapsed(v => !v)}
          className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-[var(--muted)] relative z-20"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* 內容：只在展開時渲染，避免殘影 */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="qb-sidebar-content"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col p-4 pt-0 space-y-4"
          >
            <nav className="flex-1 flex flex-col space-y-2">
              {/* General 設定 */}
              <div className="w-full">
                <div
                  className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                  onClick={() => setGeneralExpanded(!isGeneralQuestionaireExpanded)}
                >
                  <span className="text-sm font-medium">
                    {translation?.review_settings?.translation ?? "Settings"}
                  </span>
                  {isGeneralQuestionaireExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
                <AnimatePresence initial={false}>
                  {isGeneralQuestionaireExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="pl-4 text-sm text-muted-foreground space-y-1"
                    >
                      <div className="cursor-pointer hover:underline" onClick={() => scrollToQuestion("general:form")}>
                        {translation?.deadline_setting?.translation ?? "Deadline"}
                      </div>
                      <div className="cursor-pointer hover:underline" onClick={() => scrollToQuestion("general:form")}>
                        {translation?.visibility_setting?.translation ?? "Visibility"}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* My Channels */}
              <div className="w-full">
                <MyChannelSelector
                  expanded={isMyChannelsExpanded}
                  setExpanded={setMyChannelsExpanded}
                  translations={translation!}
                />
              </div>

              {/* 用戶自訂問卷 */}
              <div className="w-full">
                <div
                  className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                  onClick={() => setExpanded(!isUserDefinedQuestionaireExpanded)}
                >
                  <span className="text-sm font-medium">
                    {translation?.explore_section?.translation ?? "Your Questionnaire"}
                  </span>
                  {isUserDefinedQuestionaireExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {isUserDefinedQuestionaireExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                          {questions.map((q, index) => (
                            <SortableSidebarItem
                              key={q.id}
                              id={q.id}
                              label={q.label}
                              isActive={editingId === q.id}
                              onClick={() => scrollToQuestion(q.id)}
                              onDelete={() => deleteQuestion(q.id)}
                              onRename={(newLabel) => handleRename(q.id, newLabel)}
                              index={index + 1}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Versions 區塊 */}
              <div className="w-full">
                <div
                  className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                  onClick={() => setVersionsExpanded(!isVersionsExpanded)}
                >
                  <span className="text-sm font-medium flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Versions
                  </span>
                  {isVersionsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>

                <AnimatePresence initial={false}>
                  {isVersionsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="pl-1 pr-1"
                    >
                      <div className="space-y-1 max-h-56 overflow-auto pr-1">
                        {loadingVersions && versionsUI.length === 0 && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground px-2 py-1">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading versions...
                          </div>
                        )}

                        {versionsUI.map((v) => {
                          const isActive = v.isActive;
                          const index = versionsUI.indexOf(v);

                          return (
                            <div
                              key={(v.version_number ?? -1) + ":" + v.created_at}
                              className={[
                                "w-full text-left px-2 py-2 rounded cursor-pointer border transition-colors",
                                isActive
                                  ? "bg-[var(--primary)] border-purple-500 border-2"
                                  : "hover:bg-purple-500 border-transparent"
                              ].join(" ")}
                              role="button"
                              tabIndex={0}
                              onClick={() => onSelectVersion(index)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  onSelectVersion(index);
                                }
                              }}
                              title={new Date(v.created_at).toLocaleString()}
                            >
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-[var(--foreground)]">
                                  {v.version_number != null ? `v${v.version_number}` : `unsaved`}
                                  {v.is_latest && (
                                    <span className="ml-1 text-[10px] px-1 py-0.5 rounded text-primary">
                                      latest
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-muted-foreground">{v.dateLabel}</div>
                              </div>

                              {v.summary && (
                                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {v.summary}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {!loadingVersions && versionsUI.length === 0 && (
                          <div className="text-xs text-muted-foreground px-2 py-1">No versions yet.</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            <div className="text-xs text-muted-foreground mt-auto">© 2025 Mr. Click</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}
