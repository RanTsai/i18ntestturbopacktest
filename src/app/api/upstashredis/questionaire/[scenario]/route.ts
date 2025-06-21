// app/api/upstashredis/questionnaire/[scenario]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/actions/upstashredis/redis'

interface PostBody {
  locale: string
  content: any
}

export async function POST(req: NextRequest, { params }: { params: { scenario: string } }) {
  const { locale, content } = (await req.json()) as PostBody

  if (!locale || typeof content !== 'object') {
    return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 })
  }

  const key = `questionnaire:${params.scenario}:${locale}`

  try {
    const payload = JSON.stringify(content)
    await redis.set(key, payload, { ex: 3600 }) // 可選：1 小時過期
    return NextResponse.json({ success: true, key })
  } catch (error) {
    console.error('❌ Redis set failed:', error)
    return NextResponse.json({ success: false, error: 'Redis error' }, { status: 500 })
  }
}


export async function GET(req: NextRequest, { params }: { params: { scenario: string } }) {
  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale') || 'en'
  const fallback = searchParams.get('fallback') === 'true'

  const key = `questionnaire:${params.scenario}:${locale}`
  const data = await redis.get<string>(key)

 if (data) {
  try {
    return NextResponse.json({ found: true, locale, content: JSON.parse(data) })
  } catch (err) {
    console.error('❌ Redis JSON parse failed for key', key, 'value was:', data)
    return NextResponse.json({ found: false, locale, error: 'Invalid JSON in Redis' }, { status: 500 })
  }
}

  if (fallback && locale !== 'en') {
    const fallbackKey = `questionnaire:${params.scenario}:en`
    const fallbackData = await redis.get<string>(fallbackKey)
    if (fallbackData) {
      return NextResponse.json({ found: true, fallback: true, locale: 'en', content: JSON.parse(fallbackData) })
    }
  }

  return NextResponse.json({ found: false, locale })
}
