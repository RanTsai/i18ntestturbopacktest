"use client"

import { FormSchema, Question } from "@/lib/schema/questionaire-schema"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useParams } from "next/navigation"
import { PageTranslations } from "@/i18n/interface"
import useTranslationStore from "@/lib/global-store/use-translation-store"
import GeneralQuestionaire from "./general-questionare"
import QuestionViewCard from "./question-view-card"
import Image from "next/image"
import { IHumanAnswerWithProfile } from "@/lib/schema/human-review-schema"

interface Props {
    pageId: string
    humanReview: IHumanAnswerWithProfile | null
    formData: FormSchema
    questionRefs: React.RefObject<Record<string, HTMLElement | null>>
}

export default function QuestionnaireViewer({
    pageId,
    humanReview,
    formData,
    questionRefs,
}: Props) {
    const { getTranslation } = useTranslationStore()
    const [translations, setTranslations] = useState<PageTranslations | null>(null)
    const { locale } = useParams() as { locale: string }

    const questions: Question[] = humanReview?.questionaire || []
    const displayChannelInfo = !!humanReview?.rater?.username
    const form = useForm()

    useEffect(() => {
        const cached = getTranslation(pageId, locale)
        if (cached) setTranslations(cached)
    }, [locale, pageId, getTranslation])

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto py-8 items-center">
            <h1 className="text-3xl font-bold mb-4">
                {translations?.page_header?.translation ?? "Help the creator!"}
            </h1>

            {/* 顯示 Channel Info */}
            {displayChannelInfo && (
                <div className="mt-6 p-4 rounded-md bg-primary text-sm flex flex-col items-center text-center">
                    <h1 className="text-l font-bold mb-4">
                        {translations?.channel_info_title?.translation ?? "Channel information"}
                    </h1>
                    <Image
                        src={humanReview!.rater?.profile_pic_url ?? "/logo/logo.png"}
                        alt="logo"
                        width={50}
                        height={50}
                        className="rounded-4xl"
                    />
                    <p className="mt-1 text-gray-600">
                        {translations?.channel_name_title?.translation ?? "Channel name"}:{" "}
                        {humanReview!.rater?.username}
                    </p>
                    <p className="mt-1 text-gray-600">
                        {translations?.platform_title?.translation ?? "Platform"}: Youtube
                    </p>
                    <p className="mt-1 text-gray-600">
                        {translations?.videotype_title?.translation ?? "Video Type"}:{" "}
                        {humanReview!.rater?.username}
                    </p>
                </div>
            )}

            {/* 顯示所有題目 */}
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
                        mode="review" // 只顯示模式
                        control={form.control}
                        setValue={form.setValue}
                        invalid={false}
                    />
                </div>
            ))}

            {/* General Questionaire 也改成只顯示 */}
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
                    onSubmit={() => { }}

                />
            </div>
        </div>
    )
}
