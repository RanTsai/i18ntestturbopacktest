// // /lib/ai/modelAdapters/openaiAdapter.ts
// import { streamText, tool } from 'ai'
// import { openai } from '@ai-sdk/openai'
// import { z } from 'zod'
// import type { AIAdapter } from './types'

// export const openaiAdapter: AIAdapter = async ({ func, input, language }) => {
//   const messages = func.buildPrompt(input, language)

//   // 這裡轉換你的 function schema 成 Vercel AI SDK 的 tool 格式
//   const tools = {
//     [func.schema.name]: tool({
//       description: func.schema.description,
//       parameters: z.object({ language: z.string() }), // 可改成完整定義
//       execute: async () => {
//         // 不實際執行 → 只用於接收結構化資料，因此此處可留空
//         return ''
//       }
//     })
//   }

//   const result = await streamText({
//     model: openai(func.modelName),
//     messages,
//     tools,
//     toolChoice: { type: 'tool', toolName: func.schema.name }
//   })

//   return result.toDataStreamResponse()
// }

// /lib/ai/modelAdapters/openaiAdapter.ts
import { streamText, tool } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import type { AIAdapter } from './types'

export const openaiAdapter: AIAdapter = async ({ func, input, language }) => {
  const messages = func.buildPrompt(input, language)

  const tools = {
    [func.schema.name]: tool({
      description: func.schema.description,
      parameters: z.object({
        language: z.string(),
        Clickability: z.object({
          score: z.number(),
          comment: z.string()
        }),
        Clarity: z.object({
          score: z.number(),
          comment: z.string()
        }),
        Relevance: z.object({
          score: z.number(),
          comment: z.string()
        }),
        CTR: z.object({
          score: z.number(),
          comment: z.string()
        }),
        Branding: z.object({
          score: z.number(),
          comment: z.string()
        })
      }),
      execute: async () => {
        // execute 實際不會被執行，但需要提供正確 return 結構
        return {
          language: '',
          Clickability: { score: 0, comment: '' },
          Clarity: { score: 0, comment: '' },
          Relevance: { score: 0, comment: '' },
          CTR: { score: 0, comment: '' },
          Branding: { score: 0, comment: '' }
        }
      }
    })
  }
console.log('[adapter] tool setup:', tools)
console.log('[adapter] prompt:', messages)
  const result = await streamText({
    model: openai(func.modelName),
    messages,
    tools,
    toolChoice: { type: 'tool', toolName: func.schema.name }
  })

  return result.toDataStreamResponse()
}
