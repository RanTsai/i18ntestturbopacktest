import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Question } from "@/lib/schema/questionaire-schema"
import { useParams } from "next/navigation";
import useTranslationStore from "@/lib/global-store/use-translation-store";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export function EditableTitleOptions({
  pageId,
  question,
  onChange,
}: {
  pageId: string
  question: Question
  onChange: (id: string, updated: Partial<Question>) => void
}) {
  const { locale } = useParams() as { locale: string }

  const { getTranslation } = useTranslationStore();
  const translations = getTranslation(pageId, locale) || {};
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const options = question.options || []

  const handleSave = () => {
    if (editingIndex !== null) {
      const updated = [...options]
      updated[editingIndex] = {
        ...updated[editingIndex],
        label: editingValue,
      }
      onChange(question.id, { options: updated })
      setEditingIndex(null)
      setEditingValue("")
    }
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setEditingValue("")
  }

  const handleAdd = () => {
    if (options.length >= 4) {
      toast.error(translations?.max_four_titles?.translation ?? "The max number you can add is 4")
      return
    }
    const newOption = {
      value: `opt_${crypto.randomUUID()}`,
      label: translations?.new_title?.translation ?? "New Title",
    }
    onChange(question.id, { options: [...options, newOption] })
  }

  return (
    <div className="space-y-2 mt-3">
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, index) => {
          const isSelected = question.placeholder === opt.value
          const isEditing = editingIndex === index

          return (
            <div
              key={opt.value}
              tabIndex={0}
              onClick={() => {
                if (!isEditing) onChange(question.id, { placeholder: opt.value })
              }}
              onDoubleClick={() => {
                setEditingIndex(index)
                setEditingValue(opt.label)
              }}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              onKeyDown={(e) => {
                if (!isEditing && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault()
                  onChange(question.id, { placeholder: opt.value })
                }
              }}
              className={`relative p-3 text-sm rounded-md transition cursor-pointer
                          input-interactive
                          hover:!border-purple-300 focus:!border-purple-500 focus:!ring-purple-500
                          ${isSelected ? "!border-2 !border-purple-500 bg-purple-50" : "border-gray-200"}`}
            >
              {isEditing ? (
                <Input
                  autoFocus
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave()
                    if (e.key === "Escape") handleCancel()
                  }}
                  onBlur={handleCancel}
                  className="input-interactive hover:!border-purple-300 focus:!border-purple-500 focus:!ring-purple-500"
                />
              ) : (
                <TooltipProvider >
                  <Tooltip delayDuration={800}>
                    <TooltipTrigger asChild>
                      <span>{opt.label}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {translations?.title_input?.tooltip ?? "Double Click to edit"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {hoverIndex === index && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const updated = options.filter((_, i) => i !== index)
                    onChange(question.id, { options: updated })
                    if (question.placeholder === opt.value) {
                      onChange(question.id, { placeholder: updated[0]?.value || "" })
                    }
                  }}
                  className="absolute top-1 right-1 p-1 text-red-500 hover:text-red-700"
                  aria-label="Delete title"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {options.length < 4 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={handleAdd}
        >
          <Plus size={14} className="mr-1" />
        </Button>
      )}
    </div>
  )
}
