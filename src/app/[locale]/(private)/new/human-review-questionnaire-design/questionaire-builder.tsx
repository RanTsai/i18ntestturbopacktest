// ./questionaire-builder.tsx
"use client";

import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Question } from "@/lib/schema/questionaire-schema";
import { QuestionCard } from "@/components/ui/forms/question-card";
import GeneralQuestionaire from "./general-questionare";
import { useQuestionnaireEditorViewModel } from "@/lib/view-models/use-questionnaire-edit-view-model";
import { Plus, RedoIcon, UndoIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTranslations } from "@/i18n/interface";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useQuestionRefContext } from "@/context/question-ref-context";
import { mockQuestions, formData } from "./mockQuestions";
import { toast } from "sonner";
import { useQuestionnaireSubmitViewModel } from "@/lib/view-models/use-questionnaire-submit-view-model";
import { useHumanReviewBundleViewModel } from "@/lib/view-models/use-human-review-bundle-view-model";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableItem from "@/components/ui/forms/sortable-item";
import Image from "next/image";
import { useParams } from "next/navigation";
import { HumanReviewBundle } from '@/lib/view-models/use-human-review-view-model';
import { useUserChannelViewModel } from "@/lib/view-models/use-user-channel-view-model";

interface Props {
  translations: PageTranslations;
  editingHumanReview?: HumanReviewBundle | null; // 👈 可能有初始資料（編輯模式）
}

export default function QuestionnaireBuilder({ translations, editingHumanReview }: Props) {
  const questionRefs = useQuestionRefContext();

  const pageId = "human_review_design_page";
  const params = useParams() as { locale?: string; public_id?: string };
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  const existingPublicId = params?.public_id || null;

  const suppressAutoForkRef = useRef(false);
  const didInitRef = useRef(false);

  // 判斷模式：有 public_id → 編輯；沒有 → 新增
  const mode: "create" | "edit" = useMemo(
    () => (existingPublicId ? "edit" : "create"),
    [existingPublicId]
  );

  // 建立 RHF 預設值
  const defaultValues: Record<string, any> = {};
  formData.sections.forEach((section) => {
    section.questions.forEach((q) => {
      if (q.type === "radio" && q.options?.length) defaultValues[q.id] = q.options[0].value;
      else if (q.type === "checkbox" && !q.options) defaultValues[q.id] = false;
      else if (q.type === "multi-text") defaultValues[q.id] = [];
      else if (q.type === "rating") defaultValues[q.id] = "0";
      else if (q.type === "number") defaultValues[q.id] = ''  ;
    });
  });

  const { control, register, handleSubmit, getValues, reset, watch } = useForm<Record<string, any>>({
    defaultValues,
  });

  const { selectedChannel, setSelectedChannelByName } = useUserChannelViewModel();

  const {
    initWithBundle,
    activeVersionIndex,
    questionsForActive,
    formValuesForActive,
    beginEditOnActive,
    beginMetaEditOnActive
    // ⛔️ 不再直接使用 ensureEditableHeadFrom；統一走 beginEditOnActive
  } = useHumanReviewBundleViewModel();

  useEffect(() => {
    if (didInitRef.current) return;
    if (editingHumanReview) {
      didInitRef.current = true;
      initWithBundle(editingHumanReview as any);
    }
  }, [editingHumanReview, initWithBundle]);

  /** 僅在 edit mode 生效：
   * 任何想把 Editor 的題目狀態同步回 bundle 時，統一走這個入口。
   * 第一次進來時（尚未 dirty），beginEditOnActive 會自動 fork 成本地 draft。
   */
  function pushEditorQuestionsToBundle(nextQuestions: Question[]) {
    if (mode !== "edit") return; // ✅ create mode 不動 bundle
    beginEditOnActive((prevQnr: any) => {
      const base = Array.isArray(prevQnr?.questions) ? prevQnr : { questions: [] };
      return { ...base, questions: nextQuestions };
    });
    // beginEditOnActive / applyLatestEdits 內部已 set dirty=true；這裡不必重複
  }

  const { initFromServer, resetHistory } = useQuestionnaireEditorViewModel(pageId, {
    // 用你的 publicId/version 組 key：最新可用 "latest"，舊版用實際號碼
    publicId: editingHumanReview?.review?.public_id ?? null,
    version:
      (activeVersionIndex != null &&
        (editingHumanReview?.versions?.[activeVersionIndex]?.version_number ?? "latest")) || "latest",
  });


  useEffect(() => {
    if (activeVersionIndex == null) return;

    // 🚫 切版注入鎖
    suppressAutoForkRef.current = true;

    resetHistory();
    initFromServer(questionsForActive);
    reset(formValuesForActive as any, { keepDirty: false });

    const channelName = editingHumanReview?.thumbnail?.user_channel_name;
    if (channelName) setSelectedChannelByName(channelName);

    // 🔓 兩層 raf，確保受控元件已完成 programmatic 更新
    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        suppressAutoForkRef.current = false;
      });
    });

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  //}, [activeVersionIndex, questionsForActive, formValuesForActive]);
    }, [activeVersionIndex]);



  const {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    setQuestions,
    setEditingId,
    undo,
    redo,
    canUndo,
    canRedo,

  } = useQuestionnaireEditorViewModel(pageId);

  const { UploadHumanReview } = useQuestionnaireSubmitViewModel();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 追蹤最新的 questions（避免 setState 非同步導致讀不到最新）
  const latestQuestionsRef = useRef<Question[]>(questions);
  useEffect(() => { latestQuestionsRef.current = questions; }, [questions]);

  // ---- 監看 GeneralQuestionaire 的任意變更 → 在 edit mode 觸發本地 draft（不修改 questions）
  // const generalFormAll = useWatch({ control });
  // useEffect(() => {
  //   if (mode !== "edit") return;
  //   if (activeVersionIndex == null) return;

  // // ⛔ 在程式性 reset/注入期間不自動 fork
  // if (suppressAutoForkRef.current) return;

  //   // 只有「不在最新版本」或「尚未 dirty」時，才觸發 fork / draft
  //   const isOnHead = headIndex != null && activeVersionIndex === headIndex;
  //   const shouldFork = !isOnHead || !dirtyLatest;
  //   if (!shouldFork) return;

  //   // 首次變更（或正在看舊版）才觸發，避免無限更新
  // beginEditOnActive((prevQnr: any) => prevQnr ?? { questions: latestQuestionsRef.current });
  // }, [mode, generalFormAll, activeVersionIndex, headIndex, dirtyLatest, beginEditOnActive]);


  // ---------------------------
  // Adapters
  // ---------------------------
  function toEditorQuestions(bundle: HumanReviewBundle, idx: number): Question[] {
    const ver = bundle.versions?.[idx];
    const qs = (ver?.questionnaire as any)?.questions;
    if (Array.isArray(qs)) return qs as Question[];
    return []; // 防呆
  }

  function toDateInput(ts?: string | null): string | null {
    if (!ts) return null;
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function toFormValues(bundle: HumanReviewBundle, idx: number) {
    const review = bundle.review;
    const th = bundle.thumbnail ?? null;
    const ver = bundle.versions?.[idx];

    return {
      review_audience_visibility: review?.is_public ? "public" : "private",
      review_deadline_date: toDateInput(review?.closedate) ?? "",
      rater_credit_reward: ver?.credit_reward != null ? String(ver.credit_reward) : "",
      wanted_review_count: ver?.wanted_rating_count != null ? String(ver.wanted_rating_count) : "",
      additional_message_to_rater: ver?.creator_message_to_raters ?? "",
      display_channel_detail: "Yes",
      user_channel_name: th?.user_channel_name ?? "",
    };
  }

  function resolveInitialVersionIndex(bundle: HumanReviewBundle): number {
    if (!bundle?.versions?.length) return 0;
    const latestIdx = bundle.versions.findIndex((v) => v.is_latest);
    if (latestIdx >= 0) return latestIdx;
    const maxNum = Math.max(...bundle.versions.map((v) => v.version_number || 1));
    const idx = bundle.versions.findIndex((v) => v.version_number === maxNum);
    return idx >= 0 ? idx : 0;
  }

  const [versionIndex, setVersionIndex] = useState<number>(0);

  // 初次載入：若有 editingHumanReview → 以 editingHumanReview 初始化；否則 create 模式灌 mock
  useEffect(() => {
    console.log("Db data", editingHumanReview, "versions", editingHumanReview?.versions);
    if (editingHumanReview && editingHumanReview.versions?.length) {
      const initIdx = resolveInitialVersionIndex(editingHumanReview);
      console.log("initIdx", initIdx);
      setVersionIndex(initIdx);
      setQuestions(toEditorQuestions(editingHumanReview, initIdx));
      console.log("updated", questions);
      reset(toFormValues(editingHumanReview, initIdx), { keepDirty: false });

      const channelName = editingHumanReview?.thumbnail?.user_channel_name;
      if (channelName) setSelectedChannelByName(channelName);

    } else if (mode === "create" && questions.length === 0) {
      setQuestions(mockQuestions);
      reset(defaultValues, { keepDirty: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingHumanReview, mode]);

  // 切換版本：只負責更新狀態/表單（本地 editor 的資料來源）
  const handleSwitchVersion = (idx: number) => {
    if (!editingHumanReview) return;
    setVersionIndex(idx);
    setQuestions(toEditorQuestions(editingHumanReview, idx));
    reset(toFormValues(editingHumanReview, idx), { keepDirty: false });

    const channelName = editingHumanReview?.thumbnail?.user_channel_name;
    if (channelName) setSelectedChannelByName(channelName);

    toast.info(`Switched to version v${editingHumanReview.versions[idx].version_number ?? idx + 1}`);
  };

  // 顯示頻道資訊的表單控制值
  const displayChannelInfo = useWatch({
    control,
    name: "display_channel_detail",
  });

  // 假的「自動儲存」提示（每 10 秒更新一次時間）
  useEffect(() => {
    const interval = setInterval(() => setDraftSavedAt(new Date()), 10000);
    return () => clearInterval(interval);
  }, []);

  // 問題初始/保底
  useEffect(() => {
    if (questions.length === 0) {
      setQuestions(mockQuestions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]);

  // Keyboard shortcuts: Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.includes("Mac");
      const ctrlOrMeta = isMac ? e.metaKey : e.ctrlKey;
      if (ctrlOrMeta && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        else toast.error("No more undo record");
      } else if ((ctrlOrMeta && e.key === "y") || (ctrlOrMeta && e.shiftKey && e.key === "Z")) {
        e.preventDefault();
        if (canRedo) redo();
        else toast.error("No more redo record");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  // DnD
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);
    reorderQuestions(oldIndex, newIndex);
    // 將編輯器最新問題同步到 bundle（edit mode 才會生效）
    setTimeout(() => pushEditorQuestionsToBundle(latestQuestionsRef.current), 0);
  };

  const handleAddQuestion = () => {
    addQuestion({
      id: crypto.randomUUID(),
      type: "text",
      label: translations?.new_question?.translation ?? "New Question",
      required: false,
    });
    setTimeout(() => pushEditorQuestionsToBundle(latestQuestionsRef.current), 0);
  };

  const handleCopyQuestion = (id: string) => {
    const index = questions.findIndex((q) => q.id === id);
    if (index === -1) return;

    const original = questions[index];
    const copy: Question = {
      ...original,
      id: crypto.randomUUID(),
      label: original.label + " (Copy)",
    };

    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, copy);
    setQuestions(newQuestions);
    setTimeout(() => pushEditorQuestionsToBundle(latestQuestionsRef.current), 0);
  };

  const handleDeleteQuestion = (id: string) => {
    deleteQuestion(id);
    setTimeout(() => pushEditorQuestionsToBundle(latestQuestionsRef.current), 0);
  };

  // Submit / Publish
  const onValid = (values: Record<string, any>) => {
    const latestFormValues = getValues();
    const payload = UploadHumanReview(formData, latestFormValues, questions);
    const jsonStr = JSON.stringify(payload, null, 2);
    navigator.clipboard.writeText(jsonStr);
    alert("📋 Payload 已複製");
    console.log("📦 Payload:", payload);
  };

  const handlePublishClick = async () => {
    const latestFormValues = getValues();
    if (mode === "create") {
      const res = await UploadHumanReview(formData, latestFormValues, questions);
      if (res.success) toast.success("✅ Published Successfully");
      else toast.error("❌ Failed: " + res.message);
    }
    else if (mode === "edit" && existingPublicId) {
      const res = await UploadHumanReview(formData, latestFormValues, questions, existingPublicId);
      if (res.success) toast.success("✅ Published Successfully");
      else toast.error("❌ Failed: " + res.message);
    }
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto py-8">
      {/* General Section */}
      <div
        className="mt-10 border-t pt-6"
        id="general:form"
        ref={(el) => {
          questionRefs.current["general:form"] = el;
        }}
      >
        <GeneralQuestionaire
          formData={formData}
          control={control}
          register={register}
          loading={false}
          onSubmit={handleSubmit(onValid)}
          onAnyUserEdit={(e) => {
            if (mode !== "edit") return;
            if (suppressAutoForkRef.current) return;

            // ✅ 僅處理使用者觸發：程式性變更 (reset) 會是 isTrusted=false
            const trusted =
              // @ts-ignore
              e?.nativeEvent?.isTrusted ?? e?.isTrusted ?? true; // 沒事件就當作使用者觸發（由 suppress 保護 reset 期間）
            if (!trusted) return;

            const v = getValues();
            const patch = {
              review: {
                is_public: v.review_audience_visibility === "public",
                closedate: v.review_deadline_date
                  ? new Date(v.review_deadline_date).toISOString()
                  : null,
              },
              thumbnail: {
                user_channel_name: v.user_channel_name ?? undefined,
                platform: (selectedChannel?.platform ?? "Youtube") || undefined,
              },
              version: {
                credit_reward: Number(v.rater_credit_reward ?? 0),
                wanted_rating_count: Number(v.wanted_review_count ?? 1),
                creator_message_to_raters: v.additional_message_to_rater ?? "",
                channel_name: selectedChannel?.channel_name ?? v.user_channel_name ?? "",
                channel_logo: selectedChannel?.logo ?? "",
                channel_description: selectedChannel?.description ?? "",
                platform: selectedChannel?.platform ?? "Youtube",
              },
            };

            // VM 會：沒有 Unsaved → 自動 fork；已有 Unsaved → 只 patch 同一份
            beginMetaEditOnActive(patch);
          }}
        />

      </div>

      {/* 頁面標題 + 模式徽章 */}
      <div className="flex items-center justify-center gap-3">
        <h1 className="text-2xl font-bold">
          {translations?.questionaire_builder_title?.translation ?? "What would you like to ask?"}
        </h1>
        <span
          className={`text-xs px-2 py-1 rounded border ${mode === "edit"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          title={mode === "edit" ? `Editing: ${existingPublicId}` : "Creating new review"}
        >
          {mode === "edit" ? "Edit Mode" : "Create Mode"}
        </span>
      </div>

      {/* 頻道資訊 */}
      <AnimatePresence>
        {displayChannelInfo === "Yes" && selectedChannel && (
          <motion.div
            key="channel-info"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 p-4 rounded-md bg-primary text-sm flex flex-col items-center text-center"
          >
            <Image src={selectedChannel.logo} alt="logo" width={50} height={50} className="rounded-4xl" />
            <p className="mt-1 text-gray-600">{selectedChannel.channel_name}</p>
            <p className="mt-1 text-gray-600">{selectedChannel.description}</p>
            <p className="mt-1 text-gray-600">
              {translations?.platform_title?.translation ?? "Platform"}: {selectedChannel.platform}
            </p>
            <p className="mt-1 text-gray-600">
              {translations?.videotype_title?.translation ?? "Video Type"}: {selectedChannel.art_sub_type}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 問題區塊 + Undo Redo */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          {/* Undo / Redo Sticky */}
          <div className="sticky top-0 z-10 py-2">
            <div className="flex justify-center gap-2 px-4 py-2 rounded w-fit mx-auto">
              <Button
                variant="default"
                className="hover:bg-blue-500 rounded-4xl"
                onClick={() => {
                  canUndo ? undo() : toast.error("No more undo available");
                }}
                disabled={!canUndo}
              >
                <UndoIcon className="w-4 h-4 mr-1" />
              </Button>
              <Button
                variant="default"
                className="hover:bg-blue-500 rounded-4xl"
                onClick={() => {
                  canRedo ? redo() : toast.error("No more redo available");
                }}
                disabled={!canRedo}
              >
                <RedoIcon className="w-4 h-4 mr-1" />
              </Button>
            </div>
          </div>

          {/* 問題卡片列 */}
          {questions.map((q, index) => (
            <SortableItem key={q.id} id={q.id}>
              {({ setNodeRef, style, listeners, attributes }) => (
                <div
                  ref={(el) => {
                    setNodeRef(el);
                    questionRefs.current[q.id] = el;
                  }}
                  style={style}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <QuestionCard
                      pageId={pageId}
                      question={q}
                      index={index}
                      onChange={(id, patch) => {
                        updateQuestion(id, patch);
                        setTimeout(() => pushEditorQuestionsToBundle(latestQuestionsRef.current), 0);
                      }}
                      onDelete={() => handleDeleteQuestion(q.id)}
                      onCopy={handleCopyQuestion}
                      dragHandleProps={{ ...listeners, ...attributes }}
                      onFocus={() => setEditingId(q.id)}
                    />
                  </motion.div>
                </div>
              )}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

      {/* Draft 儲存時間 */}
      {draftSavedAt && (
        <div className="fixed bottom-2 right-4 text-xs text-gray-500 bg-white px-3 py-1 rounded shadow-md border">
          Draft saved at {draftSavedAt.toLocaleTimeString()}
        </div>
      )}

      {/* 新增問題按鈕 */}
      <TooltipProvider>
        <Tooltip delayDuration={800}>
          <TooltipTrigger asChild>
            <Button
              onClick={handleAddQuestion}
              variant="outline"
              className="w-fit hover:bg-blue-500 hover:text-white cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {translations?.new_question?.translation ?? "New Question"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{translations?.new_question?.tooltip ?? "Add a new Question"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* 下方操作區塊 */}
      <div className="flex gap-4 mt-6 flex-wrap">
        <TooltipProvider delayDuration={300}>
          {/* Publish */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handlePublishClick}>
                {translations?.submit_button?.translation ?? "Publish!"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {translations?.submit_button?.tooltip ?? "Save and publish"}
            </TooltipContent>
          </Tooltip>

          {/* Save Draft */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                className="hover:bg-blue-500 hover:text-white cursor-pointer transition-colors"
                onClick={() => {
                  // TODO: 若未來要「僅本地」儲存草稿，可在這裡做持久化（localStorage/IndexedDB）
                }}
              >
                {translations?.save_button?.translation ?? "Save!"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {translations?.save_button?.tooltip ??
                "Save temperarily without publishing, you can edit it later"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
