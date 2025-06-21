import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextRequest } from 'next/server';
import { AIResponseSchema } from '@/lib/schema/aiscore-schema';
import { zodToJsonSchema } from 'zod-to-json-schema';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const userMessage = messages.reverse().find((m: any) => m.role === 'user');

    if (!userMessage || !Array.isArray(userMessage.content)) {
      return Response.json({ error: 'Invalid user message' }, { status: 400 });
    }

    const textPart = userMessage.content.find((c: any) => c.type === 'text')?.text || '';
    const imagePart = userMessage.content.find((c: any) => c.type === 'image');

    const schema = zodToJsonSchema(AIResponseSchema);

    const result = await generateObject({
      model: google("gemini-2.5-pro-preview-05-06"),
      schema: AIResponseSchema,
      messages: [
        {
          role: "system",
          content: `You are a thumbnail analyser. Please give structured JSON response in the following schema:\n${JSON.stringify(schema)}`
        },
        {
          role: "user",
          content: [
            { type: "text", text: textPart },
            ...(imagePart ? [imagePart] : [])
          ]
        }
      ]
    });

    return Response.json(result.object);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
