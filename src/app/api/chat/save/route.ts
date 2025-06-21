// app/api/chat/save/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { saveChatToMongo } from '@/lib/chat-service/chat-service';


export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] 💾 API /chat/save called`);

  try {
    const data = await req.json();
    console.log(`[${new Date().toISOString()}] 📦 Body parsed`, {
      chatId: data.chatId,
      userId: data.userId,
      messageCount: data.messages?.length,
    });
    
    const dbStart = Date.now();
    await saveChatToMongo(data.chatId, data.messages, data.userId);
    const dbDuration = Date.now() - dbStart;

    console.log(`[${new Date().toISOString()}] ✅ Chat saved to DB in ${dbDuration}ms`);

    const totalDuration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ⏱ API /chat/save finished in ${totalDuration}ms`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Error in /chat/save`, err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
