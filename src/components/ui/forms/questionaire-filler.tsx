"use client"

import { Button } from "../button"
import { FormSchema } from "@/lib/schema/questionaire-schema"
import { useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useParams } from "next/navigation"
import { PageTranslations } from "@/i18n/interface"
import useTranslationStore from "@/lib/global-store/use-translation-store"
import GeneralQuestionaire from "./general-questionare"
import QuestionViewCard from "./question-view-card"
import { Question } from "@/lib/schema/questionaire-schema"
import Image from "next/image"
import { IHumanReview, IHumanAnswer } from "@/lib/schema/human-review-schema"
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "@/components/ui/tooltip";
import { SaveHumanAnswerToSupabase } from "@/actions/supabase/supabase_human_answer"

interface Props {
    pageId: string
    humanReview: IHumanReview | null;
    formData: FormSchema
    questionRefs: React.RefObject<Record<string, HTMLDivElement | null>>
    mode?: "fill" | "review"
}

export default function QuestionnaireFiller({
    pageId,
    humanReview,
    formData,
    questionRefs,
    mode = "fill",
}: Props) {
    const { getTranslation } = useTranslationStore()
    const [translations, setTranslations] = useState<PageTranslations | null>(null)
    const [loading, setLoading] = useState(false)
    const { locale } = useParams() as { locale: string }

    const defaultValues: Record<string, any> = {}
    const questions = humanReview!.questionaire
    const [errorQuestionIds, setErrorQuestionIds] = useState<string[]>([]);

    // 初始化 default values 用於填答
    formData.sections.forEach((section) => {
        section.questions.forEach((q) => {
            if (mode === "fill") {
                if (q.type === "radio" && q.options?.length) {
                    defaultValues[q.id] = q.options[0].value
                } else if (q.type === "checkbox") {
                    defaultValues[q.id] = []
                } else if (q.type === "rating") {
                    defaultValues[q.id] = "0"
                } else if (q.type === "number") {
                    defaultValues[q.id] = 0
                } else if (q.type === "text" || q.type === "textarea") {
                    defaultValues[q.id] = ""
                }
            }
        })
    })

    const { control, register, handleSubmit, getValues, setValue, setError, clearErrors, formState: { errors }, } = useForm<Record<string, any>>({
        defaultValues,
    })

    const displayChannelInfo = !!humanReview?.channel_name;

    useEffect(() => {
        const cached = getTranslation(pageId, locale)
        if (cached) {
            setTranslations(cached)
        }
    }, [locale])


    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto py-8 items-center">
            <h1 className="text-3xl font-bold mb-4">Help the creator!</h1>

            {/* 顯示 Channel Info */}
            {displayChannelInfo && (

                <div className="mt-6 p-4 rounded-md bg-primary text-sm flex flex-col items-center text-center">
                    <h1 className="text-l font-bold mb-4">Channel information</h1>
                    <br />
                    <Image src={humanReview.channel_logo} alt="logo" width={50} height={50} className="rounded-4xl" />
                    <p className="mt-1 text-gray-600">channel name: {humanReview.channel_name}</p>
                    {/* <p className="mt-1 text-gray-600">description: {humanReview.project_summary}</p> */}
                    <p className="mt-1 text-gray-600">
                        {translations?.platform_title?.translation ?? "Platform"}: Youtube
                    </p>
                    <p className="mt-1 text-gray-600">
                        {translations?.videotype_title?.translation ?? "Video Type"}: {humanReview.channel_name}
                    </p>
                </ div>
            )}

            {/* 顯示所有題目 */}
            {questions && questions.map((q, index) => (
                <div
                    className="w-full h-full"
                    key={q.id}
                    ref={(el) => {
                        questionRefs.current[q.id] = el;
                    }}
                >
                    <QuestionViewCard
                        question={q}
                        index={index}
                        mode={mode}
                        control={control}
                        setValue={setValue}
                        invalid={errorQuestionIds.includes(q.id)} // ✅ 傳入錯誤狀態
                    />
                </div>
            ))}

            {/* General Questionaire Header */}
            <div
                className="mt-10 border-t pt-6"
                id="question-general:form"
                ref={(el) => {
                    questionRefs.current["general:form"] = el
                }}
            >
                <GeneralQuestionaire
                    formData={formData}
                    control={control}
                    register={register}
                    loading={loading}
                    onSubmit={handleSubmit(() => { })}
                />
            </div>

            <div className="mt-4 flex flex-row gap-4 justify-center">
                <TooltipProvider>
                    {/* ✅ Submit 按鈕 */}
                    <Tooltip delayDuration={800}>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="default"
                                className="hover:bg-blue-500 hover:text-white cursor-pointer transition-colors"
                                onClick={async () => {
                                    const latestFormValues = getValues();

                                    // ✅ 加入這段驗證
                                    const invalidQuestions = questions.filter((q) => {
                                        const value = latestFormValues[q.id];

                                        if (q.type === "image-select" || q.type === "title-select") {
                                            return !value;
                                        }

                                        if (q.required) {
                                            if (q.type === "text" || q.type === "textarea") return !value?.trim();
                                            if (q.type === "radio" || q.type === "number" || q.type === "rating") return value === undefined || value === null;
                                            if (q.type === "checkbox") return !Array.isArray(value) || value.length === 0;
                                        }

                                        return false;
                                    });

                                    if (invalidQuestions.length > 0) {
                                        const firstInvalid = invalidQuestions[0];
                                        setErrorQuestionIds(invalidQuestions.map(q => q.id)); // ✅ 儲存所有錯誤 ID
                                        alert(`❌ 第 ${questions.indexOf(firstInvalid) + 1} 題「${firstInvalid.label}」尚未填寫`);
                                        const ref = questionRefs.current[firstInvalid.id];
                                        if (ref) ref.scrollIntoView({ behavior: "smooth", block: "center" });
                                        return;
                                    }

                                    setErrorQuestionIds([]);

                                    // ✅ 通過驗證才繼續送出
                                    const payload = buildHumanAnswerPayload(
                                        formData,
                                        latestFormValues,
                                        questions
                                    );
                                    console.log("📤 Supabase payload:", payload);

                                    const res = await SaveHumanAnswerToSupabase(payload);

                                    if (res.success) {
                                        alert("✅ 成功儲存到 Supabase");
                                    } else {
                                        alert("❌ 儲存失敗: " + res.message);
                                    }
                                }}
                            >
                                {translations?.submit_button?.translation ?? "Submit"}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {translations?.submit_button?.tooltip ?? "Save and submit"}
                        </TooltipContent>
                    </Tooltip>

                    {/* ✅ Reset 按鈕 */}
                    <Tooltip delayDuration={800}>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="default"
                                className="hover:bg-blue-500 hover:text-white cursor-pointer transition-colors"
                                onClick={() => {
                                    // Todo
                                }}
                            >
                                Cancel
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Cancel</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

        </div>
    )
}

export function buildHumanAnswerPayload(
    formData: FormSchema,
    values: Record<string, any>,
    questions: Question[],
): IHumanAnswer {

    // ✅ 將 General Questionaire 的 answers 寫回 formSchema.sections[].questions[]
    const formDataWithAnswers = assignAnswersToQuestionsInFormSchema(formData, values);

    // ✅ 將其他由用戶自訂的問題（來自 humanReview.questionaire）也寫入 answer
    const questionsWithAnswers: Question[] = questions.map(q => ({
        ...q,
        answer: values[q.id] ?? null,
    }));
    console.log("📦 回傳的 questionaire:", questionsWithAnswers);

    const extract = (id: string) => {
        for (const section of formDataWithAnswers.sections) {
            const found = section.questions.find((q) => q.id === id);
            if (found) return found.answer ?? null;
        }
        return null;
    };

    const thumbnails: string[] = extractThumbnailUrls(questions);

    return {
        human_answer_id: 0,
        human_review_id: 0,
        created_at: "",
        reviewer_clerk_id: "",
        questionaire: questionsWithAnswers, // ✅ 正確含 answer 的版本
        message_to_creator: extract("message_to_creator") ?? "",
        credit_reward: extract("accept_reward") === "yes",
        is_deleted: false,
        deleted_at: "",
        is_public: extract('allow_public_display') === 'yes',
        deleted_by: "",
        selected_work: thumbnails[0],
        follow_creator: extract('follow_creator_for_future') === 'yes',
        creator_support_credit: Number(extract('support_creator_credit') || 0)
    };
}

export const extractAnswerFromForm = (
    formSchema: FormSchema,
    id: string
): any => {
    for (const section of formSchema.sections) {
        const found = section.questions.find(q => q.id === id);
        if (found) return found.answer ?? null;
    }
    return null;
};


// ✅ 將 flat values 寫回 FormSchema 中的每個 Question.answer
export function assignAnswersToQuestionsInFormSchema(
    formSchema: FormSchema,
    values: Record<string, any>
): FormSchema {
    return {
        ...formSchema,
        sections: formSchema.sections.map(section => ({
            ...section,
            questions: section.questions.map(question => {
                const answer = values.hasOwnProperty(question.id)
                    ? values[question.id]
                    : null;

                console.log("📝 Assigning answer", {
                    id: question.id,
                    label: question.label,
                    answer: answer,
                });

                return {
                    ...question,
                    answer,
                };
            })
        }))
    };
}

export function extractThumbnailUrls(questions: Question[]): string[] {
    return questions
        .filter(q => q.type === "image-select")                  // 只抓出 image-select 類型
        .flatMap(q => q.options?.map(opt => opt.label) ?? [])    // 從 options 裡面抓出 label (url)
        .filter(Boolean);                                        // 過濾掉 null 或 undefined
}