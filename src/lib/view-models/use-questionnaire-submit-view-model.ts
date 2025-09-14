"use client"
import { FormSchema, Question } from "../schema/questionaire-schema"
import { useUserChannelViewModel } from "./use-user-channel-view-model"
import { useVideoSettingViewModel } from "./use-video-setting-view-model";
import { insertHumanReviewsToSupabaseRPC, upsertHumanReviewNewVersion } from "@/actions/supabase/supabase-human-reviews"
import { useHumanReviewBundleStore } from "@/lib/global-store/use-human-review-bundle-store"
/**
 * Questionnaire Submit ViewModel
 * ---
 * 提供提交表單所需的資料處理與組裝邏輯
 */
export function useQuestionnaireSubmitViewModel() {

  const { selectedChannel } = useUserChannelViewModel();
  const { video_type, tags, titles, description, niche } =
    useVideoSettingViewModel();
  /**
   * ✅ 將 flat values 寫回每一題的 `answer` 欄位
   * - 用於將 React Hook Form 的值同步回原始 FormSchema 結構中
   * - 提交前，讓每題都帶有 `question.answer`
   */
  function assignAnswersToQuestionsInFormSchema(
    formSchema: FormSchema,
    values: Record<string, any>
  ): FormSchema {
    return {
      ...formSchema,
      sections: formSchema.sections.map((section) => ({
        ...section,
        questions: section.questions.map((question) => {
          const answer = values.hasOwnProperty(question.id)
            ? values[question.id]
            : null

          console.log("📝 Assigning answer", {
            id: question.id,
            label: question.label,
            answer: answer,
          })

          return {
            ...question,
            answer,
          }
        }),
      })),
    }
  }

  /**
   * ✅ 抽取所有 image-select 題目的圖片 URL（選項的 label 即圖片 URL）
   */
  function getThumbnailUrls(questions: Question[]): string[] {
    return questions
      .filter((q) => q.type === "image-select")
      .flatMap((q) => q.options?.map((opt) => opt.label) ?? [])
      .filter(Boolean)
  }

  /**
   * ✅ 抽取所有 title-select 題目的候選標題
   */
  function getTitleOptions(questions: Question[]): string[] {
    return questions
      .filter((q) => q.type === "title-select")
      .flatMap((q) => q.options?.map((opt) => opt.label) ?? [])
      .filter(Boolean)
  }

  /**
   * ✅ 提交時，radio / checkbox 的 option.value 統一設為 label（去除技術值）
   */
  function normalizeOptionValuesForSubmit(questions: Question[]): Question[] {
    return questions.map((q) => {
      if ((q.type === "radio" || q.type === "checkbox") && q.options?.length) {
        return {
          ...q,
          options: q.options.map((opt) => {
            const nextValue = (opt.label ?? "").trim()
            return {
              ...opt,
              value: nextValue !== "" ? nextValue : opt.value,
            }
          }),
        }
      }
      return q
    })
  }

  /**
   * ✅ 組裝最終要提交後端的 payload
   * - 同時做 answer 回寫、選項值標準化、封面標題抽取
   * - 可作為 submit 給 Supabase / RPC / API 用
   */
  function buildHumanReviewPayload(
    formData: FormSchema,
    values: Record<string, any>,
    questions: Question[],
    existingPublicId?: string
  ): { input: IInsertHumanReviewInput } {

    const formDataWithAnswers = assignAnswersToQuestionsInFormSchema(formData, values);

    // ✅ 在這裡做 value ← label 的覆寫
    const normalizedQuestions = normalizeOptionValuesForSubmit(questions);

    const extract = (id: string) => {
      for (const section of formDataWithAnswers.sections) {
        const found = section.questions.find((q) => q.id === id);
        if (found) return found.answer ?? null;
      }
      return null;
    };

    const thumbnails: string[] = getThumbnailUrls(normalizedQuestions);
    const titles = getTitleOptions(normalizedQuestions);
    const publicReviewId = existingPublicId ?? ("Thumbnail-" + crypto.randomUUID());
    console.log("values", values);
    console.log("deadline", extract("review_deadline_date"));

    const input: IInsertHumanReviewInput = {
      HumanReview: {
        public_id: publicReviewId,
        summary: "",
        status: "published",
        current_version: 1,
        is_public: extract("feedback_visibility_choice") === "yes",
        closedate: extract("review_deadline_date"),
        invite_raters_id: null, //TODO
        banned_raters_id: null, //TODO
        approve_method: "AI"
      },
      HumanReviewThumbnail: {
        thumbnails: thumbnails, // JSON structure, define specifically if known
        titles: titles,
        tags: tags,
        niche: null,
        user_channel_name: selectedChannel!.channel_name ?? null, // FK to user_channel
        target_audience: null,
        platform: "Youtube"
      },
      versions: {
        questionnaire: questions, // You can replace `any` with specific structure if known
        credit_reward: Number(extract("rater_credit_reward")) ?? 0,
        wanted_rating_count: Number(extract("wanted_review_count")) ?? 3,
        language: selectedChannel?.language ?? "en",
        creator_message_to_raters: extract("additional_message_to_rater"),
        is_latest: true,
        channel_logo: selectedChannel?.logo ?? "logo/logo.png",
        channel_name: selectedChannel?.channel_name ?? "channel name",
        channel_description: selectedChannel?.description ?? "channel description",
        platform: "Youtube",
        view_count: 0,
        cancel_count: 0,
        rate_count: 0,
      }
    }
    console.log("built input", input);
    return {
      input: input
    }
  }

  async function UploadHumanReview(
    formData: FormSchema,
    values: Record<string, any>,
    questions: Question[],
    existingPublicId?: string
  ): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const { input } = buildHumanReviewPayload(formData, values, questions);
      if (!existingPublicId) {


        const result = await insertHumanReviewsToSupabaseRPC(input);
        console.log("insertHumanReviewsToSupabaseRPC", result);

        if (!result || !result.success) {
          return {
            success: false,
            message: result?.message || "Upload failed",
            data: null
          };
        }

        console.log("✅ Human Review uploaded:", result);
        return {
          success: true,
          message: "Upload successful",
          data: null
        };
      } else {

        const result = await upsertHumanReviewNewVersion(existingPublicId, input);
        console.log("upsertHumanReviewNewVersion", result);
        if (!result || !result.success) {
          return {
            success: false,
            message: result?.message || "Upsert failed",
            data: null
          };
        }
        console.log("✅ Human Review upserted", result);
        hydrateWithNewVersionFromServer(
          result.data.version_number,
          result.data.created_at,
          questions,
          values
        );
        return {
          success: true,
          message: "Upserted successful",
          data: result.data, // ← version_number & created_at
        };
      }
    }
    catch (error: any) {
      console.error("❌ UploadHumanReview failed:", error);
      return {
        success: false,
        message: error?.message || "Unexpected error during upload",
        data: null
      };

    }
  }

  function hydrateWithNewVersionFromServer(
    newVersionNumber: number,
    created_at: string,
    questions: Question[],
    formValues: Record<string, any>
  ) {
    const s = useHumanReviewBundleStore.getState();
    const bundle = s.bundle;
    if (!bundle) return;

    const head = bundle.versions[0] ?? null; // 目前 head（覆蓋 is_latest=true 前）

    const newVersion = {
      version_number: newVersionNumber,
      created_at: created_at,
      is_latest: true,
      summary: null,
      questionnaire: questions,
      credit_reward: Number(formValues.rater_credit_reward ?? 0),
      wanted_rating_count: Number(formValues.wanted_review_count ?? 1),
      creator_message_to_raters: formValues.additional_message_to_rater ?? "",

      // ✅ 優先沿用既有版本資訊；避免用 thumbnails[0] 當 logo
      channel_name: head?.channel_name ?? formValues.user_channel_name ?? "",
      channel_logo: head?.channel_logo ?? null,
      channel_description: head?.channel_description ?? "",

      // 平台可以從 thumbnail（單一狀態子表）拿
      platform: bundle.thumbnail?.platform ?? "Youtube",

      view_count: 0,
      cancel_count: 0,
      rate_count: 0,
    };

    const updatedVersions = [
      newVersion,
      ...bundle.versions.map(v => ({ ...v, is_latest: false })),
    ];

    s.setBundle({
      ...bundle,
      versions: updatedVersions,
    });

    s.selectVersion(0);
    s.setDirtyLatest(false);
  }



  return {
    assignAnswersToQuestionsInFormSchema,
    getThumbnailUrls,
    getTitleOptions,
    normalizeOptionValuesForSubmit,
    UploadHumanReview,
  }
}

export interface ITags {
  label: string;
  language: string;
}

export interface INiche {
  label: string;
  language: string;
}

export interface IHumanReviewsVersion {
  human_review_version_id: number;
  created_at: string; // ISO timestamp
  deleted_at: string | null;
  created_by: number | null; // FK to user_basic
  deleted_by: number | null; // FK to user_basic
  is_deleted: boolean | null;
  human_reviews_id: number | null; // FK to human_reviews
  questionnaire: Question[] | null; // You can replace `any` with specific structure if known
  credit_reward: number | null;
  wanted_rating_count: number | null;
  language: string | null;
  creator_message_to_raters: string | null;
  is_latest: boolean | null;
  channel_logo: string | null;
  channel_name: string | null;
  channel_description: string | null;
  platform: string | null;
  view_count: number | null;
  cancel_count: number | null;
  rate_count: number | null;
}

export interface IHumanAnswer {
  human_answer_id: number;
  created_at: string; // ISO timestamp
  reviewer_supabase_id: number | null; // FK to user_basic
  is_public: boolean | null;
  accept_reward: boolean | null;
  message_to_creator: string | null;
  questionnaire: any | null;
  deleted_by: number | null; // FK to user_basic
  deleted_at: string | null;
  human_reviews_version: number | null; // FK to human_reviews_version
  follow_creator: boolean | null;
  support_creator_credit: number | null;
}

export interface IHumanReview {
  public_id: string;
  human_reviews_id: number;
  created_at: string; // ISO timestamp
  supabase_user_id: number | null; // FK to user_basic
  summary: string | null;
  status: string | null;
  is_closed: boolean | null;
  is_deleted: boolean | null;
  deleted_by: number | null; // FK to user_basic
  current_version: number | null;
  is_public: boolean | null;
  closedate: string | null; // ISO timestamp
  invite_raters_id: number[] | null;
  banned_raters_id: number[] | null;
  approve_method: string | null;
}

export interface IHumanReviewsThumbnail {
  human_reviews_id: number; // FK to human_reviews
  thumbnails: any; // JSON structure, define specifically if known
  titles: any | null;
  tags: any | null;
  niche: any | null;
  user_channel_id: number | null; // FK to user_channel
  target_audience: number[] | null;
  platform: string | null;
}

/**
 * Human Review Submit Input
 * ---
 * 提供提交表單所需的資料結構
 */
export interface IInsertHumanReviewInput {
  HumanReview: {
    public_id: string;
    summary: string | null;
    status: string | null;
    current_version: number | null;
    is_public: boolean | null;
    closedate: string | null;
    invite_raters_id: number[] | null;
    banned_raters_id: number[] | null;
    approve_method: string | null;
  };
  HumanReviewThumbnail: {
    thumbnails: any; // JSON structure, define specifically if known
    titles: string[];
    tags: ITags[] | null;
    niche: INiche | null;
    user_channel_name: string | null; // FK to user_channel
    target_audience: number[] | null;
    platform: string | null;
  };
  versions: {
    questionnaire: Question[] | null; // You can replace `any` with specific structure if known
    credit_reward: number | null;
    wanted_rating_count: number | null;
    language: string | null;
    creator_message_to_raters: string | null;
    is_latest: boolean | null;
    channel_logo: string | null;
    channel_name: string | null;
    channel_description: string | null;
    platform: string | null;
    view_count: number | null;
    cancel_count: number | null;
    rate_count: number | null;
  };
}