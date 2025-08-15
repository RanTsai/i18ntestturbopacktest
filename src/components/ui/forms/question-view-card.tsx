"use client"
import { useEffect, useState } from "react"
import { Question } from "@/lib/schema/questionaire-schema"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Control,
  useWatch,
  UseFormSetValue,
} from "react-hook-form"

interface Props {
  question: Question
  index: number
  mode?: "fill" | "review"
  control?: Control<any>
  setValue?: UseFormSetValue<any>
  invalid?: boolean
}

export default function QuestionViewCard({
  question,
  index,
  mode = "fill",
  control,
  setValue,
  invalid = false,
}: Props) {
  const answer = question.answer
  const watchedValue = useWatch({ control, name: question.id })
  const isReview = mode === "review"

  const [localinvalid, setInvalid] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const toSafeString = (v: any): string =>
    v === undefined || v === null ? "" : String(v)
  const toStringArray = (v: any): string[] =>
    Array.isArray(v) ? v.map(toSafeString) : []

  useEffect(() => {
    if (!invalid) return
    const hasValue =
      watchedValue !== undefined &&
      watchedValue !== null &&
      watchedValue !== "" &&
      (!Array.isArray(watchedValue) || watchedValue.length > 0)
    if (hasValue && invalid) setInvalid(false)
    else setInvalid(true)
  }, [watchedValue, hasInteracted, invalid])

  const handleSetValue = (name: string, value: any) => {
    if (!hasInteracted) setHasInteracted(true)
    setValue?.(name, value)
  }

  return (
    <div
      className={cn(
        "rounded-md p-4 bg-white space-y-3 relative shadow-sm transition-all border",
        localinvalid ? "border-yellow-500" : "border-gray-200"
      )}
    >
      <Label className="text-sm font-medium block mb-1">
        問題 {index + 1}：{question.label}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {localinvalid && (
        <p className="text-yellow-500 text-sm mt-1">此題為必填，請填寫後再提交。</p>
      )}

      {/* ✅ 文本輸入 */}
      {question.type === "text" && (
        isReview ? (
          <p className="text-sm text-gray-700">{answer ?? "（未填寫）"}</p>
        ) : (
          <Input
            placeholder={question.placeholder ?? "輸入文字…"}
            value={watchedValue ?? ""}
            onChange={(e) => {
              handleSetValue?.(question.id, e.target.value)
            }}
            className="input-interactive hover:!border-purple-300 focus:!border focus:!border-purple-500 focus:!ring-purple-500"
          />
        )
      )}

      {/* ✅ 多行輸入 */}
      {question.type === "textarea" && (
        isReview ? (
          <p className="text-sm text-gray-700 whitespace-pre-line">{answer ?? "（未填寫）"}</p>
        ) : (
          <textarea
            placeholder={question.placeholder ?? "輸入內容…"}
            rows={3}
            className="w-full p-2 text-sm resize-none input-interactive hover:!border-purple-300 focus:!border focus:!border-purple-500 focus:!ring-purple-500"
            value={watchedValue ?? ""}
            onChange={(e) => {
              handleSetValue?.(question.id, e.target.value)
            }}
          />
        )
      )}

      {/* ✅ 星星評分 */}
      {question.type === "rating" && (
        <div className="flex gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const starIndex = i + 1
            const isActive = isReview
              ? starIndex <= Number(answer ?? 0)
              : starIndex <= Number(watchedValue ?? 0)

            return (
              <Star
                key={i}
                onClick={() => {
                  if (!isReview) handleSetValue?.(question.id, starIndex)
                }}
                className={cn(
                  "w-6 h-6 transition",
                  !isReview ? "cursor-pointer" : "",
                  isActive
                    ? "text-yellow-400 stroke-yellow-500 fill-yellow-300"
                    : "text-gray-300 stroke-gray-400 fill-white"
                )}
              />
            )
          })}
        </div>
      )}

      {/* ✅ 單選 radio */}
      {question.type === "radio" && question.options?.length && (
        <div className="space-y-1">
          {question.options.map((opt) => {
            const checked = isReview ? answer === opt.value : watchedValue === opt.value
            return (
              <label key={opt.value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={question.id}
                  value={opt.value}
                  disabled={isReview}
                  checked={checked}
                  onChange={() => {
                    if (!isReview) handleSetValue?.(question.id, opt.value)
                  }}
                  className="accent-purple-600"
                />
                {opt.label}
              </label>
            )
          })}
        </div>
      )}

      {/* ✅ 複選 checkbox */}
      {question.type === "checkbox" && question.options?.length && (
        <div className="space-y-1">
          {question.options.map((opt) => {
            const val = toSafeString(opt.value)
            const current = isReview
              ? toStringArray(answer)
              : toStringArray(watchedValue)
            const checked = current.includes(val)

            const handleChange = () => {
              const base = toStringArray(watchedValue)
              const newValue = checked ? base.filter((v) => v !== val) : [...base, val]
              handleSetValue(question.id, newValue)
            }

            return (
              <label key={val} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  value={val}
                  disabled={isReview}
                  checked={checked}
                  onChange={handleChange}
                  className="accent-purple-600 "
                />
                {opt.label}
              </label>
            )
          })}
        </div>
      )}

      {/* ✅ 圖片選擇（卡片可 hover/focus 出紫框） */}
      {question.type === "image-select" && question.options?.length && (
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((opt) => {
            const isSelected = isReview
              ? answer === opt.value
              : watchedValue === opt.value

            return (
              <div
                key={opt.value}
                tabIndex={0}
                className={cn(
                  "overflow-hidden transition aspect-video select-none input-interactive hover:!border-purple-300 focus:!border focus:!border-purple-500 focus:!ring-purple-500",
                  isSelected ? "!border-2 !border-purple-500" : "border-gray-200 cursor-pointer"
                )}
                onClick={() => {
                  if (!isReview) handleSetValue?.(question.id, opt.value)
                }}
                onKeyDown={(e) => {
                  if (!isReview && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault()
                    handleSetValue?.(question.id, opt.value)
                  }
                }}
              >
                <Image
                  src={opt.label}
                  alt={opt.value}
                  width={300}
                  height={200}
                  className="object-cover w-full h-full"
                />
              </div>
            )
          })}
        </div>
      )}

      {/* ✅ 標題選擇（卡片可 hover/focus 出紫框；選取仍沿用藍色） */}
      {question.type === "title-select" && question.options?.length && (
        <div className="grid gap-2">
          {question.options.map((opt) => {
            const isSelected = isReview
              ? answer === opt.value
              : watchedValue === opt.value

            return (
              <div
                key={opt.value}
                tabIndex={0}
                className={cn(
                  "p-3 rounded text-sm transition input-interactive hover:!border-purple-300 focus:!border focus:!border-purple-500 focus:!ring-purple-500",
                  isSelected
                    ? "!border-2 !border-blue-500 bg-blue-50"
                    : "border-gray-300",
                  !isReview ? "cursor-pointer" : ""
                )}
                onClick={() => {
                  if (!isReview) handleSetValue?.(question.id, opt.value)
                }}
                onKeyDown={(e) => {
                  if (!isReview && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault()
                    handleSetValue?.(question.id, opt.value)
                  }
                }}
              >
                {opt.label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
