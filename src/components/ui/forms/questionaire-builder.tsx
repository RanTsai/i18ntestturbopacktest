'use client'

import { useState } from 'react'
import { useForm } from "react-hook-form";
import { Button } from '@/components/ui/button'
import { ReviewQuestion } from '@/lib/schema/review-question'
import { QuestionCard } from './question-card'
import GeneralQuestionaire from './general-questionare'
import { Plus } from 'lucide-react'
import { FormSchema } from '@/lib/schema/creator-signup-questionaire-schema'

interface Props {
  formData: FormSchema;
}
export default function QuestionnaireBuilder({ formData }: Props) {
  const [questions, setQuestions] = useState<ReviewQuestion[]>([])
  const { control, register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const onQuestionnaireSubmit = async (values: any) => {
    setLoading(true);
    console.log("👤 Human Feedback Submitted", values);
    // TODO: 可串接 Supabase 儲存問卷答案
    setLoading(false);
  };

  const addQuestion = () => {
    const newQuestion: ReviewQuestion = {
      id: crypto.randomUUID(),
      type: 'text',
      label: '新問題',
      required: false,
    }
    setQuestions(prev => [...prev, newQuestion])
  }

  const updateQuestion = (id: string, updated: Partial<ReviewQuestion>) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updated } : q))
    )
  }

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  const previewJson = () => {
    const schema = {  
      metadata: {
        version: 1,
        createdAt: new Date().toISOString(),
      },
      questions,
    }

    console.log('🔧 Questionaire Schema:', schema)
    alert('已輸出 JSON（console 中查看）')
  }

  const copyQuestion = (id: string) => {
  setQuestions((prev) => {
    const index = prev.findIndex((q) => q.id === id);
    if (index === -1) return prev;

    const original = prev[index];
    const copy: ReviewQuestion = {
      ...original,
      id: crypto.randomUUID(), // 新 ID
      label: original.label + " (複製)", // 可加上註記
    };

    const newQuestions = [...prev];
    newQuestions.splice(index + 1, 0, copy); // 插入複製在下一個
    return newQuestions;
  });
};

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold">問卷編輯器</h1>

      {questions.map((q, index) => (
        <QuestionCard
          key={q.id}
          question={q}
          index={index}
          onChange={updateQuestion}
          onDelete={deleteQuestion}
          onCopy={copyQuestion} 
        />
      ))}

      <Button onClick={addQuestion} variant="outline" className="w-fit">
        <Plus className="w-4 h-4 mr-2" />
        新增問題
      </Button>

      <div className="flex gap-4 mt-6">
        <Button variant="secondary" onClick={previewJson}>
          預覽 JSON
        </Button>
        <Button
          onClick={() =>
            alert('TODO: 儲存到 Supabase 或其他資料庫')
          }
        >
          儲存問卷
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const schema = {
              metadata: {
                version: 1,
                createdAt: new Date().toISOString(),
              },
              questions,
            }
            const jsonStr = JSON.stringify(schema, null, 2)
            navigator.clipboard.writeText(jsonStr)
            alert('✅ JSON 已複製到剪貼簿')
          }}
        >
          📋 複製 JSON
        </Button>
      </div>

      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold mb-2">預覽</h2>
        <GeneralQuestionaire
          formData={formData}
          control={control}
          register={register}
          loading={loading}
          onSubmit={handleSubmit(onQuestionnaireSubmit)}
        />
      </div>
    </div>
  )
}
