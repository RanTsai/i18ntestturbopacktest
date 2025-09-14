"use client"

import { FormSchema, Question } from "@/lib/schema/questionaire-schema"
import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { useParams } from "next/navigation"
import { PageTranslations } from "@/i18n/interface"
import useTranslationStore from "@/lib/global-store/use-translation-store"
import GeneralQuestionaire from "@/components/ui/forms/general-questionare"
import QuestionViewCard from "@/components/ui/forms/question-view-card"
import Image from "next/image"
import { IHumanAnswerWithProfile } from "@/lib/schema/human-review-schema"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Props {
  pageId: string
  humanReview: IHumanAnswerWithProfile | null
  formData: FormSchema
  questionRefs: React.RefObject<Record<string, HTMLElement | null>>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function QuestionnaireViewerDialog({
  pageId,
  humanReview,
  formData,
  questionRefs,
  open,
  onOpenChange,
}: Props) {
  const { getTranslation } = useTranslationStore()
  const [translations, setTranslations] = useState<PageTranslations | null>(null)
  const { locale } = useParams() as { locale: string }

  const questions: Question[] = humanReview?.questionaire || []
  const displayChannelInfo = !!humanReview?.rater?.username
  const form = useForm()

  // 內層滾動容器
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cached = getTranslation(pageId, locale)
    if (cached) setTranslations(cached)
  }, [locale, pageId, getTranslation])

  // 打開時確保捲到頂（保險一次）
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" })
      })
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* key 重新 mount，避免保留舊 scroll 狀態；onOpenAutoFocus 放在 DialogContent */}
      <DialogContent
        key={open ? (humanReview?.human_answer_id ?? "open") : "closed"}
        className="p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" })
          })
        }}
      >
        {/* 內層可滾動容器 */}
        <div ref={scrollRef} className="max-h-[80vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>
              {translations?.page_header?.translation ?? "Help the creator!"}
            </DialogTitle>
          </DialogHeader>

          {humanReview && (
            <div className="flex flex-col gap-6 items-center">
              {displayChannelInfo && (
                <div className="mt-2 p-4 rounded-md bg-primary text-sm flex flex-col items-center text-center">
                  <h1 className="text-l font-bold mb-4">
                    {translations?.channel_info_title?.translation ?? "Channel information"}
                  </h1>
                  <Image
                    src={humanReview.rater?.profile_pic_url ?? "/logo/logo.png"}
                    alt="logo"
                    width={50}
                    height={50}
                    className="rounded-4xl"
                  />
                  <p className="mt-1 text-gray-600">
                    {translations?.channel_name_title?.translation ?? "Channel name"}: {humanReview.rater?.username}
                  </p>
                  <p className="mt-1 text-gray-600">
                    {translations?.platform_title?.translation ?? "Platform"}: Youtube
                  </p>
                  <p className="mt-1 text-gray-600">
                    {translations?.videotype_title?.translation ?? "Video Type"}: {humanReview.rater?.username}
                  </p>
                </div>
              )}

              {questions.map((q, index) => (
                <div
                  key={q.id}
                  ref={(el) => {
                    questionRefs.current[q.id] = el
                  }}
                  className="w-full h-full"
                >
                  <QuestionViewCard
                    question={q}
                    index={index}
                    mode="review"
                    control={form.control}
                    setValue={form.setValue}
                    invalid={false}
                  />
                </div>
              ))}

              <div
                className="mt-10 border-t pt-6 w-full"
                id="question-general:form"
                ref={(el) => {
                  questionRefs.current["general:form"] = el
                }}
              >
                <GeneralQuestionaire
                  formData={formData}
                  control={form.control}
                  register={form.register}
                  loading={false}
                  onSubmit={() => {}}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
