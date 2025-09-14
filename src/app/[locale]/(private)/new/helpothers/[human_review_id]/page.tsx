import React from "react";
import HumanAnswerClient from "./human-review-client";
import { fetchHumanReviewToAnswerByPublicId} from "@/actions/supabase/supabase-human-reviews"
import { HumanReviewBundle } from "@/lib/global-store/use-human-review-bundle-store";
interface PageProps {
  params: {
    locale: string;
    human_review_id: string;
  };
}

export default async function Page({ params }: PageProps) {
  const publicId = params?.human_review_id ?? null;
  if (!publicId) return <p>Missing public id</p>;

  const { data, success } = await fetchHumanReviewToAnswerByPublicId(publicId);
  console.log("fetched human review data", data);
  if (!success || !data) {
    return <p>Failed to load questionnaire</p>;
  }

  const parsed = data as HumanReviewBundle;

  console.log("fetch human review questionnaire", parsed.versions[0]?.questionnaire);

  return (
    <HumanAnswerClient
      ratingHumanReview={parsed}
    />
  );
}