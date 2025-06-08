import { z } from "zod";
import { AIScoreSchema } from "./aiscore-schema";

export const UserWorkSchema = z.object({
    created_at: z.coerce.date(),
    image_url: z.string().url(),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    ai_comment: z.string().optional(),
    supabase_user_id: z.number().int(),
    ai_score: AIScoreSchema,
    view_count: z.number().int().default(0),
    rating_count: z.number().int().default(0),
    public_id: z.string().optional(),
    language: z.string().optional().default("en"),
});

export type UserWork = z.infer<typeof UserWorkSchema>;

