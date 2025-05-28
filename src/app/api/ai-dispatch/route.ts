import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// 3️⃣ 萃取 URL 的工具函式
function extractUrl(input: any): string {
    if (typeof input === "object" && input.text) {
        input = input.text;
    }
    if (typeof input !== "string") return "";
    const match = input.match(/https?:\/\/[^\s]+/);
    return match ? match[0] : "";
}

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

        console.log('Last user message:', lastUserMessage);

        const imageUrl = extractUrl(lastUserMessage);
        console.log('Extracted image URL:', imageUrl);

        // 🟦 定義 zod schema
        const schema = z.object({
            overall_impression: z.string(),
            title_strength: z.string(),
            thumbnail_strength: z.string(),
            synergy: z.string(),
            explanation: z.string(),
            scores: z.object({
                clickability: z.number().max(5).min(0),
                curiosity: z.number().max(5).min(0),
                brightness: z.number().max(5).min(0),
                relevance: z.number().max(5).min(0),
                emotion: z.number().max(5).min(0)
            })
        });

        // 🟩 多模態訊息
        const multiModalMessages = [
            {
                role: 'system' as const,
                content: `You are a thumbnail analyser. Use engaging emoji to make the analysis fun and visually appealing for overall impression, strengths and explanations, and write with a natural, friendly tone for a 10 year old kid, Respond ONLY with a JSON object in this schema:
                        {
                        "overall_impression": string,
                        "title_strength": string,
                        "thumbnail_strength": string,
                        "synergy": string,
                        "explanation": string,
                        "scores": {
                            "clickability": number,
                            "curiosity": number,
                            "brightness": number,
                            "relevance": number,
                            "emotion": number
                        }
                        }
                        `
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

        console.log('Multi-modal messages:', JSON.stringify(multiModalMessages, null, 2));

        // 🟨 使用 generateObject 並傳入 zod schema
        const result = await generateObject({
            model: openai('gpt-4o'),
            schema,
            messages: multiModalMessages
        });

        console.log('AI structured response:', result.object);

        // ✅ 回傳乾淨 JSON 給前端
        return NextResponse.json(result.object);

    } catch (error: any) {
        console.error('API chat error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
