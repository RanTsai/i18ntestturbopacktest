// actions/upstashredis/load-userwork.ts
import { redis } from '@/actions/upstashredis/redis'
import { IUserWork } from '@/app/interfaces'
import { GetUserWorkFromSupabseWithUserID } from '../supabase/supabaseUserWork'
import { auth } from "@clerk/nextjs/server"

export async function loadAllUserWork(): Promise<{
  found: boolean
  content: IUserWork[] | null
  from: 'redis' | 'supabase' | null
  fallback?: boolean
}> {
  const { userId } = await auth();
  if (!userId) {
    return { found: false, content: null, from: null };
  }

  const ids = await redis.zrange(`userwork:${userId}:index`, 0, 19, { rev: true });

  if (ids.length > 0) {
    const keys = ids.map(id => `userwork:${userId}:${id}`);
    console.log("loading user work Key from redis", keys);

    const results = await redis.mget(...keys);

    const parsedResults = results
      .filter(Boolean)
      .map((r) => typeof r === 'string' ? JSON.parse(r) : r);

    // ✅ 檢查 Redis 中所有值是否都遺失 → fallback
    if (parsedResults.length === 0) {
      // 🧹 清除過期的 index，避免再次卡住
      await redis.del(`userwork:${userId}:index`);

      // 🔁 再次呼叫自己（遞迴）→ 此次會走 supabase
      return await loadAllUserWork();
    }

    return {
      found: true,
      content: parsedResults,
      from: 'redis'
    };
  }

  console.log("loading supabase");

  // 🔁 從 Supabase 讀取
  const { success, data: supaData } = await GetUserWorkFromSupabseWithUserID();
  console.log("loading supabase success", success, "data", supaData);

  if (success && Array.isArray(supaData) && supaData.length > 0) {
    for (const work of supaData) {
      await redis.set(`userwork:${userId}:${work.user_work_id}`, JSON.stringify(work), { ex: 3600 });
      await redis.zadd(`userwork:${userId}:index`, {
        score: new Date(work.created_at).getTime(),
        member: work.user_work_id.toString()
      });
    }
    await redis.expire(`userwork:${userId}:index`, 3600);


    return {
      found: true,
      content: supaData,
      from: 'supabase'
    };
  }

  return {
    found: false,
    content: null,
    from: null
  };
}