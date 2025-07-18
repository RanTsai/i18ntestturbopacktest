"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OptionEditor } from "./option-editor";
import { ReviewQuestion, QuestionType } from "@/lib/schema/review-question";
import { MoreVertical, Star, Copy } from "lucide-react";
import { useState } from "react";

interface Props {
  question: ReviewQuestion;
  index: number;
  onChange: (id: string, updated: Partial<ReviewQuestion>) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void; // 加入這一行
}

export const QuestionCard = ({
  question,
  index,
  onChange,
  onDelete,
  onCopy
}: Props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedStar, setSelectedStar] = useState<number>(0);

  return (
    <div className="rounded-md p-4 bg-white space-y-3 relative shadow-sm border border-transparent hover:border-gray-300 transition">
      <div className="flex justify-between items-start">
        <Label className="text-sm">Question {index + 1}</Label>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(question.id)} // ← 複製
            className="text-blue-500"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(question.id)} // ← 刪除
            className="text-red-500"
          >
            ✕
          </Button>
        </div>
      </div>
      {/* 題目標籤輸入 + 下拉按鈕組合 */}
      <div className="relative group flex items-center gap-2">
        <Input
          className="border border-transparent hover:border-gray-300 focus:border-gray-500 transition w-full"
          placeholder="Enter your question"
          value={question.label}
          onChange={(e) => onChange(question.id, { label: e.target.value })}
        />

        {/* Hover 顯示的 3-dots 按鈕 */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDropdown((prev) => !prev)}
            className="opacity-60 hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>

          {showDropdown && (
            <div className="absolute right-0 mt-1 z-10 bg-white border border-gray-200 rounded shadow w-56">
              {[
                { value: "text", label: "Text Input" },
                { value: "textarea", label: "Textarea" },
                { value: "rating", label: "Rating (Stars)" },
                { value: "radio", label: "Radio (Single Select)" },
                { value: "checkbox", label: "Checkbox (Multi Select)" },
              ].map((opt) => {
                const isActive = opt.value === question.type;

                return (
                  <div
                    key={opt.value}
                    className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer ${isActive ? "font-medium text-gray-900" : "text-gray-600"
                      }`}
                    onClick={() => {
                      const newType = opt.value as QuestionType;
                      onChange(question.id, {
                        type: newType,
                        options:
                          newType === "radio" || newType === "checkbox"
                            ? question.options || []
                            : undefined,
                      });
                      setShowDropdown(false);
                    }}
                  >
                    <span className="w-4 text-green-500">
                      {isActive ? "✔" : ""}
                    </span>
                    <span>{opt.label}</span>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* 顯示選項編輯（只有 radio/checkbox 類型） */}
      {(question.type === "radio" || question.type === "checkbox") && (
        <>
          <OptionEditor
            options={question.options || []}
            onChange={(newOptions) =>
              onChange(question.id, { options: newOptions })

            }
            questionType={question.type}
          />
        </>
      )}

      {question.type === "rating" && (
        <div className="mt-3">
          <div className="flex gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const starIndex = i + 1;
              const isActive =
                hoveredStar !== null ? starIndex <= hoveredStar : starIndex <= selectedStar;

              return (
                <Star
                  key={i}
                  onMouseEnter={() => setHoveredStar(starIndex)}
                  onMouseLeave={() => setHoveredStar(null)}
                  onClick={() => setSelectedStar(starIndex)}
                  className={`w-6 h-6 cursor-pointer transition ${isActive
                    ? "text-yellow-400 stroke-yellow-500 fill-yellow-300"
                    : "text-gray-300 stroke-gray-400 fill-white"
                    }`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 預覽文字輸入框或 textarea */}
      {question.type === "text" && (
        <div className="mt-3">
          <Input
            placeholder="enter text"
            className="mt-1 border border-gray-300"
            readOnly
          />
        </div>
      )}

      {question.type === "textarea" && (
        <div className="mt-3">
          <textarea
            placeholder="enter multiline text"
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm resize-none"
            rows={3}
            readOnly
          />
        </div>
      )}

      {/* 是否必填 */}
      <label className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          checked={question.required}
          onChange={(e) =>
            onChange(question.id, { required: e.target.checked })
          }
        />
        Required
      </label>
    </div>
  );
};
