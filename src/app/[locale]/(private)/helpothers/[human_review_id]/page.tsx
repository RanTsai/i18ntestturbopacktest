import React from "react";
import { notFound } from "next/navigation";

import HumanReviewPage from "./human-review-page";
import { LoadPageTranslation } from '@/actions/upstashredis/load-page-translation';
import { loadQuestionnaire } from '@/actions/upstashredis/load-questionaire';
import { GetTestHumanReview } from "@/actions/supabase/supabase_human_review";

interface PageProps {
  params: {
    locale: string;
    human_review_id: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, human_review_id } = params;

  const { data } = await GetTestHumanReview(human_review_id);
  const humanreview = data?.[0] ?? null;

  const pageId = 'human_review_design_page';
  const translation = await LoadPageTranslation(pageId, locale);
  const { content } = await loadQuestionnaire('reviewer-feedback', locale);
  if (!content) return <p>Failed to load questionnaire</p>;

  // ❌ 不要再包 flex/justify-center 的外層容器
  // ✅ 讓 HumanReviewPage 直接掌控整頁佈局（它裡面已經有 flex + h-screen）
  return (
    <HumanReviewPage
      locale={locale}
      translationContent={translation.content}
      humanreview={humanreview}
      formData={content}
      pageId={pageId}
    />
  );
}
