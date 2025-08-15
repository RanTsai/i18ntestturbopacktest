import { z } from "zod";
import { AIScore, AIScoreSchema, AIResponseSchema, AIResponse } from "./aiscore-schema";

export type IUserWork = z.infer<typeof UserWorkSchema>;

export const VersionsSchema = z.object({
    version_number: z.number(),
    art_sub_type: z.string(),
    theme: z.string(),
    topic: z.string(),
    image_url: z.string().url(),
    title: z.string(),
    ai_feedback: AIResponseSchema.nullable().optional(), // Consider defining a more specific type for aiFeedback
    ai_score: AIScoreSchema.nullable().optional(),
    description: z.string().optional(),
    remark: z.string().optional(),
});

export type IVersions = z.infer<typeof VersionsSchema>;

export interface UploadedVersions {
    version_number: number;
    art_sub_type: string;
    theme: string;
    topic: string;
    file: File;
    image_url: string;
    title: string;
    isLoading: boolean;
    ai_feedback: AIResponse | null; // Consider defining a more specific type for aiFeedback
    ai_score: AIScore | null;
}

export const UserWorkSchema = z.object({
  user_work_id: z.number(),
  supabase_user_id: z.number(),                 // 不允許 null
  created_at: z.string(),

  image_url: z.string().url(),
  title: z.string().nullable().transform(v => v ?? ""),     // -> string
  description: z.string(),
  ai_comment: z.string().nullable().transform(v => v ?? ""),// -> string
  ai_score: AIScoreSchema.nullable(),

  view_count: z.number().int().default(0),
  rating_count: z.number().int().default(0),
  public_id: z.string(),
  language: z.string(),

  // versions 可能是 IVersions[] 或單個或 null；統一成 IVersions | null
  versions: z.union([VersionsSchema, z.array(VersionsSchema)])
             .nullable()
             .transform(v => Array.isArray(v) ? (v[0] ?? null) : (v ?? null)) as z.ZodType<IVersions | null>,

  clerk_user_id: z.string(),

  // DB 回傳 titles: string[]；介面是 { titles: string[] } | undefined
  titles: z.union([z.array(z.string()), z.null(), z.undefined()])
           .transform(v => Array.isArray(v) ? { titles: v } : undefined),

  // tags: jsonb（常見是 string[]）；介面是 string[] | undefined
  tags: z.union([z.array(z.string()), z.null(), z.undefined()])
         .transform(v => (Array.isArray(v) ? v : undefined)),

  topic: z.string().nullable().optional().transform(v => v ?? undefined),
  theme: z.string().nullable().optional().transform(v => v ?? undefined),
  user_channel_id: z.number().int().nullable().optional().transform(v => v ?? undefined),
  updated_at: z.string().nullable().optional().transform(v => v ?? undefined),
  is_public: z.boolean().nullable().optional().transform(v => v ?? undefined),
  is_deleted: z.boolean().nullable().optional().transform(v => v ?? undefined),
  deleted_by: z.string().nullable().optional().transform(v => v ?? undefined),
  updated_by: z.string().nullable().optional().transform(v => v ?? undefined),
}).passthrough(); // 多回欄位也不會炸

export type UserWorkParsed = z.infer<typeof UserWorkSchema>; // 形狀 ≈ IUserWork


export interface ISerializedVersion {
  version_number: number;
  art_sub_type: string;
  theme: string;
  topic: string;
  image_url: string;
  title: string;
  ai_score: Record<string, number> | null;
}

export function SerializeUploadedVersions(versions: UploadedVersions[]): ISerializedVersion[] {
  return versions.map((v) => ({
    version_number: v.version_number,
    art_sub_type: v.art_sub_type,
    theme: v.theme,
    topic: v.topic,
    image_url: v.image_url,
    title: v.title,
    ai_score: v.ai_score,
  }));
}