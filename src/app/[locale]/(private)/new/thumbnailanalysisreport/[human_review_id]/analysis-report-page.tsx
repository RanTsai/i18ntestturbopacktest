"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { QuestionRefContext } from "@/context/question-ref-context";
import WheelToHorizontal from "./wheelToHorizontal";
import QuestionnaireViewerDialog from "./questionaireViewerDialog";
import type { FormSchema } from "@/lib/schema/questionaire-schema";
import type { IHumanAnswersAnalysisReport } from "@/lib/view-models/thumbnail-analysis-report/thumbnail-analysis-report-view-model";

// ✅ 使用你剛整理好的 store 與 VM
import { useAnalysisReportStore } from "@/lib/global-store/analysis-report/human-reviews-with-answers-store";
import { useThumbnailAnalysisReportViewModel } from "@/lib/view-models/thumbnail-analysis-report/thumbnail-analysis-report-view-model";

interface Props {
  report: IHumanAnswersAnalysisReport; // 整包分析報告
  feedbackForm: FormSchema;            // reviewer-feedback（Dialog 用）
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
  "bg-yellow-400",
];

export default function AnalysisReportPage({ report, feedbackForm }: Props) {
  const questionRefs = useRef<Record<string, HTMLElement | null>>({});
  const dialogQuestionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [showScrollbar, setShowScrollbar] = useState(false);
  const pageId = "human_review_design_page";

  // 1) 進頁後把 payload 灌進 store（含 normalize & active 版本挑選）
  const hydrateFromPayload = useAnalysisReportStore((s) => s.hydrateFromPayload);
  useEffect(() => {
    if (report?.data) {
      hydrateFromPayload(report.data);
    }
  }, [report, hydrateFromPayload]);

  // 2) 全部資料都從 VM 取用（聚合也在 VM 裡）
  const {
    questions,
    answers,
    totalRaters,
    kpi,
    imageSummary,
    titleSummary,
    radioSummaries,
    checkboxSummaries,
    perQuestionViewModel,
  } = useThumbnailAnalysisReportViewModel();

  // 3) Rater Dialog 控制：我們改用 index 找原始 answer（含 questionnaire）
  const [selectedRaterIdx, setSelectedRaterIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!showScrollbar) return;
    const t = setTimeout(() => setShowScrollbar(false), 1500);
    return () => clearTimeout(t);
  }, [showScrollbar]);

  return (
    <QuestionRefContext.Provider value={questionRefs}>
      <div className="flex w-full h-screen">
        {/* 主內容（全寬） */}
        <div
          className={`flex-1 overflow-y-auto p-6 space-y-10 ${showScrollbar ? "scrollbar-visible" : "hide-scrollbar"}`}
          onScroll={() => setShowScrollbar(true)}
        >
          {(() => {
            // 需要在 Questions 區排除「縮圖題 / 標題題」
            const imageQuestionId = imageSummary?.questionId;
            const titleQuestionId = titleSummary?.questionId;
            const excludedIds = new Set([imageQuestionId, titleQuestionId]);

            return (
              <>
                {/* ===== Questionnaire（錨點：questionnaire）===== */}
                <section
                  ref={(el) => { questionRefs.current["questionnaire"] = el; }}
                  aria-label="Questionnaires"
                  className="space-y-6"
                >
                  <header className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Questionnaires</h2>
                    <div className="text-xs text-muted-foreground">
                      {totalRaters} raters
                    </div>
                  </header>

                  {/* 縮圖投票（image-select） */}
                  {!!imageSummary?.options?.length && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      {(() => {
                        const maxCount = Math.max(...imageSummary.options.map((o) => o.count ?? 0));
                        return imageSummary.options.slice(0, 4).map((opt) => {
                          const pct = Math.round((opt.ratio ?? 0) * 100);
                          const isTop1 = opt.count === maxCount && maxCount > 0;
                          return (
                            <div key={opt.value} className="relative rounded-lg border overflow-hidden group">
                              {/* VM 已把 image-select 的 label 映射為 imageUrl */}
                              <img
                                src={opt.imageUrl}
                                alt=""
                                className="w-full h-full sm:h-60 xl:h-64 object-cover transition duration-300 group-hover:brightness-25"
                              />
                              {isTop1 && (
                                <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow">
                                  🏆 Top 1
                                </div>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="px-4 py-2 rounded-full bg-black/55 text-white text-lg sm:text-xl font-bold shadow-lg transition-transform duration-300 transform group-hover:scale-150">
                                  {opt.count} vote{opt.count === 1 ? "" : "s"} • {pct}%
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}

                  {/* 標題長條圖（title-select） */}
                  {!!titleSummary?.options?.length && (
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
                  )}

                  {/* Radio / Checkbox 統計 */}
                  {[...(radioSummaries ?? []), ...(checkboxSummaries ?? [])].map((group) => (
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

                {/* ===== 其他題目：橫向排列 ===== */}
                <section aria-label="Questions" className="space-y-10">
                  {perQuestionViewModel
                    .filter((q) => !excludedIds.has(q.questionId))
                    .map((q) => (
                      <div
                        key={q.questionId}
                        ref={(el) => { questionRefs.current[q.questionId] = el; }}
                        className="space-y-3"
                      >
                        <header className="flex items-center gap-2">
                          <h3 className="text-base font-medium">{q.title}</h3>
                          <div className="text-xs text-muted-foreground">{q.answers.length} answers</div>
                        </header>

                        <WheelToHorizontal className="relative">
                          <div className="flex gap-3 min-w-max py-1">
                            {q.answers.map((ans, i) => {
                              const key = `${q.questionId}-${ans.reviewerName ?? "r"}-${ans.createdAt ?? i}`;
                              return (
                                <div key={key} className="flex items-center gap-2">
                                  {/* Avatar */}
                                  <div className="relative group shrink-0">
                                    {ans.reviewerAvatarUrl ? (
                                      <img
                                        src={ans.reviewerAvatarUrl}
                                        alt={ans.reviewerName ?? "rater"}
                                        className="w-8 h-8 rounded-full border object-cover"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full border bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                                        ?
                                      </div>
                                    )}
                                    {(ans.reviewerName || key) && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        {ans.reviewerName ?? "—"}
                                      </div>
                                    )}
                                  </div>

                                  {/* Value */}
                                  <div className="w-64 rounded-md border px-3 py-2 text-sm flex items-center gap-2">
                                    {q.type === "image-select" && ans.display?.imageUrl ? (
                                      <img
                                        src={ans.display.imageUrl}
                                        alt=""
                                        className="w-16 h-16 rounded object-cover border"
                                      />
                                    ) : q.type === "title-select" || q.type === "radio" ? (
                                      <span>{ans.display?.text ?? String(ans.value)}</span>
                                    ) : q.type === "checkbox" ? (
                                      <span>
                                        {Array.isArray(ans.display?.texts)
                                          ? ans.display!.texts!.join(", ")
                                          : Array.isArray(ans.value)
                                            ? (ans.value as string[]).join(", ")
                                            : String(ans.value)}
                                      </span>
                                    ) : (
                                      <span>
                                        {Array.isArray(ans.value)
                                          ? (ans.value as string[]).join(", ")
                                          : String(ans.value)}
                                      </span>
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
            ref={(el) => { questionRefs.current["raters"] = el; }}
            aria-label="Rater Detail"
            className="space-y-3"
          >
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Rater Detail</h2>
              <div className="text-xs text-muted-foreground"></div>
            </header>

            <WheelToHorizontal className="relative">
              <div className="flex items-center gap-4 min-w-max py-1">
                {answers.map((a, i) => {
                  const key = `${a?.rater?.username ?? "r"}-${a?.created_at ?? ""}-${i}`;
                  return (
                    <button
                      key={key}
                      className="flex flex-col items-center gap-1"
                      onClick={() => setSelectedRaterIdx(i)}
                    >
                      <img
                        src={a?.rater?.profile_pic_url ?? "/placeholder-avatar.png"}
                        alt={a?.rater?.username ?? "rater"}
                        className="w-10 h-10 rounded-full border object-cover cursor-pointer"
                      />
                      <div className="h-3 text-[10px] text-muted-foreground max-w-16 truncate">
                        {a?.rater?.username ?? "—"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </WheelToHorizontal>
          </section>

          {/* ===== AI Response（錨點：ai）===== */}
          <section
            ref={(el) => { questionRefs.current["ai"] = el; }}
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

      {/* Dialog：丟回「原始 answers[i]」（含 questionnaire 可渲染） */}
      <QuestionnaireViewerDialog
        pageId={pageId}
        formData={feedbackForm}
        questionRefs={dialogQuestionRefs}
        humanReview={selectedRaterIdx != null ? (answers[selectedRaterIdx] as any) : null}
        open={selectedRaterIdx != null}
        onOpenChange={(open) => {
          if (!open) setSelectedRaterIdx(null);
        }}
      />
    </QuestionRefContext.Provider>
  );
}
