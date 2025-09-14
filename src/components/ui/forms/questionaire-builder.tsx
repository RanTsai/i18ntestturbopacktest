//\components\ui\forms\questionaire-builder.tsx
"use client"

import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Question } from '@/lib/schema/questionaire-schema'
import { QuestionCard } from './question-card'
import GeneralQuestionaire from './general-questionare'
import { useQuestionnaireStore } from '@/lib/global-store/human-review-questionaire-store'
import { Plus } from 'lucide-react'
import { FormSchema } from '@/lib/schema/questionaire-schema'
import { useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import UserChannelStore from '@/lib/global-store/user-channel-store'
import { IHumanReview } from '@/lib/schema/human-review-schema'
import { SaveHumanReviewToSupabase } from "@/actions/supabase/supabase_human_review";
import useTranslationStore from '@/lib/global-store/use-translation-store';
import { PageTranslations } from '@/i18n/interface'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { arrayMove } from '@dnd-kit/sortable'
import SortableItem from './sortable-item'
import { useState } from 'react'
import Image from 'next/image'
import { IUserChannel } from '@/lib/schema/user-channel-schema'
import { locale } from 'dayjs';
import { useParams } from 'next/navigation'



export const mockQuestions: Question[] = [
  {
    id: "q1",
    type: "image-select",
    label: "請選擇你覺得表現最佳的縮圖",
    required: true,
    options: [
      { value: "thumb_1", label: "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails//TheMonkeyMan%20V3.jpg" },
      { value: "thumb_2", label: "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails//artwork%20(4).png" },
      { value: "thumb_3", label: "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails//Thumbnail%20-%20Short%202.png" },
      { value: "thumb_4", label: "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails//Thumbnail%20-%20Short%201.png" }
    ]
  },
  {
    id: "q1_reason",
    type: "text",
    label: "請簡述你選擇此縮圖的原因",
    required: true,
    placeholder: "輸入原因…"
  },
  {
    id: "q2",
    type: "title-select",
    label: "請選擇你覺得最吸引人的標題",
    required: true,
    options: [
      { value: "title_1", label: "你不會相信發生了什麼事…" },
      { value: "title_2", label: "這是2024最好的教學影片" },
      { value: "title_3", label: "看完這部影片，你會重新思考人生" },
      { value: "title_4", label: "這個標題為何點閱率爆炸？原因竟然是…" }
    ]
  },
  {
    id: "q2_reason",
    type: "text",
    label: "請簡述你選擇此標題的原因",
    required: true,
    placeholder: "輸入原因…"
  }
]

interface Props {
  formData: FormSchema
  questionRefs: React.RefObject<Record<string, HTMLElement | null>>
  translations?: PageTranslations;
}

export default function QuestionnaireBuilder({ formData, questionRefs, translations }: Props) {
  const [loading, setLoading] = useState(false)
  const pageId = "human_review_design_page";

  const defaultValues: Record<string, any> = {}
  const localeParams = useParams() as { locale: string };
  const locale = localeParams?.locale || "en";

  console.log("Form data", formData);
  formData.sections.forEach((section) => {
    section.questions.forEach((q) => {
      if (q.type === "radio" && q.options && q.options.length > 0) {
        defaultValues[q.id] = q.options[0].value // ✅ 設定預設值為第一個 option        
        console.log("setting default", q.options[0].value)
      } else if (q.type === "checkbox" && !q.options) {
        defaultValues[q.id] = false // ✅ 單選 checkbox 預設為 false
      } else if (q.type === "multi-text") {
        defaultValues[q.id] = [] // ✅ 多欄文字預設為空陣列
      } else if (q.type === "rating") {
        defaultValues[q.id] = "0" // 或 "1"，視需求
      } else if (q.type === "number") {
        defaultValues[q.id] = 0
      }
    })
  })

  const { control, register, handleSubmit, getValues } = useForm<Record<string, any>>({ defaultValues })

  const {
    selectedChannel,
  } = UserChannelStore()

  const {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    setQuestions,
    setEditingId,
  } = useQuestionnaireStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    console.log('✅ Registered questionRefs:', questionRefs.current)
    if (questions.length === 0) {
      setQuestions(mockQuestions)
    }
  }, [questions])



  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = questions.findIndex((q) => q.id === active.id)
    const newIndex = questions.findIndex((q) => q.id === over.id)
    reorderQuestions(oldIndex, newIndex)
  }

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: 'text',
      label: translations?.new_question?.translation?? "New Question",
      required: false,
    }
    addQuestion(newQuestion)
  }

  const handleCopyQuestion = (id: string) => {
    const index = questions.findIndex((q) => q.id === id)
    if (index === -1) return

    const original = questions[index]
    const copy: Question = {
      ...original,
      id: crypto.randomUUID(),
      label: original.label + ' (Copy)',
    }

    const newQuestions = [...questions]
    newQuestions.splice(index + 1, 0, copy)
    setQuestions(newQuestions)
  }

  const previewJson = () => {
    const schema = {
      questions,
    }

    console.log('🔧 Questionaire Schema:', schema)
    alert('已輸出 JSON（console 中查看）')
  }

  const displayChannelInfo = useWatch({
    control,
    name: 'display_channel_detail', // 
  });

  const onValid = (values: Record<string, any>) => {
    const latestFormValues = getValues();

    const payload = buildHumanReviewPayload(
      formData,
      latestFormValues,
      selectedChannel,
      questions,
      "temp_user_id",
      1,
      locale
    )

    const jsonStr = JSON.stringify(payload, null, 2)
    navigator.clipboard.writeText(jsonStr)
    alert("📋 Payload 已複製")
    console.log("📦 Payload:", payload)
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto py-8">
      <div className="mt-10 border-t pt-6" id="question-general:form"
        ref={(el) => {
          questionRefs.current['general:form'] = el
        }}>
        <GeneralQuestionaire
          formData={formData}
          control={control}
          register={register}
          loading={loading}
          onSubmit={handleSubmit(onValid)} // ✅ 改為共用
        />
      </div>

      <h1 className="text-2xl font-bold flex items-center justify-center">{translations?.questionaire_builder_title?.translation ?? "What would you like to ask?"}</h1>

      <AnimatePresence>
        {displayChannelInfo === "Yes" && selectedChannel && (
          <motion.div
            key="channel-info"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 p-4 rounded-md bg-primary text-sm flex flex-col items-center text-center"
          >
            <Image src={selectedChannel!.logo} alt="logo" width={50} height={50} className='rounded-4xl' />
            <p className="mt-1 text-gray-600">{selectedChannel.channel_name}</p>
            <p className="mt-1 text-gray-600">{selectedChannel.description}</p>
            <p className="mt-1 text-gray-600">{translations?.platform_title?.translation ?? "Platform"}: {selectedChannel.platform}</p>
            {/* <p className="mt-1 text-gray-600">{translations?.worktype_title?.translation?? "Work Type"}: {selectedChannel.art_type}</p> */}
            <p className="mt-1 text-gray-600">{translations?.videotype_title?.translation ?? "Video Type"}: {selectedChannel.art_sub_type}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          {questions.map((q, index) => (
            <SortableItem key={q.id} id={q.id}>
              {({ setNodeRef, style, listeners, attributes }) => (
                <div
                  ref={(el) => {
                    setNodeRef(el)
                    questionRefs.current[q.id] = el
                  }}
                  style={style} // 這裡保留 dnd-kit 的 style 控制
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <QuestionCard
                      pageId={pageId}
                      question={q}
                      index={index}
                      onChange={updateQuestion}
                      onDelete={deleteQuestion}
                      onCopy={handleCopyQuestion}
                      dragHandleProps={{ ...listeners, ...attributes }}
                      onFocus={() => setEditingId(q.id)}
                    />
                  </motion.div>
                </div>
              )}
            </SortableItem>

          ))}
        </SortableContext>
      </DndContext>

      <TooltipProvider>
        <Tooltip delayDuration={800}>
          <TooltipTrigger asChild>
            <Button
              onClick={handleAddQuestion}
              variant="outline"
              className="w-fit hover:bg-blue-500 hover:text-white cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {translations?.new_question?.translation ?? "New Question"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{translations?.new_question?.tooltip ?? "Add a new Question"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex gap-4 mt-6">
        {/* <Button variant="secondary" onClick={previewJson}>
          Preview JSON
        </Button>
        <Button onClick={() => alert('TODO: 儲存到 Supabase 或其他資料庫')}>
          Save
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const schema = {
              questions,
            }
            const jsonStr = JSON.stringify(schema, null, 2)
            navigator.clipboard.writeText(jsonStr)
            alert('✅ JSON 已複製到剪貼簿')
          }}
        >
          📋 Copy JSON
        </Button>
        <Button onClick={handleSubmit(onValid)}>
          🧾 Copy Payload
        </Button> */}
        <TooltipProvider delayDuration={300}>
          {/* ✅ Publish 按鈕 + Tooltip */}
          <Tooltip delayDuration={800}>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                className="hover:bg-blue-500 hover:text-white cursor-pointer transition-colors"

                onClick={async () => {
                  const latestFormValues = getValues(); // ✅ 使用者剛填的值
                  const mockClerkId = "mock_clerk_123";
                  const mockSupabaseUserId = 1;

                  // ✅ 使用 buildHumanReviewPayload 組成 payload
                  const payload = buildHumanReviewPayload(
                    formData,
                    latestFormValues,
                    selectedChannel,
                    questions,
                    mockClerkId,
                    mockSupabaseUserId,
                    locale
                  );

                  // ✅ 呼叫 Supabase 儲存 function
                  const res = await SaveHumanReviewToSupabase(payload);
                  console.log("📤 Supabase Response:", res);

                  if (res.success) {
                    alert("✅ 成功儲存到 Supabase");
                  } else {
                    alert("❌ 儲存失敗: " + res.message);
                  }
                }}
              >
                {translations?.submit_button?.translation ?? "Publish!"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{translations?.submit_button?.tooltip ?? "Save and publish"}</TooltipContent>
          </Tooltip>

          {/* ✅ Save 按鈕 + Tooltip */}
          <Tooltip delayDuration={800}>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                className="hover:bg-blue-500 hover:text-white cursor-pointer transition-colors"

                onClick={() => {
                  // Todo
                }}
              >
                {translations?.save_button?.translation ?? "Save!"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{translations?.save_button?.tooltip ?? "Save temperarily without publishing, you can edit it later"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

      </div>
    </div>
  )
}

export function buildHumanReviewPayload(
  formData: FormSchema,
  values: Record<string, any>,
  selectedChannel: IUserChannel | null,
  questions: Question[],
  clerk_user_id: string,
  supabase_user_id: number,
  defaultlocale: string,
): IHumanReview {

  const formDataWithAnswers = assignAnswersToQuestionsInFormSchema(formData, values);

  // ✅ 在這裡做 value ← label 的覆寫
  const normalizedQuestions = normalizeOptionValuesForSubmit(questions);

  const extract = (id: string) => {
    for (const section of formDataWithAnswers.sections) {
      const found = section.questions.find((q) => q.id === id);
      if (found) return found.answer ?? null;
    }
    return null;
  };

  const thumbnails: string[] = extractThumbnailUrls(normalizedQuestions);
  const titles = extractTitleOptions(normalizedQuestions);

  return {
    human_review_id: 0,
    created_at: "",
    clerk_user_id,
    supabase_user_id,
    project_summary: "",
    questionaire: questions, // ✅ 用正規化後的 questions
    channel_name: selectedChannel?.channel_name ?? "",
    channel_logo: selectedChannel?.logo ?? "",
    reviewer: [],
    deadline: extract('review_deadline_date'),
    creator_message_to_reviewer: extract('additional_message_to_rater') || '',
    tags: selectedChannel?.tags?.map(tag => tag.label) ?? [],
    target_audience: [],
    credit_reward: Number(extract('rater_credit_reward') || 0),
    compare_project_version: 1,
    updated_by: clerk_user_id,
    language: selectedChannel?.language ?? defaultlocale,
    is_closed: false,
    is_deleted: false,
    is_public: extract('review_audience_visibility') === 'public',
    deleted_by: '',
    status: 'draft',
    wanted_review_count: Number(extract('wanted_review_count') || 1),
    rating_count: 0,
    view_count: 0,
    thumbnails,
    title: titles[0],
    niche: selectedChannel?.niche ?? "",
  }
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

export function extractTitleOptions(questions: Question[]): string[] {
  return questions
    .filter(q => q.type === "title-select")
    .flatMap(q => q.options?.map(opt => opt.label) ?? [])
    .filter(Boolean);
}

// ✅ 只在提交時把 radio/checkbox 的 option.value 覆寫成 label（若 label 為空則保留原 value）
function normalizeOptionValuesForSubmit(questions: Question[]): Question[] {
  return questions.map((q) => {
    if ((q.type === "radio" || q.type === "checkbox") && q.options?.length) {
      return {
        ...q,
        options: q.options.map((opt) => {
          const nextValue = (opt.label ?? "").trim();
          return {
            ...opt,
            value: nextValue !== "" ? nextValue : opt.value, // 空 label 就不動
          };
        }),
      };
    }
    return q;
  });
}
