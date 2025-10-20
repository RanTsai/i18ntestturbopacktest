// actions/upstashredis/load-user.ts
import { redis } from '@/actions/upstashredis/redis'
import { IUser } from '@/app/interfaces'
import { getClerkUserFromSupabase } from '@/actions/supabase/supabase-user';

export async function loadUserData(
    clerk_user_id: string,
): Promise<{
    found: boolean
    content: IUser | null
    from: 'redis' | 'supabase' | null
    fallback?: boolean
}> {
    const key = `user:${clerk_user_id}`

    // ✅ 1. Redis 讀取
    const data = await redis.get(key)
    if (data) {
        return {
            found: true,
            content: typeof data === 'string' ? JSON.parse(data) : data,
            from: 'redis'
        }
    }

    // 🔁 2. 查 Supabase
    const { success, data: supaData } = await getClerkUserFromSupabase();

    if (success && supaData) {
        const redisKey = `user:${clerk_user_id}`
        await redis.set(redisKey, JSON.stringify(supaData), { ex: 3600 })
        return {
            found: true,
            content: supaData,
            from: 'supabase'
        }
    }

    // ❌ 3. 都沒找到
    return {
        found: false,
        content: null,
        from: null
    }
}
