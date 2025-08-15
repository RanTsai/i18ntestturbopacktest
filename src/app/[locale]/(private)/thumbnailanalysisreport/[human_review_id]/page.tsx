// app/[locale]/(private)/humanreviewdesign/page.tsx
import { LoadPageTranslation } from '@/actions/upstashredis/load-page-translation'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

import type { Question } from '@/lib/schema/questionaire-schema'
import type { IHumanAnswer } from '@/lib/schema/human-review-schema'

import { GetHumanAnswerWithHumanReviewId } from '@/actions/supabase/supabase_human_answer'
import AnalysisReportPage from './analysis-report-page'
import { loadQuestionnaire } from '@/actions/upstashredis/load-questionaire'

interface PageProps {
  params: {
    locale: string;
    human_review_id: string; // <-- 這裡直接從路由拿字串
  };  
}
export default async function Page({ params }: PageProps) {
    const { locale, human_review_id } = params;


  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const pageId = 'human_review_design_page'
  await LoadPageTranslation(pageId, locale)

  // 取得某個 HumanReviewID 的所有作答
  const { success, data, message } = await GetHumanAnswerWithHumanReviewId(Number(human_review_id))
  const humanAnswers: IHumanAnswer[] = success && data ? data : []

  if (!success || !data || data.length === 0) {
    console.warn('[GetHumanAnswerWithHumanReviewId] failed or no data:', message)
    return <div>找不到資料</div>
  }

  // 從第一筆的 questionaire 當作模板題目
  const firstQuestionaire = humanAnswers[0]?.questionaire || []
  const questions: Question[] = firstQuestionaire.map((q: any) => ({
    id: q.id,
    type: q.type,
    label: q.label,
    required: q.required ?? false,
    options: q.options ?? [],
    placeholder: q.placeholder ?? '',
  }))
  const { content } = await loadQuestionnaire('reviewer-feedback', locale);
  if (!content) return <p>Failed to load questionnaire</p>;
  return (
    <div className="flex h-screen bg-background text-foreground">
      <main className="flex-1 overflow-y-auto">
        <AnalysisReportPage
          questions={questions}
          humanAnswers={humanAnswers}
          formData={content}
        />
      </main>
    </div>
  )
}
