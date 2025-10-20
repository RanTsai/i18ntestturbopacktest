// supabase-fetcher.ts
"use server";
import supabase from "@/config/supabase.config";
import { FormSchema } from "@/lib/schema/questionaire-schema";
import { getErrorMessage } from "@/lib/utils/message-utils";

/** ====== 依你DB結構定義：多語系問卷文件 ====== */
type QuestionType =
  | "text"
  | "radio"
  | "checkbox"
  | "rating"
  | "textarea"
  | "image-select"
  | "title-select"
  | "date"
  | "multi-text"
  | "number";

interface OptionItem {
  label: string;
  value: string;
}

interface Question {
  id: string;
  type: QuestionType;
  label: string;
  placeholder?: string;
  options?: OptionItem[];
  optional_text?: boolean;
  scale?: number;
  required?: boolean;
  max?: number;
  min?: number;
}

interface SectionPack {
  id: string;
  title: string;
  questions: Question[];
}

interface LocalePack {
  title: string;
  sections: SectionPack[];
  // 如果你的 locales 內還可能帶 thumbnails 等，也可補上：
  // thumbnails?: { id: string; url: string; title: string }[];
}

interface MultiLocaleQuestionnaire {
  form_id: string;
  version: string; // e.g. "v1"
  locales: Record<string, LocalePack>;
}

/** Supabase 回傳那一列的型別（只 select questionaire 欄位） */
interface QuestionaireRow {
  questionaire: MultiLocaleQuestionnaire;
}

/** 將多語系問卷轉成前端用的 FormSchema（單一語系） */
function toFormSchema(
  doc: MultiLocaleQuestionnaire,
  locale: string
): FormSchema {
  const pack =
    doc.locales[locale] ??
    doc.locales["en"] ??
    Object.values(doc.locales)[0];

  return {
    form_id: doc.form_id,
    locale,
    version: doc.version,
    title: pack?.title ?? "",
    sections: pack?.sections ?? [],
    // 下面三個欄位在你的 FormSchema 是必填字串，DB 不一定有，就給預設空字串或依需求填值
    channel_logo: "",
    channel_name: "",
    channel_description: "",
    // 若你的 FormSchema 有 thumbnails，就在 LocalePack 補型別後帶入：
    // thumbnails: pack?.thumbnails
  };
}

/** 讀取並回傳單一語系的 FormSchema */
export const FetchQuestionaireFromSupabase = async (
  scenario: string,
  locale: string = "en"
): Promise<{
  success: boolean;
  data?: FormSchema;
  cached?: boolean;
  message?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("questionaire")
      // 用泛型把 .single() 的資料列型別定義清楚
      .select<"questionaire", QuestionaireRow>("questionaire")
      .eq("scenario", scenario)
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return { success: false, message: error?.message || "No data found" };
    }

    // 把多語系文件轉成單語系的 FormSchema
    const form = toFormSchema(data.questionaire, locale);

    return { success: true, data: form, cached: false };
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    return { success: false, message: message || "Unknown error" };
  }
};
