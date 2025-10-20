// // actions/upstashredis/load-userwork.ts
// import { redis } from '@/actions/upstashredis/redis'
// import { IUserWork } from '@/app/interfaces'
// import { GetUserWorkFromSupabseWithUserIDRPC } from '../supabase/supabase-user-work'
// import { auth } from "@clerk/nextjs/server"

// export async function loadAllUserWork(): Promise<{
//   found: boolean
//   content: IUserWork[] | null
//   from: 'redis' | 'supabase' | null
//   total: number
//   fallback?: boolean
// }> {
//   const { userId } = await auth();
//   if (!userId) {
//     return { found: false, content: null, from: null, total:0 };
//   }

//   // const ids = await redis.zrange(`userwork:${userId}:index`, 0, 19, { rev: true });

//   // if (ids.length > 0) {
//   //   const keys = ids.map(id => `userwork:${userId}:${id}`);
//   //   console.log("loading user work Key from redis", keys);

//   //   const results = await redis.mget(...keys);

//   //   const parsedResults = results
//   //     .filter(Boolean)
//   //     .map((r) => typeof r === 'string' ? JSON.parse(r) : r);

//   //   // ✅ 檢查 Redis 中所有值是否都遺失 → fallback
//   //   if (parsedResults.length === 0) {
//   //     // 🧹 清除過期的 index，避免再次卡住
//   //     await redis.del(`userwork:${userId}:index`);

//   //     // 🔁 再次呼叫自己（遞迴）→ 此次會走 supabase
//   //     return await loadAllUserWork();
//   //   }

//   //   return {
//   //     found: true,
//   //     content: parsedResults,
//   //     from: 'redis',
//   //     total:parsedResults.length
//   //   };
//   // }

//   console.log("loading supabase");

//   // 🔁 從 Supabase 讀取
//   const { success, data: supaData } = await GetUserWorkFromSupabseWithUserIDRPC();//{ limit: 100, offset: 0 }
//   console.log("loading supabase success", success, "data", supaData);

//   if (success && Array.isArray(supaData) && supaData.length > 0) {
//     for (const work of supaData) {
//       await redis.set(`userwork:${userId}:${work.user_work_id}`, JSON.stringify(work), { ex: 3600 });
//       await redis.zadd(`userwork:${userId}:index`, {
//         score: new Date(work.created_at).getTime(),
//         member: work.user_work_id.toString()
//       });
//     }
//     await redis.expire(`userwork:${userId}:index`, 3600);


//     return {
//       found: true,
//       content: supaData,
//       from: 'supabase',
//       total: supaData.length
//     };
//   }

//   return {
//     found: false,
//     content: null,
//     from: null,
//     total:0
//   };
// }

// export async function loadUserWorkPage(page: number = 1, perPage: number = 10): Promise<{
//   found: boolean;
//   content: IUserWork[] | null;
//   total: number;
//   page: number;
//   perPage: number;
//   from: 'redis' | 'supabase' | null;
// }> {
//   const { userId } = await auth();
//   if (!userId) {
//     return { found: false, content: null, page, perPage, total: 0, from: null };
//   }

//   const startIndex = (page - 1) * perPage;
//   const endIndex = startIndex + perPage - 1;

//   const allIds = await redis.zrange(`userwork:${userId}:index`, 0, -1, { rev: true });

//   const total = allIds.length;

//   if (total > 0) {
//     const pageIds = allIds.slice(startIndex, endIndex + 1);
//     const keys = pageIds.map(id => `userwork:${userId}:${id}`);
//     const results = await redis.mget(...keys);

//     const parsedResults: IUserWork[] = results
//       .filter(Boolean)
//       .map((r) => typeof r === 'string' ? JSON.parse(r) : r);

//     // 🧹 如果 cache 中這頁都是空的，清空 index 並 fallback
//     if (parsedResults.length === 0) {
//       await redis.del(`userwork:${userId}:index`);
//       return await loadUserWorkPage(page, perPage); // fallback
//     }

//     return {
//       found: true,
//       content: parsedResults,
//       total,
//       page,
//       perPage,
//       from: 'redis',
//     };
//   }

//   console.log("loading supabase");

//   // 🔁 從 Supabase 讀取
//   // fallback 到 Supabase
//   const { success, data: supaData } = await GetUserWorkFromSupabseWithUserIDRPC();

//   if (success && Array.isArray(supaData) && supaData.length > 0) {
//     for (const work of supaData) {
//       await redis.set(`userwork:${userId}:${work.user_work_id}`, JSON.stringify(work), { ex: 3600 });
//       await redis.zadd(`userwork:${userId}:index`, {
//         score: new Date(work.created_at).getTime(),
//         member: work.user_work_id.toString()
//       });
//     }
//     await redis.expire(`userwork:${userId}:index`, 3600);

//     // 再次呼叫自己（此時已寫入 Redis）
//     return await loadUserWorkPage(page, perPage);
//   }

//   return {
//     found: false,
//     content: null,
//     total: 0,
//     page,
//     perPage,
//     from: null
//   };
// }