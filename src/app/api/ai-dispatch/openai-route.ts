
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';


// 2️⃣ 處理 POST 請求
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
    // 🟩 從 input 中萃取 URL（假設 input 內部包含圖片 URL）
    const imageUrl = extractUrl(lastUserMessage);
    console.log('Extracted image URL:', imageUrl);

    // 🟦 多模態訊息組成
    const multiModalMessages = [
      {
        role: 'system' as const,
        content: 'You are a thumbnail analyser, return your answer in this format:\n1. Overall Impression\n2. Title Strength\n3. Thumbnail Strength\n4. Synergy\n5. Suggestions'
      },
      {
        role: 'user' as const,
        content: [
          {
            type: 'text' as const,
            text: lastUserMessage
          },
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
    // 🟨 使用 Vercel AI SDK 進行多模態流式請求
    const completion = streamText({
      model: openai('gpt-4o'),
      messages: multiModalMessages
    });

    // ✅ 回傳流式資料給前端
    return completion.toDataStreamResponse();

  } catch (error: any) {
    console.error('API chat error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// 3️⃣ 萃取 URL 的工具函式
function extractUrl(input: any): string {
  // ✅ 如果 input 本身是物件，從 text 屬性拿字串
  if (typeof input === "object" && input.text) {
    input = input.text;
  }

  // ✅ 如果 input 不是字串，直接回空字串
  if (typeof input !== "string") return "";

  // ✅ 萃取 URL
  const match = input.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : "";
}
