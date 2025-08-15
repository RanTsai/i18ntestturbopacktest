// app/[locale]/(private)/humanreviewdesign/questionaire-builder-sidebar.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useQuestionnaireStore } from '@/lib/global-store/human-review-questionaire-store'
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableSidebarItem from '@/components/ui/treeview/sortable-sidebar-item'
import { UseLoadChannels } from "@/hooks/loading-user-data/load-channels"
import useTranslationStore from "@/lib/global-store/use-translation-store"
import { PageTranslations } from "@/i18n/interface"
import MyChannelSelector from "@/components/upload/channel-selector"
import UserChannelStore from "@/lib/global-store/user-channel-store"
import useReviewFilterStore from "@/lib/global-store/human-review-filter-store"

interface Props {
  pageId: string;
  setShowSidebar?: (open: boolean) => void;
  fallbackTranslations?: PageTranslations;
}

export default function QuestionaireBuilderSideBar({
  pageId,
  setShowSidebar,
  fallbackTranslations,
}: Props) {
  const {
    questions,
    deleteQuestion,
    reorderQuestions,
    updateQuestion,
    editingId,
  } = useQuestionnaireStore()

  const {
    userChannels,
    setSelectedChannel,
  } = UserChannelStore()

  const {
    selectedMyChannelId,
    setMyChannel,
  } = useReviewFilterStore()

  const { getTranslation, setTranslation } = useTranslationStore()
  const [translations, setTranslations] = useState<PageTranslations | null>(null)

  const [isUserDefinedQuestionaireExpanded, setExpanded] = useState(true)
  const [isGeneralQuestionaireExpanded, setGeneralExpanded] = useState(true)
  const [isMyChannelsExpanded, setMyChannelsExpanded] = useState(true)

  const { locale } = useParams() as { locale: string }
  const sensors = useSensors(useSensor(PointerSensor))

  UseLoadChannels()

  useEffect(() => {
    const cached = getTranslation(pageId, locale)
    if (cached) {
      setTranslations(cached)
    } else if (fallbackTranslations) {
      setTranslation(pageId, locale, fallbackTranslations)
      setTranslations(fallbackTranslations)
    }
  }, [locale, fallbackTranslations])

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
    // 若你有 ref context，可在此捲動到對應問題
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

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
                    {translations?.review_settings?.translation ?? "Settings"}
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
                        {translations?.deadline_setting?.translation ?? "Deadline"}
                      </div>
                      <div className="cursor-pointer hover:underline" onClick={() => scrollToQuestion("general:form")}>
                        {translations?.visibility_setting?.translation ?? "Visibility"}
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
                  userChannels={userChannels ?? []}
                  setSelectedChannel={setSelectedChannel}
                  pageId={pageId}
                  selectedId={selectedMyChannelId ? String(selectedMyChannelId) : null}
                  setSelectedId={(id: string | null) => setMyChannel(id ? Number(id) : null)}
                  setMyChannel={setMyChannel}
                />
              </div>

              {/* 用戶自訂問卷 */}
              <div className="w-full">
                <div
                  className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                  onClick={() => setExpanded(!isUserDefinedQuestionaireExpanded)}
                >
                  <span className="text-sm font-medium">
                    {translations?.explore_section?.translation ?? "Your Questionnaire"}
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
                          {questions.map((q) => (
                            <SortableSidebarItem
                              key={q.id}
                              id={q.id}
                              label={q.label}
                              isActive={editingId === q.id}
                              onClick={() => scrollToQuestion(q.id)}
                              onDelete={() => deleteQuestion(q.id)}
                              onRename={(newLabel) => handleRename(q.id, newLabel)}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
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
