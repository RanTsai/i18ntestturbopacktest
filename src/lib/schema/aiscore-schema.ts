import { z } from 'zod';

export const AIScoreSchema = z.object({
  alignment: z.number().max(100).min(0),
  premise_curiosity: z.number().max(100).min(0),
  clarity: z.number().max(100).min(0),
  emotion: z.number().max(100).min(0),
  branding: z.number().max(100).min(0),
  clickability: z.number().max(100).min(0)
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

export interface IAspectScore {
  label: string;
  value: number;
  color: string; // 可選，若需要自定義顏色
  tooltip?: string; // 可選，若需要顯示提示
}

