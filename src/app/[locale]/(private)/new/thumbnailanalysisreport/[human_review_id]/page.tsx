// app/[locale]/(private)/humanreviewdesign/page.tsx
import { LoadPageTranslation } from '@/actions/upstashredis/load-page-translation'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

import AnalysisReportPage from './analysis-report-page'
import { loadQuestionnaire } from '@/actions/upstashredis/load-questionaire'

// ✅ 新版：回傳 IHumanAnswersAnalysisReport
import { fetchHumanAnswersByHumanReviewPublicId } from '@/actions/supabase/supabase-human-reviews' 


interface PageProps {
  params: {
    locale: string;
    human_review_id: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, human_review_id } = await params;
  console.log("analysis report for ", human_review_id);

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const pageId = 'human_review_design_page';
  await LoadPageTranslation(pageId, locale);

  // 取得整包分析報告（含 meta、versions、questions、answers）
  const result = await fetchHumanAnswersByHumanReviewPublicId(human_review_id);
  console.log("success", result.success, " data ", result.data, " message ", result.message)

  if (!result) {
    console.warn('[fetchHumanAnswersAnalysisReportByPublicId] failed:');
    return <div>No record found</div>;
  }

  const { content } = await loadQuestionnaire('reviewer-feedback', locale);
  if (!content) return <p>Failed to load questionnaire</p>;

  return (
    <div className="flex h-screen bg-background text-foreground">
      <main className="flex-1 overflow-y-auto">
        <AnalysisReportPage
          report={result}
          feedbackForm={content}
        />
      </main>
    </div>
  );
}
