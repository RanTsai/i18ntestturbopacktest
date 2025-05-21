
//src/app/api/api-dispatch/route.ts
import { NextRequest } from 'next/server'
import { functionRegistry } from '@/lib/registry'
import type { FunctionKey } from '@/lib/ai/types.ts'

export async function POST(req: NextRequest) {
  const { type, input, language } = await req.json()

  const func = functionRegistry[type as FunctionKey]
  if (!func || !func.adapter) {
    return new Response('Unknown AI function type or missing adapter', { status: 400 })
  }

  return await func.adapter({
    func,
    input,
    language
  })
}

// import { NextRequest } from 'next/server'

// export async function POST(req: NextRequest) {
//   return new Response('✅ API is working', { status: 200 })
// }