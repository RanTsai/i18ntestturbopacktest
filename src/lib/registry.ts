// ============================
// 2. /lib/ai/registry.ts
// ============================

import { thumbnailFeedbackSchema } from './ai/functions/thumbnailFeedbackSchema';
import { generateThumbnailFeedbackPrompt } from './ai/handlers/generateThumbnailFeedbackPrompt';

export const functionRegistry = {
  thumbnail_feedback: {
    schema: thumbnailFeedbackSchema,
    buildPrompt: generateThumbnailFeedbackPrompt,
    model: 'gpt-4-0613'
  }
  // 可以未來加更多功能
}