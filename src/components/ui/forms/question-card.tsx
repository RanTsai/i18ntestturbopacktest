"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OptionEditor } from "./option-editor";
import { Question, QuestionType } from "@/lib/schema/questionaire-schema";
import { MoreVertical, Star, Copy, GripVertical, X } from "lucide-react";
import { useState } from "react";
import { EditableTitleOptions } from "./editable-title-options";
import { EditableImageOptions } from "./editable-image-options";
import { useParams } from "next/navigation";
import useTranslationStore from "@/lib/global-store/use-translation-store";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface Props {
  pageId: string,
  question: Question;
  index: number;
  onChange: (id: string, updated: Partial<Question>) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>; // ✅ 新增
  onFocus?: () => void;
}

export const QuestionCard = ({
  pageId,
  question,
  index,
  onChange,
  onDelete,
  onCopy,
  dragHandleProps, // ✅ 傳入
  onFocus
}: Props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedStar, setSelectedStar] = useState<number>(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const { locale } = useParams() as { locale: string }

  const { getTranslation } = useTranslationStore();
  const translations = getTranslation(pageId, locale) || {};

  return (
    <div className="rounded-md p-4 bg-white space-y-3 relative shadow-sm border border-transparent hover:border-gray-300 transition">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          {/* ✅ 拖曳手把，只這邊綁拖曳 */}
          <span
            {...dragHandleProps}
            className="text-gray-400 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </span>
          <Label className="text-sm">{translations?.question?.translation ?? "Question"} {index + 1}</Label>
        </div>

        <div className="flex gap-1">
          <div className="flex gap-1">
            <TooltipProvider >
              <Tooltip delayDuration={800}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(question.id)}
                    className="text-blue-500"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent >{translations?.copy_question_button?.tooltip ?? "Duplicate this question below"}</TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={800}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(question.id)}
                    className="text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{translations?.delete_question_button?.tooltip ?? "Delete this question, this cannot be undone"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* 題目輸入 + 選單 */}
      <div className="relative group flex items-center gap-2">
        <Input
          className="border border-transparent hover:border-gray-300 focus:border-gray-500 transition w-full"
          placeholder="Enter your question"
          value={question.label}
          onChange={(e) => onChange(question.id, { label: e.target.value })}
        />

        {/* 3-dot dropdown */}
        <div className="relative">
          <TooltipProvider >
            <Tooltip delayDuration={800}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="opacity-60 hover:opacity-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{translations?.question_type_button?.tooltip ?? "Select the format for this question"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
                    className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer ${isActive
                      ? "font-medium text-gray-900"
                      : "text-gray-600"
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

      {/* 顯示選項編輯 */}
      {
        (question.type === "radio" || question.type === "checkbox") && (
          <OptionEditor
            options={question.options || []}
            onChange={(newOptions) => {
              const update: Partial<Question> = { options: newOptions }

              if (
                question.type === "radio" &&
                newOptions.length > 0 &&
                !question.placeholder
              ) {
                update.placeholder = newOptions[0]?.value || ""
              }
              onChange(question.id, update)
            }}
            questionType={question.type}
          />
        )
      }

      {
        question.type === "image-select" && question.options && (
          <EditableImageOptions pageId={pageId} question={question} onChange={onChange} key={question.id} />
        )
      }

      {
        question.type === "title-select" && question.options && (
          <EditableTitleOptions pageId={pageId} question={question} onChange={onChange} key={question.id} />
        )
      }


      {
        question.type === "rating" && (
          <div className="mt-1">
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const starIndex = i + 1;
                const isActive =
                  hoveredStar !== null
                    ? starIndex <= hoveredStar
                    : starIndex <= selectedStar;

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
        )
      }

      {
        question.type === "text" && (
          <div className="mt-1">
            <Input
              placeholder="enter text"
              value={question.placeholder ?? ""}
              onChange={(e) =>
                onChange(question.id, { placeholder: e.target.value })
              }
              className="mt-1 border border-gray-300"
            />
          </div>
        )
      }

      {
        question.type === "textarea" && (
          <div className="mt-1">
            <textarea
              placeholder="enter multiline text"
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm resize-none"
              rows={3}
              readOnly
            />
          </div>
        )
      }

      <TooltipProvider>
        <label className="flex items-center gap-2 pt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) =>
              onChange(question.id, { required: e.target.checked })
            }
          />
          <Tooltip delayDuration={800}>
            <TooltipTrigger asChild>
              <span>
                {translations?.required?.translation ?? "Required"}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {translations?.required?.tooltip ??
                "Tick to mark it non-optional, the rater must answer this question"}
            </TooltipContent>
          </Tooltip>
        </label>
      </TooltipProvider>

    </div >
  );
};
