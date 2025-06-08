import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { AIResponseSchema } from '@/lib/schema/aiscore-schema';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { extractUrl } from '@/lib/utils';

export async function POST(req: NextRequest) {
    try {
        console.log('Received request:', req.method, req.url);

        const { messages } = await req.json();
        console.log('Request messages:', messages);

        if (!messages) {
            return NextResponse.json({ error: 'Missing input!' }, { status: 400 });
        }

        const lastUserMessage = messages
            .slice()
            .reverse()
            .find((m: { role: string; content: string }) => m.role === "user")?.content || "";
        const imageUrl = extractUrl(lastUserMessage);

        const jsonSchema = zodToJsonSchema(AIResponseSchema, "AI Response Schema");
        const schemaString = JSON.stringify(jsonSchema, null, 2);

        // 🟩 多模態訊息
        const multiModalMessages = [
            {
                role: 'system' as const,
                content: `You are a thumbnail analyser. Use engaging emoji to make the analysis fun and visually appealing for overall impression, strengths and explanations, and write with a natural, friendly tone for a 10 year old kid. Please make sure scores are numbers between 0 and 5.
 Respond ONLY with a JSON object in the given schema ${schemaString}:`
            },
            {
                role: 'user' as const,
                content: [
                    { type: 'text' as const, text: lastUserMessage },
                    ...(imageUrl
                        ? [{
                            type: 'image' as const,
                            image: imageUrl,
                            mimeType: 'image/png'
                        }]
                        : [])
                ]
            }
        ];

        // 🟨 使用 generateObject 並傳入 zod schema
        const result = await generateObject({
            model: openai('gpt-4o'),
            schema: AIResponseSchema,
            messages: multiModalMessages
        });

        // ✅ 回傳乾淨 JSON 給前端
        return NextResponse.json(result.object);

    } catch (error: any) {
        console.error('API chat error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
