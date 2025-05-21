export interface FunctionConfig {
  model: string
  modelName: string
  schema?: any
  buildPrompt: (input: any, language: string) => any[]
}

export interface AIAdapterArgs {
  func: FunctionConfig
  input: any
  language: string
}

export type AIAdapter = (args: AIAdapterArgs) => Promise<Response>
