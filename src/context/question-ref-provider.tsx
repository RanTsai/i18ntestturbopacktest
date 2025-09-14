// context/question-ref-provider.tsx
"use client";

import { useRef } from "react";
import { QuestionRefContext, type QuestionRefMap } from "@/context/question-ref-context";

export default function QuestionRefProvider({ children }: { children: React.ReactNode }) {
  const questionRefs = useRef<QuestionRefMap>({});
  return (
    <QuestionRefContext.Provider value={questionRefs}>
      {children}
    </QuestionRefContext.Provider>
  );
}
