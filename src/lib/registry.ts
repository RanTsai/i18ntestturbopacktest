// /lib/ai/registry.ts
import { ThumbnailFeedbackSchema } from './ai/functions/ThumbnailFeedbackSchema';
import { generateThumbnailFeedbackPrompt } from './ai/handlers/generateThumbnailFeedbackPrompt';
import { openaiAdapter } from './ai/modeladapters/openaiAdapter';
import { geminiAdapter } from './ai/modeladapters/geminiAdapter' // 預設你之後會實作
import type { FunctionConfig } from './ai/types'

// 每個功能：定義對應的模型、Prompt、Adapter、Function schema（如有）
export const functionRegistry: Record<string, FunctionConfig> = {
  thumbnail_feedback: {
    model: 'openai',
    schema: ThumbnailFeedbackSchema,
    buildPrompt: generateThumbnailFeedbackPrompt,
    adapter: openaiAdapter,
    modelName: 'gpt-4-0613'
  },

  gemini_rewrite_title: {
    model: 'gemini',
    buildPrompt: (input, language) => [
      {
        role: 'user',
        content: `請用 ${language} 改寫這段 YouTube 標題，使其更吸引人。\n\n原始標題：${input.title}`
      }
    ],
    adapter: geminiAdapter,
    modelName: 'gemini-pro'
  }
}

export type FunctionKey = keyof typeof functionRegistry
