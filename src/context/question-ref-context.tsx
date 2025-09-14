// context/question-ref-context.ts
import { createContext, useContext, type RefObject } from "react";

export type QuestionRefMap = Record<string, HTMLElement | null>;

export const QuestionRefContext = createContext<RefObject<QuestionRefMap> | null>(null);

export const useQuestionRefContext = () => {
  const context = useContext(QuestionRefContext);
  if (!context) throw new Error("useQuestionRefContext must be used within a QuestionRefContext.Provider");
  return context;
};
