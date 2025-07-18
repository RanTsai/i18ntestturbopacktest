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
    created_at: z.string(), // ← string not Date
    image_url: z.string().url(),
    title: z.string().nullable().optional(),
    description: z.string(), // ← required
    ai_comment: z.string().nullable(),  // ← required
    supabase_user_id: z.number().int().nullable(),
    ai_score: AIScoreSchema.nullable(),
    view_count: z.number().int().default(0),
    rating_count: z.number().int().default(0),
    public_id: z.string(), // ← required
    language: z.string(),  // ← required
    versions: z.array(VersionsSchema).nullable(),
    clerk_user_id: z.string(),
    art_sub_type: z.string(),
    updated_at: z.string().nullable(), // ← string not Date
});

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