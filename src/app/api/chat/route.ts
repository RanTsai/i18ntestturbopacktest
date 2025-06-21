// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { redis } from '@/actions/upstashredis/redis';
import { getChatById, saveChatToMongo } from '@/lib/chat-service/chat-service';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';

import { generateText, streamText, generateObject, streamObject } from 'ai';
import { Message } from 'ai';
import { nanoid } from 'nanoid';
// 儲存 Redis 時使用的 prefix
const REDIS_KEY_PREFIX = 'chat:';

export async function POST(req: Request) {
    try {
        const { messages, chatId } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Missing or invalid messages' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const finalChatId = chatId || nanoid();
        const redisKey = `${REDIS_KEY_PREFIX}${finalChatId}`;

        const result = await streamText({
            // model: google('gemini-2.5-pro'),
              model: openai('gpt-4o-mini'),

            messages,
            

        });
        console.log(`[${new Date().toISOString()}] 🎯 streamText started`);

        const stream = result.toDataStream();
        const reader = stream.getReader();

        let fullResponse = '';

        const transformedStream = new ReadableStream({
            async start(controller) {
                let first = true;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = typeof value === 'string' ? value : new TextDecoder().decode(value);
                    fullResponse += text;
                    controller.enqueue(value);

                    if (first) {
                        console.log(`[${new Date().toISOString()}] 📤 First token streamed`);
                        first = false;
                    }
                }

                controller.close();

                // 非同步儲存
                Promise.resolve().then(async () => {
                    const updatedMessages = [...messages, { role: 'assistant', content: fullResponse }];
                    await redis.set(redisKey, JSON.stringify(updatedMessages), { ex: 3600 });
                    console.log(`[${new Date().toISOString()}] 💾 Redis write finished`);
                });
            },
        });

        return new Response(transformedStream, {
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    } catch (err: any) {
        console.error('[CHAT_API_ERROR]', err);
        return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}