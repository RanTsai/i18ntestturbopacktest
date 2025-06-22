import { z } from "zod";
import { AIScoreSchema } from "./aiscore-schema";

export const VersionsSchema = z.object({
    version_number: z.number(),
    image_url: z.string().url(),
    title: z.string(),
    description: z.string(),
    remark: z.string(),
});

export const UserWorkSchema = z.object({
    user_work_id: z.number(),
    created_at: z.string(), // ← string not Date
    image_url: z.string().url(),
    title: z.string().min(1, "Title is required"),
    description: z.string(), // ← required
    ai_comment: z.string(),  // ← required
    supabase_user_id: z.number().int(),
    ai_score: AIScoreSchema.nullable(),
    view_count: z.number().int().default(0),
    rating_count: z.number().int().default(0),
    public_id: z.string(), // ← required
    language: z.string(),  // ← required
    versions: VersionsSchema.nullable(),
    clerk_user_id: z.string(),
});

export type IUserWork = z.infer<typeof UserWorkSchema>;
