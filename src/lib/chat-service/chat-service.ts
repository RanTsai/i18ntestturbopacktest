// lib/chat-service.ts
import { redis } from '@/actions/upstashredis/redis'
import ChatModel from '@/actions/mongoose/chat-mongoose-model';
import { Message } from 'ai';

const REDIS_KEY_PREFIX = 'chat:';

export async function getChatFromRedis(chatId: string): Promise<Message[] | null> {
  const raw = await redis.get(`${REDIS_KEY_PREFIX}${chatId}`);
  if (typeof raw === 'string') {
    return JSON.parse(raw);
  }
  return null;
}

export async function saveChatToRedis(chatId: string, messages: Message[]): Promise<void> {
  await redis.set(`${REDIS_KEY_PREFIX}${chatId}`, JSON.stringify(messages), { ex: 3600 });
}

export async function getChatById(chatId: string) {
  const chat = await ChatModel.findById(chatId);
  return chat ? chat.toObject() : null;
}

export async function saveChatToMongo(
  chatId: string,
  messages: Message[],
  userId: string,
  title?: string
) {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] 🟡 Saving chat ${chatId} to Mongo...`);

  const result = await ChatModel.findByIdAndUpdate(
    chatId,
    {
      messages,
      user: userId,
      title: title || messages[0]?.content,
    },
    { upsert: true, new: true }
  );

  const duration = Date.now() - start;
  console.log(`[${new Date().toISOString()}] ✅ Mongo save completed in ${duration}ms`);

  return result;
}
