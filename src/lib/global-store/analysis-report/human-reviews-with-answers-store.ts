// /lib/global-store/analysis-report/human-reviews-with-answers-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
// 只做 type import，避免把 VM 檔打進 client bundle
import type { IHumanAnswersAnalysisReport } from "@/lib/view-models/thumbnail-analysis-report/thumbnail-analysis-report-view-model";

// ===== helpers =====
function parseMaybeJson<T>(raw: unknown, fallback: T): T {
  if (Array.isArray(raw) || (raw && typeof raw === "object")) return (raw as T) ?? fallback;
  if (typeof raw === "string") {
    try { return JSON.parse(raw) as T; } catch { /* noop */ }
  }
  return fallback;
}

type Version = IHumanAnswersAnalysisReport["data"]["versions"][number];

function normalizeVersions(versions: Version[] = []): Version[] {
  return versions.map((v) => {
    const questions = parseMaybeJson<any[]>(v.questions, []);
    const answers = (v.answers ?? []).map((a) => ({
      ...a,
      questionnaire: parseMaybeJson<any[]>(a.questionnaire, []),
    }));
    return { ...v, questions, answers };
  });
}

function pickFallbackActiveVersionNumber(meta: IHumanAnswersAnalysisReport["data"]["meta"], versions: Version[]) {
  if (!versions.length) return null;

  // 盡量挑「有內容」的最新版本
  const withContent = versions.filter((v) => {
    const hasQ = Array.isArray(v.questions) ? v.questions.length > 0 : !!v.questions;
    const hasA = Array.isArray(v.answers) ? v.answers.length > 0 : false;
    return hasQ || hasA;
  });
  const pool = withContent.length ? withContent : versions;

  const sorted = pool.slice().sort((a, b) => {
    const av = a.version_number ?? -Infinity;
    const bv = b.version_number ?? -Infinity;
    if (av === bv) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return bv - av;
  });

  return sorted[0]?.version_number ?? null;
}

// ===== store =====
interface AnalysisReportState {
  meta: IHumanAnswersAnalysisReport["data"]["meta"] | null;
  versions: IHumanAnswersAnalysisReport["data"]["versions"];

  activeVersionNumber: number | null; // Sidebar 切換版本用
  setActiveVersion: (v: number | null) => void;

  hydrateFromPayload: (p: IHumanAnswersAnalysisReport["data"]) => void;
  reset: () => void;
}

export const useAnalysisReportStore = create<AnalysisReportState>()(
  persist(
    (set, get) => ({
      meta: null,
      versions: [],
      activeVersionNumber: null,

      setActiveVersion: (v) => {
        // 可選：確保欲切換的版本存在
        const exists =
          v == null ||
          get().versions.some((ver) => ver.version_number === v);
        if (!exists) return; // 無此版本則忽略
        set({ activeVersionNumber: v });
      },

      hydrateFromPayload: (p) => {
        const normalized = normalizeVersions(p?.versions ?? []);
        const active =
          p?.meta?.current_version ?? pickFallbackActiveVersionNumber(p.meta, normalized);

        set({
          meta: p.meta ?? null,
          versions: normalized,
          activeVersionNumber: active,
        });
      },

      reset: () =>
        set({
          meta: null,
          versions: [],
          activeVersionNumber: null,
        }),
    }),
    {
      name: "analysis-report-store",
      storage: createJSONStorage(() => sessionStorage), // ✅ 存到 sessionStorage
      partialize: (state) => ({
        meta: state.meta,
        versions: state.versions,
        activeVersionNumber: state.activeVersionNumber,
      }),
    }
  )
);
