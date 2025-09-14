import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Question } from '../schema/questionaire-schema'

interface QuestionnaireState {
  questions: Question[]
  setQuestions: (questions: Question[]) => void
  addQuestion: (question: Question) => void
  updateQuestion: (id: string, partial: Partial<Question>) => void
  deleteQuestion: (id: string) => void
  reorderQuestions: (fromIndex: number, toIndex: number) => void
  editingId: string | null
  setEditingId: (id: string | null) => void
}

// ✅ 切換這個變數即可
const useSessionStorage = true;


export const useQuestionnaireStore = create<QuestionnaireState>()(

  persist(
    (set, get) => ({
      questions: [],
      setQuestions: (questions) => {
        const safe = Array.isArray(questions) ? questions : [];
        console.log("[useQuestionnaireStore] setQuestions called:", questions);
        console.log("[useQuestionnaireStore] normalized to:", safe);
        set({ questions: safe });
      },

      addQuestion: (question) => set({ questions: [...get().questions, question] }),
      updateQuestion: (id, partial) =>
        set({
          questions: get().questions.map((q) =>
            q.id === id ? { ...q, ...partial } : q
          ),
        }),
      deleteQuestion: (id) =>
        set({
          questions: get().questions.filter((q) => q.id !== id),
        }),
      reorderQuestions: (fromIndex, toIndex) => {
        const items = [...get().questions]
        const [moved] = items.splice(fromIndex, 1)
        items.splice(toIndex, 0, moved)
        set({ questions: items })
      },
      editingId: null,
      setEditingId: (id) => set({ editingId: id }),
    }),
    {
      name: 'questionnaire-storage',
      storage: createJSONStorage(() =>
        useSessionStorage ? sessionStorage : localStorage
      ),
    }
  )
)
