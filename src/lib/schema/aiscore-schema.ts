import { z } from 'zod';

export const AIScoreSchema = z.object({
    clickability: z.number().max(5).min(0),
    curiosity: z.number().max(5).min(0),
    brightness: z.number().max(5).min(0),
    relevance: z.number().max(5).min(0),
    emotion: z.number().max(5).min(0)
});

export type AIScore = z.infer<typeof AIScoreSchema>;

// 🟦 定義 zod schema
export const AIResponseSchema = z.object({
    overall_impression: z.string(),
    title_strength: z.string(),
    thumbnail_strength: z.string(),
    synergy: z.string(),
    explanation: z.string(),
    scores: AIScoreSchema
});
export type AIResponse = z.infer<typeof AIResponseSchema>;

