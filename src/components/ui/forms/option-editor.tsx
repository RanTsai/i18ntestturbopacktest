// components/question-builder/OptionEditor.tsx
"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Option, QuestionType } from "@/lib/schema/review-question";

interface Props {
  options: Option[];
  onChange: (updated: Option[]) => void;
  questionType: QuestionType; // 🆕 加這行

}

export const OptionEditor = ({ options, onChange, questionType }: Props) => {
  const updateOption = (index: number, label: string) => {
    const updated = [...options];
    updated[index].label = label;
    onChange(updated);
  };

  const addOption = () => {
    onChange([
      ...options,
      {
        id: crypto.randomUUID(),
        label: "",
      } as Option,
    ]);
  };

  const removeOption = (index: number) => {
    const updated = [...options];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm">Options</Label>
      {options.map((opt, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input type={questionType} onClick={(e) => e.preventDefault()} />

          <Input
            className="border border-transparent hover:border-gray-300 focus:border-gray-500 transition"
            placeholder={`Option ${i + 1}`}
            value={opt.label}
            onChange={(e) => updateOption(i, e.target.value)}
          />
          <Button variant="ghost" size="sm" onClick={() => removeOption(i)}>
            ✕
          </Button>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={addOption}>
        + Add Option
      </Button>
    </div>
  );
};
