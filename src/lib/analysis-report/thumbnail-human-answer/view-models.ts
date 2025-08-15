// lib/analysis/view-models.ts
import type { Question } from "@/lib/schema/questionaire-schema";

/** 會產生「選項統計」的題型 */
export type ChoiceLikeQuestionType =
  | "image-select"
  | "title-select"
  | "radio"
  | "checkbox";

/** Summary 用：單一選項的統計資料 */
export interface SummaryOption {
  /** 唯一鍵（與題目 options.value 對應） */
  value: string;
  /** 顯示文字（radio/checkbox/title-select）或 URL（image-select） */
  label?: string;
  /** 被選次數 */
  count: number;
  /** 佔比（0~1）。若 totalAnswers=0 則為 0 */
  ratio: number;
  /** 僅 image-select 會帶（縮圖 URL） */
  imageUrl?: string;
}

/** Summary 用：單一題目的統計資料 */
export interface SummaryQuestion {
  questionId: string;
  type: Question["type"];
  /** 題目標題（label） */
  title: string;
  /** 有作答的人數（不含未答） */
  totalAnswers: number;
  /** 未作答的人數（skipped） */
  skippedCount: number;
  /** 僅 choice-like 題型會有選項統計 */
  options?: SummaryOption[];
}

/** Questions 區用：單一答題者在某題的作答紀錄 */
export interface AnswerItem {
  answerId?: number;
  reviewerId?: string;
  createdAt?: string;
  /** 原始值（單值或多值） */
  value: string | string[];
  /** 顯示友好資訊（把 value 映射成文字或圖片） */
  display?: {
    /** title-select/radio 的對應文字 */
    text?: string;
    /** checkbox 的多個文字 */
    texts?: string[];
    /** image-select 的縮圖 URL */
    imageUrl?: string;
    /** 若未來 checkbox 支援多圖 */
    images?: string[];
  };
}

/** Questions 區用：單一題目的所有作答清單 */
export interface QuestionAnswers {
  questionId: string;
  type: Question["type"];
  /** 題目標題（label） */
  title: string;
  /** 依 createdAt 由新到舊排序 */
  answers: AnswerItem[];
}
