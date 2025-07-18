import React from "react";
import HumanReviewQuestionaireDesignForm from "@/components/ui/forms/human-review-questionaire-design";
import { loadQuestionnaire } from "@/actions/upstashredis/load-questionaire";
import QuestionnaireBuilder from "@/components/ui/forms/questionaire-builder";

export default async function HumanReviewDesignPage({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const { content } = await loadQuestionnaire('human-review', locale)

  if (!content) return <p>Failed Loading Questionaire</p>

  return (
    <div className="p-6">
      <p className="mb-2 text-sm text-gray-400">Language：{locale}</p>
       <QuestionnaireBuilder formData={content} />
    </div>
  )
}