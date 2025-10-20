// actions/upstashredis/load-questionaire.ts
import { redis } from '@/actions/upstashredis/redis'
import { FormSchema } from '@/lib/schema/questionaire-schema'
import { FetchQuestionaireFromSupabase } from '../supabase/supabase-fetcher'

export async function loadQuestionnaire(
  scenario: string,
  locale: string,
  fallback = true
): Promise<{
  found: boolean
  content: FormSchema | null
  locale: string
  from: 'redis' | 'supabase' | null
  fallback?: boolean
}> {
  const key = `questionnaire:${scenario}:${locale}`

  // ✅ 1. Redis 讀取
  const data = await redis.get(key)
  if (data) {
    return {
      found: true,
      content: typeof data === 'string' ? JSON.parse(data) : (data as FormSchema),
      locale,
      from: 'redis'
    }
  }

  // ✅ 2. Supabase
  const { success, data: supaData } = await FetchQuestionaireFromSupabase(scenario, locale)

  if (success && supaData) {
    // 儲存到 Redis（key 直接帶語系）
    await redis.set(key, JSON.stringify(supaData), { ex: 3600 })

    return {
      found: true,
      content: supaData,
      locale,
      from: 'supabase'
    }
  }

  // ✅ 3. fallback 到英文 Redis
  if (fallback && locale !== 'en') {
    const fallbackKey = `questionnaire:${scenario}:en`
    const fallbackData = await redis.get(fallbackKey)
    if (fallbackData && typeof fallbackData === 'string') {
      return {
        found: true,
        content: JSON.parse(fallbackData) as FormSchema,
        locale: 'en',
        from: 'redis',
        fallback: true
      }
    }
  }

  // ❌ 4. 都沒找到
  return {
    found: false,
    content: null,
    locale,
    from: null
  }
}
