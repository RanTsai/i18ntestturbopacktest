// app/[locale]/(private)/humanreviewdesign/page.tsx
import { LoadPageTranslation } from '@/actions/upstashredis/load-page-translation';
import { loadQuestionnaire } from '@/actions/upstashredis/load-questionaire';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import HumanReviewDesignPage from './humandesignpage';

interface PageProps {
  params: { locale: string };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }  

  const pageId = 'human_review_design_page';
  const translation = await LoadPageTranslation(pageId, locale);
  const { content } = await loadQuestionnaire('human-review', locale);

  if (!content) return <p>Failed to load questionnaire</p>;

  return (
    <HumanReviewDesignPage
      locale={locale}
      translationContent={translation.content}
      formData={content}
      pageId={pageId}
    />
  );
}
