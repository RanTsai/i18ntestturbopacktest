// app/[locale]/(private)/humanreviewdesign/questionaire-builder-sidebar.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useQuestionRefContext } from "@/context/question-ref-context"
import SidebarItem from "@/components/ui/treeview/sidebar-item"
import { CachedTranslation } from "@/lib/idb/translation-idb"
import { useTranslationViewModel } from "@/lib/view-models/use-translation-view-model"
import { useQuestionnaireStore } from "@/lib/global-store/human-review-questionaire-store"

interface Props {
  initialTranslation?: CachedTranslation;
}

export default function HumanReviewSideBar({
  initialTranslation,
}: Props) {

  const { locale } = useParams() as { locale: string };
  const pageId = 'human_review_design_page';
  const { translation, hydrateTranslation } = useTranslationViewModel(pageId, locale);

  useEffect(() => {
    if (initialTranslation) {
      hydrateTranslation(initialTranslation.content, initialTranslation.version);
    }
  }, [initialTranslation]);

  const [isUserDefinedQuestionaireExpanded, setExpanded] = useState(true)
  const [isGeneralQuestionaireExpanded, setGeneralExpanded] = useState(true)
  const { questions } = useQuestionnaireStore();
  const questionRefs = useQuestionRefContext();

  console.log("side bar questions", questions);

  const scrollToQuestion = (id: string) => {
    questionRefs.current?.[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  // 收納 / 展開
  const EXPANDED_W = 256 // w-64
  const COLLAPSED_W = 56 // 窄欄
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="sticky top-0 h-screen bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] overflow-hidden z-40"
      aria-expanded={!collapsed}
    >
      {/* 收納時：整個 Sidebar 區域可點擊展開 */}
      {collapsed && (
        <button
          className="absolute inset-0 z-10 bg-transparent"
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          title="Expand"
        />
      )}

      {/* 頂部切換鈕（永遠可見） */}
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

      {/* 展開時才渲染內容，避免殘影 */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="hr-sidebar-content"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col p-4 pt-0 space-y-4"
          >
            <nav className="flex-1 flex flex-col space-y-2">
              {/* General 設定區塊 */}
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
                      <div
                        className="cursor-pointer hover:underline"
                        onClick={() => scrollToQuestion("general:form")}
                      >
                        {translation?.deadline_setting?.translation ?? "Deadline"}
                      </div>
                      <div
                        className="cursor-pointer hover:underline"
                        onClick={() => scrollToQuestion("general:form")}
                      >
                        {translation?.visibility_setting?.translation ?? "Visibility"}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 問卷區塊 */}
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
                      {questions.map((q) => (
                        <SidebarItem
                          key={q.id}
                          id={q.id}
                          label={q.label}
                          onClick={() => scrollToQuestion(q.id)}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            <div className="text-xs text-muted-foreground mt-auto">
              © 2025 Mr. Click
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}
