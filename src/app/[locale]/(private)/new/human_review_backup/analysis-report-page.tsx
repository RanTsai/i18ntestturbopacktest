"use client"

import React, { useEffect, useMemo, useRef, useState } from "react";
import { QuestionRefContext } from "@/context/question-ref-context";
import type { Question } from "@/lib/schema/questionaire-schema";
import type { IHumanAnswerWithProfile, } from "@/lib/schema/human-review-schema";
import AnalysisReportSidebar from "./analysis-report-sidebar";
import { motion, AnimatePresence } from "framer-motion";
import WheelToHorizontal from "./wheelToHorizontal";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import QuestionnaireViewerDialog from "./questionaireViewerDialog";
import { FormSchema } from "@/lib/schema/questionaire-schema";


// ⬇️ 聚合邏輯
import { buildSummaryFromAnswers, buildAnswersPerQuestion } from "@/lib/analysis-report/thumbnail-human-answer/aggregate";

interface Props {
  questions: Question[];
  humanAnswers: IHumanAnswerWithProfile[]; // ⬅️ 新增：多位 rater 的作答
  formData: FormSchema;
}

const brightColors = [
  "bg-green-500",
  "bg-teal-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-400"
];

export default function AnalysisReportPage({ questions, humanAnswers, formData }: Props) {
  const questionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // 控制收納/展開
  const pageId = "human_review_design_page";
  const [selectedRater, setSelectedRater] = useState<IHumanAnswerWithProfile | null>(null);
  const dialogQuestionRefs = useRef<Record<string, HTMLElement | null>>({}); // ✅ Dialog 專用

  useEffect(() => {
    if (!showScrollbar) return;
    const t = setTimeout(() => setShowScrollbar(false), 1500);
    return () => clearTimeout(t);
  }, [showScrollbar]);

  

  // ⬇️ 用聚合函式產生 ViewModel
  const summaryViewModel = useMemo(
    () => buildSummaryFromAnswers(questions, humanAnswers),
    [questions, humanAnswers]
  );
  const perQuestionViewModel = useMemo(
    () => buildAnswersPerQuestion(questions, humanAnswers),
    [questions, humanAnswers]
  );

  // 在 component 內，加這段 useMemo（summaryViewModel/perQuestionViewModel 之後都可）
  const raterMap = useMemo(() => {
    const m = new Map<string, { username?: string | null; profile_pic_url?: string | null }>();
    // 注意：你的 GetHumanAnswerWithHumanReviewId 已 JOIN 回傳 rater 欄位
    for (const a of humanAnswers as Array<IHumanAnswerWithProfile & { rater?: { username?: string | null; profile_pic_url?: string | null } | null }>) {
      if (a.reviewer_clerk_id) {
        m.set(a.reviewer_clerk_id, {
          username: a.rater?.username ?? null,
          profile_pic_url: a.rater?.profile_pic_url ?? null,
        });
      }
    }
    return m;
  }, [humanAnswers]);


  return (
    <QuestionRefContext.Provider value={questionRefs}>
      <div className="flex w-full h-screen">
        {/* Sidebar 寬度動畫；收納時保留窄導軌 */}
        <motion.div
          className="relative h-screen border-r flex-shrink-0"
          animate={{ width: sidebarOpen ? 280 : 48 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {sidebarOpen ? (
              <motion.div
                key="sidebar-open"
                className="h-full"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                <AnalysisReportSidebar
                  pageId={pageId}
                  questions={questions}
                  onToggle={() => setSidebarOpen(false)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="sidebar-collapsed"
                className="h-full flex items-start justify-center pt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  aria-label="Open sidebar"
                  className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
                  onClick={() => setSidebarOpen(true)}
                >
                  ☰
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Main Content */}
        <div
          className={`flex-1 overflow-y-auto p-6 space-y-10 ${showScrollbar ? "scrollbar-visible" : "hide-scrollbar"}`}
          onScroll={() => setShowScrollbar(true)}
        >
          {(() => {
            const imageSummary = summaryViewModel.find(q => q.type === "image-select");
            const titleSummary = summaryViewModel.find(q => q.type === "title-select");
            const radioSummaries = summaryViewModel.filter(q => q.type === "radio");
            const checkboxSummaries = summaryViewModel.filter(q => q.type === "checkbox");

            const imageQuestionId = imageSummary?.questionId;
            const titleQuestionId = titleSummary?.questionId;
            const excludedIds = new Set([imageQuestionId, titleQuestionId]);

            return (
              <>
                {/* ===== Questionnaire（錨點：questionnaire）===== */}
                <section
                  ref={(el) => { questionRefs.current["questionnaire"] = el }}
                  aria-label="Questionnaires"
                  className="space-y-6"
                >
                  <header className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Questionnaires</h2>
                    <div className="text-xs text-muted-foreground">{humanAnswers.length} raters</div>
                  </header>

                  {/* 1) 縮圖投票：最多 4 張，置中大字顯示票數＋百分比，Top 1 標章 */}
                  {imageSummary?.options?.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      {(() => {
                        // 找出最高票的 option
                        const maxCount = Math.max(...imageSummary.options.map(o => o.count ?? 0));

                        return imageSummary.options.slice(0, 4).map(opt => {
                          const pct = Math.round((opt.ratio ?? 0) * 100);
                          const isTop1 = opt.count === maxCount && maxCount > 0;

                          return (
                            <div
                              key={opt.value}
                              className="relative rounded-lg border overflow-hidden group"
                            >
                              <img
                                src={opt.imageUrl}
                                alt=""
                                className="w-full h-full sm:h-60 xl:h-64 object-cover transition duration-300 group-hover:brightness-25"
                              />

                              {/* Top 1 標章 */}
                              {isTop1 && (
                                <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow">
                                  🏆 Top 1
                                </div>
                              )}

                              {/* 中央覆蓋：票數＋百分比（膠囊） */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div
                                  className="px-4 py-2 rounded-full bg-black/55 text-white text-lg sm:text-xl font-bold shadow-lg
                 transition-transform duration-300 transform group-hover:scale-150"
                                >
                                  {opt.count} vote{opt.count === 1 ? "" : "s"} • {pct}%
                                </div>
                              </div>
                            </div>

                          );
                        });
                      })()}
                    </div>
                  ) : null}


                  {/* // 標題題目長條統計 */}
                  {titleSummary?.options?.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {titleSummary.options.map((opt, idx) => (
                        <div key={opt.value} className="rounded border p-3">
                          <div className="text-sm mb-2">{opt.label ?? opt.value}</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
                              <div
                                className={`h-full ${brightColors[idx % brightColors.length]}`}
                                style={{ width: `${Math.round(opt.ratio * 100)}%` }}
                              />
                            </div>
                            <div className="text-xs tabular-nums w-24 text-right">
                              {opt.count} ({Math.round(opt.ratio * 100)}%)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* // Radio / Checkbox 統計 */}
                  {[...radioSummaries, ...checkboxSummaries].map(group => (
                    <div key={group.questionId} className="rounded-md border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">{group.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {group.totalAnswers} answered • {group.skippedCount} skipped
                        </div>
                      </div>
                      <div className="space-y-2">
                        {group.options?.map((opt, idx) => (
                          <div key={opt.value} className="flex items-center gap-2">
                            <span className="text-xs">{opt.label ?? opt.value}</span>
                            <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
                              <div
                                className={`h-full ${brightColors[idx % brightColors.length]}`}
                                style={{ width: `${Math.round(opt.ratio * 100)}%` }}
                              />
                            </div>
                            <div className="text-xs tabular-nums w-20 text-right">
                              {opt.count} ({Math.round(opt.ratio * 100)}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>

                {/* ===== 其餘題目：橫向排列、隱藏捲軸、無時間戳 ===== */}
                <section aria-label="Questions" className="space-y-10">
                  {perQuestionViewModel
                    .filter(q => !excludedIds.has(q.questionId))
                    .map(q => (
                      <div
                        key={q.questionId}
                        ref={(el) => { questionRefs.current[q.questionId] = el }}
                        className="space-y-3"
                      >
                        <header className="flex items-center gap-2">
                          <h3 className="text-base font-medium">{q.title}</h3>
                          <div className="text-xs text-muted-foreground">{q.answers.length} answers</div>
                        </header>

                        <WheelToHorizontal className="relative">
                          <div className="flex gap-3 min-w-max py-1">
                            {q.answers.map((ans, i) => {
                              const rater = ans.reviewerId ? raterMap.get(ans.reviewerId) : undefined;
                              return (
                                // 每筆答案 = [Avatar] + [ValueCard] 兩個並列元素
                                <div key={`${q.questionId}-${i}`} className="flex items-center gap-2">
                                  {/* Avatar（獨立在外） */}
                                  <div className="relative group shrink-0">
                                    {rater?.profile_pic_url ? (
                                      <img
                                        src={rater.profile_pic_url}
                                        alt={rater.username ?? ans.reviewerId ?? "rater"}
                                        className="w-8 h-8 rounded-full border object-cover"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full border bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                                        ?
                                      </div>
                                    )}
                                    {(rater?.username || ans.reviewerId) && (
                                      <div
                                        className="absolute inset-0 flex items-center justify-center 
                 bg-black/70 text-white text-xs px-2 py-1 rounded-full 
                 opacity-0 group-hover:opacity-100 transition-opacity 
                 whitespace-nowrap pointer-events-none z-10"
                                      >
                                        {rater?.username ?? ans.reviewerId}
                                      </div>
                                    )}
                                  </div>


                                  {/* ValueCard（只放答案，不含頭像） */}
                                  <div className="w-64 rounded-md border px-3 py-2 text-sm flex items-center gap-2">
                                    {q.type === "image-select" && ans.display?.imageUrl ? (
                                      <img src={ans.display.imageUrl} alt="" className="w-16 h-16 rounded object-cover border" />
                                    ) : q.type === "title-select" || q.type === "radio" ? (
                                      <span>{ans.display?.text ?? String(ans.value)}</span>
                                    ) : q.type === "checkbox" ? (
                                      <span>
                                        {Array.isArray(ans.display?.texts)
                                          ? ans.display!.texts!.join(", ")
                                          : Array.isArray(ans.value)
                                            ? ans.value.join(", ")
                                            : String(ans.value)}
                                      </span>
                                    ) : (
                                      <span>{Array.isArray(ans.value) ? ans.value.join(", ") : String(ans.value)}</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </WheelToHorizontal>


                      </div>
                    ))}
                </section>
              </>
            );
          })()}

          {/* ===== Rater Detail（錨點：raters）===== */}
          <section
            ref={(el) => { questionRefs.current["raters"] = el }}
            aria-label="Rater Detail"
            className="space-y-3"
          >
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Rater Detail</h2>
              <div className="text-xs text-muted-foreground"></div>
            </header>
            <WheelToHorizontal className="relative">
              <div className="flex items-center gap-4 min-w-max py-1">
                {humanAnswers.map((a, i) => (
                  <button
                    key={a.human_answer_id ?? i}
                    className="flex flex-col items-center gap-1"
                    onClick={() => setSelectedRater(a)} // ← 你的既有元件
                  >
                    <img
                      src={a.rater?.profile_pic_url ?? "/placeholder-avatar.png"}
                      alt={a.rater?.username ?? a.reviewer_clerk_id ?? "rater"}
                      className="w-10 h-10 rounded-full border object-cover cursor-pointer"
                    />
                    <div className="h-3 text-[10px] text-muted-foreground max-w-16 truncate">
                      {a.rater?.username ?? a.reviewer_clerk_id ?? "—"}
                    </div>
                  </button>
                ))}
              </div>
            </WheelToHorizontal>
          </section>

          {/* ===== AI Response（錨點：ai）===== */}
          <section
            ref={(el) => { questionRefs.current["ai"] = el }}
            aria-label="AI Response"
            className="space-y-3"
          >
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">AI Response</h2>
              <div className="text-xs text-muted-foreground"></div>
            </header>
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground leading-6">
              AI summary placeholder. Replace with previous chat summary.
            </div>
          </section>

          {/* ===== Footer ===== */}
          <footer className="sticky bottom-0 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 border-t">
            <div className="flex items-center justify-end gap-2">
              <button className="px-3 py-1.5 text-sm rounded-md border">Export</button>
              <button className="px-3 py-1.5 text-sm rounded-md border">Complete</button>
              <button className="px-3 py-1.5 text-sm rounded-md border">New Round</button>
              <button className="px-3 py-1.5 text-sm rounded-md border">Extend</button>
            </div>
          </footer>
        </div>


      </div>
      <QuestionnaireViewerDialog
        pageId={pageId}
        formData={formData}
        questionRefs={dialogQuestionRefs}
        humanReview={selectedRater}
        open={!!selectedRater}
        onOpenChange={(open) => {
          if (!open) setSelectedRater(null)
        }}
      />


    </QuestionRefContext.Provider>
  );
}
