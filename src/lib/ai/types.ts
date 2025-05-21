import type { AIAdapter } from './modeladapters/types'

export interface FunctionConfig {
  model: string
  modelName: string
  schema?: any
  buildPrompt: (input: any, language: string) => any[]
  adapter: AIAdapter
}

export type FunctionKey = keyof typeof import('../registry').functionRegistry