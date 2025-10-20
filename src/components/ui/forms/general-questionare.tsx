// components/ui/forms/general-questionaire.tsx
"use client";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Controller, UseFormRegister, Control } from "react-hook-form";
import { Star, Plus } from "lucide-react";
import { useState } from "react";
import { FormSchema, QuestionnaireAnswer } from "@/lib/schema/questionaire-schema";
import { DatePicker } from "../date-picker";
import Image from "next/image";

interface Props {
  formData: FormSchema;
  loading: boolean;
  control: Control<QuestionnaireAnswer>;
  register: UseFormRegister<QuestionnaireAnswer>;
}

function RatingStars({
  value,
  onChange,
  scale = 5,
}: {
  value?: string | number;
  onChange: (v: string) => void;
  scale?: number;
}) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const currentValue = Number(value ?? 0);

  return (
    <div className="flex gap-1">
      {Array.from({ length: scale }).map((_, i) => {
        const v = i + 1;
        const isFilled = hoverValue !== null ? v <= hoverValue : v <= currentValue;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(String(v))}
            onMouseEnter={() => setHoverValue(v)}
            onMouseLeave={() => setHoverValue(null)}
            className="p-0 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
          >
            <Star className={`w-6 h-6 ${isFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
          </button>
        );
      })}
    </div>
  );
}

const GeneralQuestionaire = ({
  formData,
  loading, // 目前僅為占位，可用於 disable 欄位
  control,
  register,
}: Props) => {
  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <h1 className="text-2xl font-bold text-center">{formData.title}</h1>

      {formData.sections.map((section) => (
        <div key={section.id} className="space-y-4">
          <h2 className="text-xl font-semibold">{section.title}</h2>

          {section.questions.map((q) => (
            <div key={q.id} className="space-y-2">
              {/* 題目標題 */}
              {!(q.type === "checkbox" && !q.options) && (
                <label className="block font-medium">{q.label}</label>
              )}

              {/* Text */}
              {q.type === "text" && (
                <Input placeholder={q.placeholder} disabled={loading} {...register(q.id)} />
              )}

              {/* Textarea */}
              {q.type === "textarea" && (
                <Textarea placeholder={q.placeholder} disabled={loading} {...register(q.id)} />
              )}

              {/* Number */}
              {q.type === "number" && (
                <Input
                  type="number"
                  step={1}
                  placeholder={q.placeholder}
                  disabled={loading}
                   // 將字串轉數字
                  {...register(q.id, { valueAsNumber: true })}
                />
              )}

              {/* Radio */}
              {q.type === "radio" && q.options && (
                <Controller
                  control={control}
                  name={q.id}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value !== undefined ? String(field.value) : ""}
                    >
                      {q.options!.map((opt) => (
                        <div key={`${q.id}_${opt.value}`} className="flex items-center gap-2">
                          <RadioGroupItem value={opt.value} id={`${q.id}-${opt.value}`} />
                          <label htmlFor={`${q.id}-${opt.value}`}>{opt.label}</label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
              )}

              {/* Rating */}
              {q.type === "rating" && (
                <Controller
                  name={q.id}
                  control={control}
                  render={({ field }) => (
                    <RatingStars
                      value={Number(field.value)}
                      onChange={field.onChange}
                      scale={q.scale || 5}
                    />
                  )}
                />
              )}

              {/* Checkbox: multiple */}
              {q.type === "checkbox" && q.options && (
                <Controller
                  name={q.id}
                  control={control}
                  render={({ field }) => {
                    // 🔒 型別窄化：只在 value 是陣列時使用，否則給空陣列
                    const values = Array.isArray(field.value) ? (field.value as string[]) : [];

                    const toggle = (checked: boolean, optionValue: string) => {
                      const set = new Set(values);
                      if (checked) set.add(optionValue);
                      else set.delete(optionValue);
                      field.onChange(Array.from(set));
                    };

                    return (
                      <div className="flex flex-col gap-1">
                        {q.options!.map((opt) => {
                          const isChecked = values.includes(opt.value);
                          return (
                            <label key={opt.value} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => toggle(e.target.checked, opt.value)}
                                disabled={loading}
                              />
                              {opt.label}
                            </label>
                          );
                        })}
                      </div>
                    );
                  }}
                />
              )}

              {/* Checkbox: single boolean */}
              {q.type === "checkbox" && !q.options && (
                <Controller
                  name={q.id}
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        disabled={loading}
                      />
                      {q.label}
                    </label>
                  )}
                />
              )}

              {/* Image Select */}
              {q.type === "image-select" && formData.thumbnails && (
                <Controller
                  name={q.id}
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {formData.thumbnails!.map((thumb) => {
                        const selected = String(field.value ?? "") === thumb.id;
                        return (
                          <button
                            key={thumb.id}
                            type="button"
                            onClick={() => field.onChange(thumb.id)}
                            className={`relative border rounded-lg overflow-hidden transition-all hover:shadow-md ${
                              selected ? "ring-2 ring-blue-500 border-blue-500" : "border-gray-300"
                            }`}
                            disabled={loading}
                          >
                            <Image
                              src={thumb.url}
                              alt={thumb.title}
                              width={400}
                              height={225}
                              className="w-full h-auto object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              )}

              {/* Multi-text */}
              {q.type === "multi-text" && (
                <Controller
                  name={q.id}
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => {
                    const values: string[] = Array.isArray(field.value) ? field.value : [];

                    const handleChange = (index: number, value: string) => {
                      const updated = [...values];
                      updated[index] = value;
                      field.onChange(updated);
                    };

                    const addQuestion = () => {
                      if (values.length < (q.max ?? 5)) {
                        field.onChange([...values, ""]);
                      }
                    };

                    const removeQuestion = (index: number) => {
                      const updated = [...values];
                      updated.splice(index, 1);
                      field.onChange(updated);
                    };

                    return (
                      <div className="space-y-2">
                        {values.map((val, i) => (
                          <div key={i} className="flex gap-2">
                            <Input
                              placeholder={q.placeholder || `Question ${i + 1}`}
                              value={val}
                              onChange={(e) => handleChange(i, e.target.value)}
                              disabled={loading}
                            />
                            <button
                              type="button"
                              className="px-2 rounded border"
                              onClick={() => removeQuestion(i)}
                              disabled={values.length <= (q.min ?? 1)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="px-3 py-1 rounded border"
                          onClick={addQuestion}
                          disabled={values.length >= (q.max ?? 5)}
                        >
                          <Plus />
                        </button>
                      </div>
                    );
                  }}
                />
              )}

              {/* Title Select */}
              {q.type === "title-select" && formData.thumbnails && (
                <Controller
                  name={q.id}
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formData.thumbnails!.map((thumb) => {
                        const isSelected = String(field.value ?? "") === thumb.id;
                        return (
                          <button
                            key={thumb.id}
                            type="button"
                            onClick={() => field.onChange(thumb.id)}
                            className={`border rounded-lg p-3 text-left transition-all hover:shadow-md ${
                              isSelected ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-300"
                            }`}
                            disabled={loading}
                          >
                            <p className={`mt-1 text-shadow-2xs ${isSelected ? "font-semibold text-blue-700" : "font-normal text-gray-800"}`}>
                              {thumb.title}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              )}

              {/* Date */}
              {q.type === "date" && (
                <Controller
                  control={control}
                  name={q.id}
                  render={({ field }) => {
                    const valueStr = typeof field.value === "string" ? field.value : undefined;
                    return (
                      <DatePicker
                        value={valueStr ? new Date(valueStr) : undefined}
                        onChange={(date) => field.onChange(date?.toISOString())}
                      />
                    );
                  }}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GeneralQuestionaire;
