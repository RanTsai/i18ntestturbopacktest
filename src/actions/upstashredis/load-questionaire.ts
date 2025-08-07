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
    //const data = await redis.get<string>(key);
    const data = await redis.get(key)

    if (data) {
        //console.log("found in Redis", data);
        return {
            found: true,
            content: typeof data === 'string' ? JSON.parse(data) : data,
            locale,
            from: 'redis'
        }
    }

    // 🔁 2. 若 Redis 無資料，查 Supabase

    const { success, data: supaData } = await FetchQuestionaireFromSupabase(scenario);

    if (success && supaData && typeof supaData.questionaire?.locales === 'object') {
        const localeMap = supaData.questionaire.locales as Record<string, any>
        // ✅ 將每個語言的問卷儲存成 Redis key
        await Promise.all(
            Object.entries(localeMap).map(([lang, content]) => {
                const redisKey = `questionnaire:${scenario}:${lang}`
                const stringified = JSON.stringify(content)
                return redis.set(redisKey, stringified, { ex: 3600 })
            })
        )

        // ✅ 回傳指定語言（如未找到，使用 fallback 'en'）
        const selected = localeMap[locale] || localeMap['en']
        return {
            found: !!selected,
            content: selected || null,
            locale: selected ? locale : 'en',
            from: 'supabase',
            fallback: !localeMap[locale]
        }
    }
    // 🔁 3. fallback 到英文版 Redis（非 Supabase）
    if (fallback && locale !== 'en') {
        const fallbackKey = `questionnaire:${scenario}:en`
        const fallbackData = await redis.get(fallbackKey)
        if (fallbackData && typeof fallbackData === 'string') {
            return {
                found: true,
                content: JSON.parse(fallbackData),
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
