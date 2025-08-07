// app/[locale]/(private)/humanreviewdesign/human-review-sidebar.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ChevronDown, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useQuestionnaireStore } from '@/lib/global-store/human-review-questionaire-store'
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { UseLoadChannels } from "@/hooks/loading-user-data/load-channels"
import useTranslationStore from "@/lib/global-store/use-translation-store"
import { PageTranslations } from "@/i18n/interface"
import { useQuestionRefContext } from "@/context/question-ref-context"
import MyChannelSelector from "@/components/upload/channel-selector"
import UserChannelStore from "@/lib/global-store/user-channel-store"
import useReviewFilterStore from "@/lib/global-store/human-review-filter-store"
interface Props {
  pageId: string;
  setShowSidebar?: (open: boolean) => void;
  fallbackTranslations?: PageTranslations;
}

export default function QuestionaireBuilderSideBar({
  pageId,
  setShowSidebar,
  fallbackTranslations,
}: Props) {
  const {
    questions,
    deleteQuestion,
    reorderQuestions,
    updateQuestion,
    editingId,
  } = useQuestionnaireStore()

  const {
    userChannels,
    setChannels,
    selectedChannel,
    setSelectedChannel,
  } = UserChannelStore()

  const {
        selectedMyChannelId,
        selectedFollowingChannelId,
        activeFilterGroup,
        setMyChannel,
        setFollowingChannel,
    } = useReviewFilterStore()

  const { getTranslation, setTranslation } = useTranslationStore()
  const [translations, setTranslations] = useState<PageTranslations | null>(null)
  const [isUserDefinedQuestionaireExpanded, setExpanded] = useState(true)
  const [isGeneralQuestionaireExpanded, setGeneralExpanded] = useState(true)
  const questionRefs = useQuestionRefContext()

  const [isMyChannelsExpanded, setMyChannelsExpanded] = useState(true)
  const { locale } = useParams() as { locale: string }

  const sensors = useSensors(useSensor(PointerSensor))

  UseLoadChannels()

  useEffect(() => {
    const cached = getTranslation(pageId, locale)
    if (cached) {
      setTranslations(cached)
    } else if (fallbackTranslations) {
      setTranslation(pageId, locale, fallbackTranslations)
      setTranslations(fallbackTranslations)
    }
  }, [locale, fallbackTranslations])

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = questions.findIndex((q) => q.id === active.id)
    const newIndex = questions.findIndex((q) => q.id === over.id)
    reorderQuestions(oldIndex, newIndex)
  }

  const handleRename = (id: string, newLabel: string) => {
    updateQuestion(id, { label: newLabel })
  }

  const scrollToQuestion = (id: string) => {
    console.log('🟣 Scroll to', id, questionRefs.current?.[id]);

    questionRefs.current?.[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  return (
    <div className="sticky top-0 w-64 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col p-4 space-y-4 ">
      <nav className="flex-1 flex flex-col space-y-2">
        {/* General 設定區塊 */}
        <div className="w-full">
          <div
            className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
            onClick={() => setGeneralExpanded(!isGeneralQuestionaireExpanded)}
          >
            <span className="text-sm font-medium">
              {translations?.review_settings?.translation ?? "Settings"}
            </span>
            {isGeneralQuestionaireExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
          <AnimatePresence initial={false}>
            {isGeneralQuestionaireExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pl-4 text-sm text-muted-foreground space-y-1"
              >
                <div className="cursor-pointer hover:underline" onClick={() => scrollToQuestion("general:form")}>{translations?.deadline_setting?.translation ?? "Deadline"}</div>
                {/* <div className="cursor-pointer hover:underline" onClick={() => scrollToQuestion("general:form")}>{translations?.audience_setting?.translation ?? "Target Audience"}</div> */}
                <div className="cursor-pointer hover:underline" onClick={() => scrollToQuestion("general:form")}>{translations?.visibility_setting?.translation ?? "Visibility"}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* My Channels */}
        <div className="w-full">
          <MyChannelSelector
            expanded={isMyChannelsExpanded}
            setExpanded={setMyChannelsExpanded}
            userChannels={userChannels ?? []}
            setSelectedChannel={setSelectedChannel}
            pageId={pageId}
            selectedId={selectedMyChannelId ? String(selectedMyChannelId) : null}
            setSelectedId={(id: string | null) => setMyChannel(id ? Number(id) : null)}
            setMyChannel={setMyChannel}
          />
        </div>

        {/* 用戶自訂問題 */}
        <div className="w-full">
          <div
            className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
            onClick={() => setExpanded(!isUserDefinedQuestionaireExpanded)}
          >
            <span className="text-sm font-medium">
              {translations?.explore_section?.translation ?? "Your Questionnaire"}
            </span>
            {isUserDefinedQuestionaireExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>

          <AnimatePresence initial={false}>
            {isUserDefinedQuestionaireExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                    {questions.map((q) => (
                      <SortableSidebarItem
                        key={q.id}
                        id={q.id}
                        label={q.label}
                        isActive={editingId === q.id}
                        onClick={() => scrollToQuestion(q.id)}
                        onDelete={() => deleteQuestion(q.id)}
                        onRename={(newLabel) => handleRename(q.id, newLabel)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <div className="text-xs text-muted-foreground mt-auto">
        © 2025 Mr. Click
      </div>
    </div>
  )
}
