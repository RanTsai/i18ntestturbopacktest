// ============================
// 5. /lib/hooks/useAIStream.ts
// ============================
"use client";
import { useEffect, useState } from 'react'

export function useAIStream(url: string, payload: any) {
  const [result, setResult] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let controller = new AbortController()
    let full = ''
    const run = async () => {
      setLoading(true)
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        })
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
          for (const line of lines) {
            if (line.includes('[DONE]')) continue
            try {
              const json = JSON.parse(line.replace('data: ', ''))
              const delta = json.choices?.[0]?.delta
              const args = delta?.function_call?.arguments
              if (args) full += args
            } catch {}
          }
        }
        setResult(JSON.parse(full))
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }
    run()
    return () => controller.abort()
  }, [url, JSON.stringify(payload)])

  return { result, loading, error }
}
