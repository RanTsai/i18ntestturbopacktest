export type QuestionType =
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

export interface OptionItem {
    value: string;       // ✅ 不變的 ID，如 "hobby"
    label: string;       // ✅ 顯示文字（可多語言）
}

export interface Question {
    id: string;
    type: QuestionType;
    label: string;
    placeholder?: string;
    options?: OptionItem[];
    scale?: number;
    required?: boolean;
    max?: number;
    min?: number;
    answer?: string | number | boolean | string[] | null;
}

export interface Section {
    id: string;
    title: string;
    questions: Question[];
}

export interface ThumbnailItem {
    id: string;
    url: string;
    title: string;
}

export interface FormSchema {
    form_id: string;
    locale: string;
    version: string;
    title: string;
    thumbnails?: ThumbnailItem[];
    sections: Section[];
    channel_logo: string;
    channel_name: string;
    channel_description: string;
}


export type QuestionnaireAnswer = Record<string, string | number | boolean | string[] | undefined>;
