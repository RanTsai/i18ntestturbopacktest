export type QuestionType =
    | "text"
    | "radio"
    | "checkbox"
    | "rating"
    | "textarea"
    | "thumbnail-select"
    | "title-select"
    | "date"
    | "multi-text";

export interface Question {
    id: string;
    type: QuestionType;
    label: string;
    placeholder?: string;
    options?: string[];
    scale?: number;
    optional_text?: boolean;
    max?: number;
    min?: number;
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
