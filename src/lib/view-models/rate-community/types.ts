// 基礎型別：供 RateCommunity 專用 ViewModel 共用

import { ITags } from "../use-questionnaire-submit-view-model";

export type ChannelGroup = "my" | "following" | "explore";
export type ReviewState = "unreviewed" | "reviewed" | "all";
export type SortMode = "latest" | "trending";

export interface ChannelSummary {
  channel_name: string;
  logo: string;
  platform?: string | null;
}

export interface HumanReviewCardDTO {
  public_id: string;
  closedate: string | null;          // ISO
  approve_method: string | null;
  language: string | null;
  titles: string[];
  thumbnails: string[];        // 卡片封面使用第一張
  channel_logo: string;
  channel_name: string;
  channel_description: string | null;
  platform: string | null;
  wanted_rating_count: number | null;
  user_is_owner: boolean;

  tags: ITags[];
  view_count: number;
  rate_count: number;
  like_count:number;
  credit_reward: number;
  created_at: string;          // ISO
  reviewedByMe: boolean;       // 後端計算或前端推斷
}
