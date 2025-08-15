"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OptionItem, QuestionType } from "@/lib/schema/questionaire-schema";
import React, { useState } from "react";
import { X, Plus } from "lucide-react";

interface Props {
  options: OptionItem[];
  onChange: (updated: OptionItem[]) => void;
  questionType: QuestionType; // "radio" | "checkbox"
}

export const OptionEditor = ({ options, onChange, questionType }: Props) => {
  const [selected, setSelected] = useState<string[]>([]);

  const updateOption = (index: number, label: string) => {
    const updated = [...options];
    updated[index].label = label;
    onChange(updated);
  };

  const addOption = () => {
    onChange([
      ...options,
      {
        value: crypto.randomUUID(),
        label: "",
      } as OptionItem,
    ]);
  };

  const removeOption = (index: number) => {
    const updated = [...options];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleSelect = (id: string) => {
    if (questionType === "radio") {
      setSelected([id]);
    } else {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  };

  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <div key={opt.value} className="flex gap-2 items-center">
          <input
            type={questionType}
            className="accent-purple-600  "
            checked={selected.includes(opt.value)}
            onChange={() => handleSelect(opt.value)}
            // name 確保 radio 在瀏覽器層級互斥（即便你用 state 控制）
            name="option-editor-group"
          />
          <Input
            className="flex-1 min-w-0 input-interactive hover:!border-purple-300 focus:!border focus:!border-purple-500 focus:!ring-purple-500"
            placeholder={`Option ${i + 1}`}
            value={opt.label}
            onChange={(e) => updateOption(i, e.target.value)}
          />

          <Button variant="ghost" size="sm" onClick={() => removeOption(i)}>
            <X size={14} />
          </Button>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={addOption}>
        <Plus size={14} />
      </Button>
    </div>
  );
};
