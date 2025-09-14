"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Hash, Users, Bot, ChevronsLeft, ChevronsRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useTranslationViewModel } from "@/lib/view-models/use-translation-view-model";
import { CachedTranslation } from "@/lib/idb/translation-idb";
import { useQuestionRefContext } from "@/context/question-ref-context";
import SidebarItem from "@/components/ui/treeview/sidebar-item";

// ✅ 改用 VM 與 store
import { useThumbnailAnalysisReportViewModel } from "@/lib/view-models/thumbnail-analysis-report/thumbnail-analysis-report-view-model"
import { useAnalysisReportStore } from "@/lib/global-store/analysis-report/human-reviews-with-answers-store";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  initialTranslation?: CachedTranslation;
}

export default function AnalysisReportSidebar({ initialTranslation }: Props) {
  const { locale } = useParams() as { locale: string };
  const pageId = "device_preview_page";
  const { translation, hydrateTranslation } = useTranslationViewModel(pageId, locale);

  useEffect(() => {
    if (initialTranslation) {
      hydrateTranslation(initialTranslation.content, initialTranslation.version);
    }
  }, [initialTranslation, hydrateTranslation]);

  // 折疊狀態
  const [openVersions, setOpenVersions] = useState(true);
  const [openQuestionaire, setOpenQuestionaire] = useState(true);
  const [openSummary, setOpenSummary] = useState(true);
  const [openRaters, setOpenRaters] = useState(true);
  const [openAI, setOpenAI] = useState(true);

  // 捲動條樣式顯示與否（保留原有行為）
  const [showScroll, setShowScroll] = useState(false);

  // 收納模式
  const [collapsed, setCollapsed] = useState(false);
  const onToggle = () => setCollapsed((v) => !v);

  const expandedWidth = 280;
  const collapsedWidth = 56;

  const questionRefs = useQuestionRefContext();

  const anchors = useMemo(
    () => ({
      questionnaire: "questionnaire",
      summary: "summary",
      raters: "raters",
      ai: "ai",
    }),
    []
  );

  const scrollToAnchor = (id: string) => {
    questionRefs.current?.[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const scrollToQuestion = (qid: string) => scrollToAnchor(qid);

  // ✅ 從 VM 取資料
  const {
    versionList,
    activeVersionNumber,
    questions,
    answers,
    setActiveVersion,
    hasMultipleVersions
  } = useThumbnailAnalysisReportViewModel();

  // ✅ Rater 清單（目前版本）
  const raters = useMemo(() => {
    // 以 username + created_at 做唯一 key，避免重複
    return (answers ?? []).map((a, i) => ({
      key: `${a?.rater?.username ?? "r"}-${a?.created_at ?? ""}-${i}`,
      name: a?.rater?.username ?? "—",
      avatar: a?.rater?.profile_pic_url ?? "",
    }));
  }, [answers]);

  return (
    <TooltipProvider delayDuration={800}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? collapsedWidth : expandedWidth }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className={[
          "sticky top-0 h-screen border-r bg-[var(--sidebar)] text-[var(--sidebar-foreground)]",
          "flex flex-col overflow-hidden",
        ].join(" ")}
        aria-expanded={!collapsed}
      >
        {/* Header */}
        <div className="px-3 pt-3 pb-2 flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-xl font-semibold opacity-80">
              {translation?.analysis_report?.translation ?? "Analysis Report"}
            </h2>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onToggle}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand" : "Collapse"}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-[var(--muted)]"
              >
                {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{collapsed ? "Expand" : "Collapse"}</TooltipContent>
          </Tooltip>
        </div>

        {/* 內容 */}
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
                  onClick={() => setOpenQuestionaire((v) => !v)}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 opacity-70" />
                    <span className="text-sm font-medium">
                      {translation?.questionnaire_section?.translation ?? "Questionnaire"}
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
                        label={translation?.questionnaires?.translation ?? "Questionnaire"}
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
                  onClick={() => setOpenSummary((v) => !v)}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 opacity-70" />
                    <span className="text-sm font-medium">
                      {translation?.summary_section?.translation ?? "Summary"}
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
                      {questions.map((q: any) => (
                        <SidebarItem key={q.id} id={q.id} label={q.label} onClick={() => scrollToQuestion(q.id)} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Rater Detail 區（補上清單） */}
              <section className="rounded-md">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-[var(--muted)]"
                  onClick={() => setOpenRaters((v) => !v)}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 opacity-70" />
                    <span className="text-sm font-medium">
                      {translation?.rater_detail?.translation ?? "Rater Detail"}
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
                      className="pl-6 pr-2 pt-1 pb-2 space-y-1 text-sm"
                    >
                      {/* 「前往 Rater 區」快捷 */}
                      <SidebarItem
                        id={anchors.raters}
                        label={translation?.rater_list?.translation ?? "Rater List"}
                        onClick={() => scrollToAnchor(anchors.raters)}
                      />

                      {/* 目前版本的 rater 清單 */}
                      <div className="mt-1 space-y-1">
                        {raters.length === 0 ? (
                          <div className="text-xs text-muted-foreground px-2 py-1">
                            {translation?.no_raters?.translation ?? "No raters"}
                          </div>
                        ) : (
                          raters.map((r) => (
                            <button
                              key={r.key}
                              className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--muted)] text-left"
                              onClick={() => scrollToAnchor(anchors.raters)}
                            >
                              {r.avatar ? (
                                <img src={r.avatar} alt={r.name} className="w-4 h-4 rounded-full border object-cover" />
                              ) : (
                                <span className="w-4 h-4 rounded-full border bg-[var(--muted)] inline-flex items-center justify-center text-[9px] text-muted-foreground">?</span>
                              )}
                              <span className="text-xs truncate">{r.name}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* ===== Versions 區 ===== */}
              {hasMultipleVersions && (<section className="rounded-md">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-[var(--muted)]"
                  onClick={() => setOpenVersions((v) => !v)}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 opacity-70" />
                    <span className="text-sm font-medium">
                      {translation?.versions_section?.translation ?? "Versions"}
                    </span>
                  </div>
                  {openVersions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                <AnimatePresence initial={false}>
                  {openVersions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="pl-6 pr-2 pt-1 pb-2 space-y-1 text-sm"
                    >
                      {versionList.length === 0 ? (
                        <div className="text-xs text-muted-foreground px-2 py-1">
                          {translation?.no_versions?.translation ?? "No versions"}
                        </div>
                      ) : (
                        versionList.map((v, idx) => {
                          const isActive = v.versionNumber === activeVersionNumber;
                          return (
                            <button
                              key={`${v.versionNumber ?? "nv"}-${v.createdAt}-${idx}`}
                              onClick={() => setActiveVersion(v.versionNumber)}
                              className={[
                                "w-full text-left px-2 py-1 rounded hover:bg-blue-500 cursor-pointer",
                                isActive ? "bg-[var(--muted)] font-medium" : "text-muted-foreground",
                              ].join(" ")}
                              title={v.display}
                            >
                              {v.display}
                              {v.language ? <span className="ml-1 text-[10px] opacity-70">({v.language})</span> : null}
                            </button>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>)}

              {/* AI Response 區 */}
              <section className="rounded-md">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-[var(--muted)]"
                  onClick={() => setOpenAI((v) => !v)}
                >
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 opacity-70" />
                    <span className="text-sm font-medium">
                      {translation?.ai_response?.translation ?? "AI Response"}
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
                        label={translation?.ai_previous_chat?.translation ?? "Previous Chat Summary"}
                        onClick={() => scrollToAnchor(anchors.ai)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              <div className="px-2 pt-2 text-[10px] text-muted-foreground mt-auto">© 2025 Mr. Click</div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.aside>
    </TooltipProvider>
  );
}
