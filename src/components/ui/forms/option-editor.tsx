"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OptionItem, QuestionType } from "@/lib/schema/questionaire-schema";
import React, { useState } from "react";

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
      {/* <Label className="text-sm">Options</Label> */}
      {options.map((opt, i) => (
        <div key={opt.value} className="flex gap-2 items-center">
          <input
            type={questionType}
            checked={selected.includes(opt.value)}
            onChange={() => handleSelect(opt.value)}
          />
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
