"use client";
import { useEffect, useState } from 'react';

export function useAIStream(payload: any) {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!payload) return;

    const controller = new AbortController();
    const decoder = new TextDecoder();
    let argsRaw = '';

    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/ai-dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        console.log('[useAIStream] payload:', payload)

        console.log('[useAIStream] response status:', res.status)

        if (!res.ok) throw new Error(`[${res.status}] ${res.statusText}`);

        const reader = res.body!.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          console.log('[useAIStream] raw chunk:', chunk); // 🔍 看每次拿到什麼

          const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
          for (const line of lines) {
            if (line.includes('[DONE]')) continue;
            try {
              const json = JSON.parse(line.replace('data: ', ''));
              const delta = json.choices?.[0]?.delta;
              const part = delta?.function_call?.arguments;
              if (typeof part === 'string') {
                console.log('[useAIStream] partial arguments:', part); // 🔍 每段 arguments

                argsRaw += part;
              }
            } catch (err) {
              console.warn('[useAIStream] JSON chunk parse error:', err);
            }
          }
        }

        setResult(JSON.parse(argsRaw)); // 最後整體 parse
      } catch (err) {
        console.error('[useAIStream] error:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [JSON.stringify(payload)]); // ✅ 確保只有 payload 變化才重新觸發

  return { result, loading, error };
}
