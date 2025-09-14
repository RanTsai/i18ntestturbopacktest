"use client"

import React, { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronRight, Hash, Users, Bot, ChevronsLeft, ChevronsRight, Menu } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useParams } from "next/navigation"
import useTranslationStore from "@/lib/global-store/use-translation-store"
import { PageTranslations } from "@/i18n/interface"
import { useQuestionRefContext } from "@/context/question-ref-context"
import SidebarItem from "@/components/ui/treeview/sidebar-item"
import { Question } from "@/lib/schema/questionaire-schema"

interface Props {
  pageId: string
  questions: Question[]
  fallbackTranslations?: PageTranslations
  onToggle?: () => void              // 收納/展開觸發
  collapsed?: boolean                // ✅ 新增：由父層控制是否收納
}

export default function AnalysisReportSidebar({
  pageId,
  questions,
  fallbackTranslations,
  onToggle,
  collapsed = false,                 // 預設展開
}: Props) {
  const { getTranslation, setTranslation } = useTranslationStore()
  const [translations, setTranslations] = useState<PageTranslations | null>(null)
  const [openQuestionaire, setOpenQuestionaire] = useState(true)
  const [openSummary, setOpenSummary] = useState(true)
  const [openRaters, setOpenRaters] = useState(true)
  const [openAI, setOpenAI] = useState(true)
  const { locale } = useParams() as { locale: string }
  const questionRefs = useQuestionRefContext()
  const [showScroll, setShowScroll] = useState(false)

  useEffect(() => {
    const cached = getTranslation(pageId, locale)
    if (cached) {
      setTranslations(cached)
    } else if (fallbackTranslations) {
      setTranslation(pageId, locale, fallbackTranslations)
      setTranslations(fallbackTranslations)
    }
  }, [locale, fallbackTranslations, getTranslation, setTranslation, pageId])

  const anchors = useMemo(() => ({
    questionnaire: "questionnaire",
    summary: "summary",
    raters: "raters",
    ai: "ai",
  }), [])

  const scrollToAnchor = (id: string) => {
    questionRefs.current?.[id]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }
  const scrollToQuestion = (qid: string) => scrollToAnchor(qid)

  return (
    <aside
      className={[
        // ✅ 確保絕對定位子元素以 aside 為參考
        "sticky top-0 h-screen border-r bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col overflow-hidden",
        collapsed ? "w-14" : "w-[280px]",
      ].join(" ")}
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-xl font-semibold opacity-80">
            {translations?.analysis_report?.translation ?? "Analysis Report"}
          </h2>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
          // ⬇️ 這裡不用超高 z，避免擋住 overlay；保持預設或 z-30 即可
          className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-[var(--muted)]"
        >
          {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* 內容：展開才渲染，避免殘影與可聚焦元素留存 */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.nav
            key="sidebar-content"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className={[
              "flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-2 transition-[padding-right] duration-150 ease-in-out",
              showScroll ? "scrollbar-visible pr-2" : "hide-scrollbar pr-[calc(0.5rem+8px)]",
            ].join(" ")}
            onWheel={() => setShowScroll(true)}
            onScroll={() => setShowScroll(true)}
          >
            {/* Questionnaire 區 */}
            <section className="rounded-md">
              <button
                type="button"
                className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-[var(--muted)]"
                onClick={() => setOpenQuestionaire(v => !v)}
              >
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 opacity-70" />
                  <span className="text-sm font-medium">
                    {translations?.questionnaire_section?.translation ?? "Questionnaire"}
                  </span>
                </div>
                {openQuestionaire ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <AnimatePresence initial={false}>
                {openQuestionaire && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="pl-6 pr-2 pt-1 pb-2 space-y-1 text-sm text-muted-foreground"
                  >
                    <SidebarItem
                      id={anchors.questionnaire}
                      label={translations?.questionnaires?.translation ?? "Questionnaire"}
                      onClick={() => scrollToAnchor(anchors.questionnaire)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Summary 區 */}
            <section className="rounded-md">
              <button
                type="button"
                className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-[var(--muted)]"
                onClick={() => setOpenSummary(v => !v)}
              >
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 opacity-70" />
                  <span className="text-sm font-medium">
                    {translations?.summary_section?.translation ?? "Summary"}
                  </span>
                </div>
                {openSummary ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <AnimatePresence initial={false}>
                {openSummary && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="pl-6 pr-2 pt-1 pb-2"
                  >
                    {questions.map((q) => (
                      <SidebarItem key={q.id} id={q.id} label={q.label} onClick={() => scrollToQuestion(q.id)} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Rater Detail 區 */}
            <section className="rounded-md">
              <button
                type="button"
                className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-[var(--muted)]"
                onClick={() => setOpenRaters(v => !v)}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 opacity-70" />
                  <span className="text-sm font-medium">
                    {translations?.rater_detail?.translation ?? "Rater Detail"}
                  </span>
                </div>
                {openRaters ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              <AnimatePresence initial={false}>
                {openRaters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="pl-6 pr-2 pt-1 pb-2 space-y-1 text-sm text-muted-foreground"
                  >
                    <SidebarItem
                      id={anchors.raters}
                      label={translations?.rater_list?.translation ?? "Rater List"}
                      onClick={() => scrollToAnchor(anchors.raters)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* AI Response 區 */}
            <section className="rounded-md">
              <button
                type="button"
                className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-[var(--muted)]"
                onClick={() => setOpenAI(v => !v)}
              >
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 opacity-70" />
                  <span className="text-sm font-medium">
                    {translations?.ai_response?.translation ?? "AI Response"}
                  </span>
                </div>
                {openAI ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              <AnimatePresence initial={false}>
                {openAI && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="pl-6 pr-2 pt-1 pb-2 space-y-1 text-sm text-muted-foreground"
                  >
                    <SidebarItem
                      id={anchors.ai}
                      label={translations?.ai_previous_chat?.translation ?? "Previous Chat Summary"}
                      onClick={() => scrollToAnchor(anchors.ai)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </motion.nav>
        )}
      </AnimatePresence>

      {!collapsed && (
        <div className="px-4 py-3 text-[10px] text-muted-foreground mt-auto">
          © 2025 Mr. Click
        </div>
      )}

      {/* ✅ 收納時：加一層覆蓋整個側欄的透明層（可點擊展開）+ 上方的 Icon */}
      {collapsed && (
        <>
          {/* 透明層：覆蓋整個 aside；z-index 一定要比內部任何元素都高 */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={onToggle}
            // ⬇️ 用很高的 z，確保蓋過 header/nav/footer 裡的任何 z 值
            className="absolute inset-0 z-[100] bg-transparent cursor-pointer"
            title="" // 避免原生 title
          />

          {/* 展開 ICON：放在透明層之上，也能點；不會擋到透明層以外區域 */}
          <button
            type="button"
            aria-label="Expand sidebar"
            onClick={onToggle}
            className="absolute z-[110] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-2 hover:bg-[var(--muted)]"
          >
            {/* 換你偏好的圖示也可以，例如 <Menu /> */}
            <ChevronsRight className="h-5 w-5" />
          </button>
        </>
      )}
    </aside>
  )
}
