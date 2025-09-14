// app/[locale]/new/page.tsx
import PageClientNoProp from './pageclientnoprop';
import { LoadPageTranslation } from '@/actions/upstashredis/load-page-translation';
import { notFound } from 'next/navigation';
import { CachedTranslation } from '@/lib/idb/translation-idb';

export default async function Page({ params }: { params: { locale: string } }) {
  // const locale = params.locale;
  // const pageId = "review_community_page";

  // const result = await LoadPageTranslation(pageId, locale);
  // if (!result.found) notFound();
  // const initialTranslation: CachedTranslation= {content:result.content, version:result.content.version ?? 1};
  return (
    <>
    <h1>With Prop</h1>
    {/* <PageClientNoProp initialTranslation={initialTranslation}/> */}

    <h1>No Prop</h1>
    <PageClientNoProp />
    </>
  );
}
