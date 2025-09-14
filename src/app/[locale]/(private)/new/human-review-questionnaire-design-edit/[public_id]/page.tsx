// app/[locale]/(private)/humanreviewdesign/page.tsx
import HumanReviewDesignPage from './questionnaire-design-client';
import { fetchHumanReviewByPublicId } from "@/actions/supabase/supabase-human-reviews";
interface PageProps {
  params: {
    locale: string;
    public_id: string;
  };
}

export default async function Page({ params }: PageProps) {
  const publicId = await params?.public_id ?? null;

  const dbData = publicId ? await fetchHumanReviewByPublicId(publicId) : null;
  console.log("FetchedHumanReview", dbData?.data);

  return (
    <HumanReviewDesignPage editingHumanReview={dbData?.data} />
  );
}
