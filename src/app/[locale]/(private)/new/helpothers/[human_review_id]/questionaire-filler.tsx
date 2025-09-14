"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PageTranslations } from "@/i18n/interface";
import { useQuestionRefContext } from "@/context/question-ref-context";
import GeneralQuestionaire from "../../human-review-questionnaire-design/general-questionare";
import QuestionViewCard from "@/components/ui/forms/question-view-card";
import Image from "next/image";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { formData } from "./mockFormData";
import { HumanReviewBundle } from "@/lib/global-store/use-human-review-bundle-store";
import { useQuestionnaireStore } from "@/lib/global-store/human-review-questionaire-store";
import { useHumanAnswerSubmitViewModel } from "@/lib/view-models/use-human-answer-submit-view-model";
import { useRouter } from "next/navigation";

interface Props {
  translations: PageTranslations;
  humanReview: HumanReviewBundle | null;
  mode?: "fill" | "review";
}

export default function QuestionnaireFiller({
  translations,
  humanReview,
  mode = "fill",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uiMode, setUiMode] = useState<"fill" | "review">(mode);
  const defaultValues: Record<string, any> = {};
  const { questions, setQuestions } = useQuestionnaireStore();
  const [errorQuestionIds, setErrorQuestionIds] = useState<string[]>([]);
  const questionRefs = useQuestionRefContext();
  const { buildPayload, submit, clearDraft } = useHumanAnswerSubmitViewModel();

  // 初始化 default values（僅在 fill 模式）
  formData.sections.forEach((section) => {
    section.questions.forEach((q) => {
      if (uiMode === "fill") {
        if (q.type === "radio" && q.options?.length) {
          defaultValues[q.id] = q.options[0].value;
        } else if (q.type === "checkbox") {
          defaultValues[q.id] = [];
        } else if (q.type === "rating") {
          defaultValues[q.id] = "0";
        } else if (q.type === "number") {
          defaultValues[q.id] = 0;
        } else if (q.type === "text" || q.type === "textarea") {
          defaultValues[q.id] = "";
        }
      }
    });
  });

  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
  } = useForm<Record<string, any>>({
    defaultValues,
  });

  const displayChannelInfo = !!(humanReview?.versions?.[0]?.channel_logo?.trim());
  const humanReviewPublicId = humanReview?.review.public_id;

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto py-8 items-center">
      <h1 className="text-3xl font-bold mb-4">Help the creator!</h1>

      {/* Channel Info */}
      {displayChannelInfo && (
        <div className="mt-6 p-4 rounded-md bg-primary text-sm flex flex-col items-center text-center">
          <h1 className="text-l font-bold mb-4">Channel information</h1>
          <br />
          <Image
            src={humanReview!.versions[0]!.channel_logo!}
            alt="logo"
            width={50}
            height={50}
            className="rounded-4xl"
          />
          <p className="mt-1 text-gray-600">
            channel name: {humanReview!.versions[0]!.channel_name!}
          </p>
          <p className="mt-1 text-gray-600">
            {translations?.platform_title?.translation ?? "Platform"}: Youtube
          </p>
          <p className="mt-1 text-gray-600">
            {translations?.videotype_title?.translation ?? "Video Type"}:{" "}
            {humanReview!.thumbnail!.platform}
          </p>
        </div>
      )}

      {/* 題目清單 */}
      {questions &&
        questions.map((q, index) => (
          <div
            className="w-full h-full"
            key={q.id}
            ref={(el) => {
              questionRefs.current[q.id] = el;
            }}
          >
            {/* ← 成功後會改成 review */}
            <QuestionViewCard
              question={q}
              index={index}
              mode={uiMode}                          
              control={control}
              setValue={setValue}
              invalid={errorQuestionIds.includes(q.id)}
            />
          </div>
        ))}

      {/* General Questionnaire */}
      <div
        className="mt-10 border-t pt-6 w-full"
        id="question-general:form"
        ref={(el) => {
          questionRefs.current["general:form"] = el;
        }}
      >
        {uiMode === "review" ? (
          <fieldset disabled className="opacity-90">
            <GeneralQuestionaire
              formData={formData}
              control={control}
              register={register}
              loading={false}
              onSubmit={() => {}}
            />
          </fieldset>
        ) : (
          <GeneralQuestionaire
            formData={formData}
            control={control}
            register={register}
            loading={loading}
            onSubmit={handleSubmit(() => {})}
          />
        )}
      </div>

      {/* 底部操作區域 */}
      <div className="mt-4 flex flex-row gap-4 justify-center">
        <TooltipProvider>
          {uiMode === "fill" ? (
            <>
              {/* Submit */}
              <Tooltip delayDuration={800}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="default"
                    className="hover:bg-blue-500 hover:text-white cursor-pointer transition-colors"
                    onClick={handleSubmit(async () => {
                      const latestFormValues = getValues();

                      // 原本的 UI 驗證
                      const invalidQuestions = questions.filter((q) => {
                        const value = latestFormValues[q.id];

                        if (q.type === "image-select" || q.type === "title-select") {
                          return !value;
                        }

                        if (q.required) {
                          if (q.type === "text" || q.type === "textarea") return !value?.trim();
                          if (q.type === "radio" || q.type === "number" || q.type === "rating")
                            return value === undefined || value === null;
                          if (q.type === "checkbox")
                            return !Array.isArray(value) || value.length === 0;
                        }
                        return false;
                      });

                      if (invalidQuestions.length > 0) {
                        const firstInvalid = invalidQuestions[0];
                        setErrorQuestionIds(invalidQuestions.map((q) => q.id));
                        alert(
                          `❌ 第 ${questions.indexOf(firstInvalid) + 1} 題「${firstInvalid.label}」尚未填寫`
                        );
                        const ref = questionRefs.current[firstInvalid.id];
                        if (ref) ref.scrollIntoView({ behavior: "smooth", block: "center" });
                        return;
                      }

                      setErrorQuestionIds([]);
                      setLoading(true);
                      try {
                        // VM：組裝 payload（human_answers）
                        const payload = buildPayload({
                          humanReviewsPublicId: humanReviewPublicId ?? "",
                          formValues: latestFormValues,
                          questionsOverride: questions,
                        });

                        // 送出 RPC
                        const res = await submit(payload);

                        if (res.ok) {
                          // 回填答案到 store，讓 review 模式能顯示
                          const answered = questions.map((q) => ({
                            ...q,
                            answer:
                              Object.prototype.hasOwnProperty.call(latestFormValues, q.id)
                                ? latestFormValues[q.id]
                                : (q as any).answer ?? null,
                          }));
                          setQuestions(answered);

                          // 清草稿、切換為 review
                          clearDraft();
                          setUiMode("review");

                          alert(
                            `✅ 成功儲存到 Supabase${
                              res.human_answer_id ? `（ID: ${res.human_answer_id}）` : ""
                            }`
                          );
                        } else {
                          alert(`❌ 儲存失敗: ${res.message ?? res.code}`);
                        }
                      } catch (e: any) {
                        alert(`❌ 建立或提交失敗：${e?.message ?? "Unknown error"}`);
                      } finally {
                        setLoading(false);
                      }
                    })}
                  >
                    {loading
                      ? translations?.submitting_button?.translation ?? "Submitting..."
                      : translations?.submit_button?.translation ?? "Submit"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {translations?.submit_button?.tooltip ?? "Save and submit"}
                </TooltipContent>
              </Tooltip>

              {/* Cancel */}
              <Tooltip delayDuration={800}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="hover:bg-blue-500 hover:text-white cursor-pointer transition-colors"
                    onClick={() => {
                      if (confirm("確定要取消並清除草稿嗎？")) {
                        clearDraft();
                        // 這裡如需重置 RHF/題目可自行加
                      }
                    }}
                  >
                    {translations?.cancel_button?.translation ?? "Cancel"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cancel</TooltipContent>
              </Tooltip>
            </>
          ) : (
            // review 模式：僅提供 Return to Community
            <Button
              size="sm"
              variant="default"
              className="hover:bg-blue-500 hover:text-white cursor-pointer transition-colors"
              onClick={() => {
                router.push("/new/rate-community");
              }}
            >
              {translations?.return_to_community_button?.translation ?? "Return to Community"}
            </Button>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}
