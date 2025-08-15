//components/ui/forms/general-questionaire.
"use client";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Controller, UseFormRegister, Control } from "react-hook-form";
import { Star, Plus } from "lucide-react";
import { useState } from "react";
import { FormSchema } from "@/lib/schema/questionaire-schema";
import { DatePicker } from "../date-picker";
interface Props {
  formData: FormSchema;
  loading: boolean;
  onSubmit: (data: any) => void;
  control: Control<any>;
  register: UseFormRegister<any>;
  displaySubmit?: boolean;
}

const GeneralQuestionaire = ({
  formData,
  loading,
  onSubmit,
  control,
  register,
  displaySubmit = false
}: Props) => {


  return (
    <div className="max-w-2xl mx-auto space-y-10">
      {/* Branding Information from JSON */}
      {formData.channel_name && (
        <div className="flex flex-col items-center text-center space-y-3">
          {formData.channel_logo && (
            <img
              src={formData.channel_logo}
              alt={`${formData.channel_name} logo`}
              className="w-20 h-20 object-cover rounded-md border shadow-sm"
            />
          )}
          <h2 className="text-xl font-semibold text-gray-900">
            {formData.channel_name}
          </h2>
          {formData.channel_description && (
            <p className="text-sm text-gray-600 max-w-md">
              {formData.channel_description}
            </p>
          )}
        </div>
      )}

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

              {/* Text input */}
              {q.type === "text" && (
                <Input placeholder={q.placeholder} {...register(q.id)} />
              )}

              {/* Radio group */}
              {q.type === "radio" && q.options && (
                <Controller
                  control={control}
                  name={q.id}
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      {q.options!.map((opt) => (
                        <div key={`${q.id}_${opt.value}`} className="flex items-center gap-2">
                          <RadioGroupItem
                            key={opt.value}
                            value={opt.value}
                            id={`${q.id}-${opt.value}`}
                          />
                          <label htmlFor={`${q.id}-${opt.value}`}>{opt.label}</label>
                        </div>
                      ))}
                    </RadioGroup>

                  )}
                />
              )}

              {/* Rating stars */}
              {q.type === "rating" && (
                <Controller
                  name={q.id}
                  control={control}
                  render={({ field }) => {
                    const scale = q.scale || 5;
                    const currentValue = parseInt(field.value || "0");
                    const [hoverValue, setHoverValue] = useState<number | null>(null);

                    return (
                      <div className="flex gap-1">
                        {[...Array(scale)].map((_, i) => {
                          const value = i + 1;
                          const isFilled = hoverValue !== null
                            ? value <= hoverValue
                            : value <= currentValue;

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => field.onChange(value.toString())}
                              onMouseEnter={() => setHoverValue(value)}
                              onMouseLeave={() => setHoverValue(null)}
                              className="p-0 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                            >
                              <Star
                                className={`w-6 h-6 ${isFilled
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                                  }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    );
                  }}
                />
              )}

              {/* Checkbox: multiple */}
              {q.type === "checkbox" && q.options && (
                <Controller
                  name={q.id}
                  control={control}
                  render={({ field }) => {
                    const values = field.value || [];
                    return (
                      <div className="flex flex-col gap-1">
                        {q.options!.map((opt) => {
                          const isChecked = values.includes(opt.value);
                          return (
                            <label key={opt.value} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const newValue = [...values];
                                  if (e.target.checked) {
                                    newValue.push(opt.value);
                                  } else {
                                    const index = newValue.indexOf(opt.value);
                                    if (index > -1) newValue.splice(index, 1);
                                  }
                                  field.onChange(newValue);
                                }}
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
              {q.type === "textarea" && (
                <Textarea placeholder={q.placeholder} {...register(q.id)} />
              )}

              {q.type === "number" && (
                <Input
                  type="number"
                  step={1} // 限定為整數
                  placeholder={q.placeholder}
                  {...register(q.id, { valueAsNumber: true })}
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
                      />
                      {q.label}
                    </label>
                  )}
                />
              )}



              {/* Thumbnail Select */}
              {q.type === "image-select" && formData.thumbnails && (
                <Controller
                  name={q.id}
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {formData.thumbnails!.map((thumb) => (
                        <button
                          key={thumb.id}
                          type="button"
                          onClick={() => field.onChange(thumb.id)}
                          className={`relative border rounded-lg overflow-hidden transition-all hover:shadow-md ${field.value === thumb.id
                            ? "ring-2 ring-blue-500 border-blue-500"
                            : "border-gray-300"
                            }`}
                        >
                          <img src={thumb.url} alt={thumb.url} className="w-full object-cover" />

                          {/* <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-sm p-1 text-center">
                            {thumb.title}
                          </div> */}
                        </button>
                      ))}
                    </div>
                  )}
                />
              )}

              {q.type === "multi-text" && (
                <Controller
                  name={q.id}
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => {
                    const values: string[] = field.value || [];
                    const handleChange = (index: number, value: string) => {
                      const updated = [...values];
                      updated[index] = value;
                      field.onChange(updated);
                    };

                    const addQuestion = () => {
                      if (values.length < (q.max || 5)) {
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
                            />
                            <Button
                              variant="ghost"
                              onClick={() => removeQuestion(i)}
                              disabled={values.length <= (q.min || 1)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="secondary"
                          onClick={addQuestion}
                          disabled={values.length >= (q.max || 5)}
                        >
                          <Plus />
                        </Button>
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
                        const isSelected = field.value === thumb.id;
                        return (
                          <button
                            key={thumb.id}
                            type="button"
                            onClick={() => field.onChange(thumb.id)}
                            className={`border rounded-lg p-3 text-left transition-all hover:shadow-md ${isSelected
                              ? "border-blue-500 ring-2 ring-blue-300"
                              : "border-gray-300"
                              }`}
                          >
                            <p
                              className={`mt-1 text-shadow-2xs ${isSelected ? "font-semibold text-blue-700" : "font-normal text-gray-800"
                                }`}
                            >
                              {thumb.title}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              )}

              {/* Date Picker */}
              {q.type === "date" && (
                <Controller
                  control={control}
                  name={q.id}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date?.toISOString())}
                    />
                  )}
                />
              )}
            </div>
          ))}
        </div>
      ))}

      {displaySubmit && (
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Submitting..." : "Submit"}
        </Button>
      )}
    </div>
  );
};

export default GeneralQuestionaire;
