// /lib/ai/modelAdapters/openaiAdapter.ts
import { streamText, tool } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import type { AIAdapter } from './types'

export const geminiAdapter: AIAdapter = async ({ func, input, language }) => {
  const messages = func.buildPrompt(input, language)

  // 這裡轉換你的 function schema 成 Vercel AI SDK 的 tool 格式
  const tools = {
    [func.schema.name]: tool({
      description: func.schema.description,
      parameters: z.object({ language: z.string() }), // 可改成完整定義
      execute: async () => {
        // 不實際執行 → 只用於接收結構化資料，因此此處可留空
        return ''
      }
    })
  }

  const result = await streamText({
    model: openai(func.modelName),
    messages,
    tools,
    toolChoice: { type: 'tool', toolName: func.schema.name }
  })

  return result.toDataStreamResponse()
}
