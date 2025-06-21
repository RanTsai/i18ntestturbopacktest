import React from "react";
import DynamicSignupForm from "@/components/ui/forms/dynamic-signup-form";
import { loadQuestionnaire } from "@/actions/upstashredis/load-questionaire";

export default async function SignupPage({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const { content } = await loadQuestionnaire('signup', locale)

  if (!content) return <p>Failed Loading Questionaire</p>

  return (
    <div className="p-6">
      <p className="mb-2 text-sm text-gray-400">Language：{locale}</p>
      <DynamicSignupForm formData={content} />
    </div>
  )
}