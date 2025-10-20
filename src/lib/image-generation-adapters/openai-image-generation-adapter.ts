// lib/tools/adapters/openai-image.ts
import OpenAI from 'openai';

export type GenerateImageParams = {
  prompt: string;
  negativePrompt?: string;
  size?: '1536x1024' | '1024x1536' | '1024x1024' | 'auto';
  steps?: number;
  seed?: number | null;
  cfg?: number | null;
  count?: number;   // 1-4
  model?: string;   // 預設 'gpt-image-1'
};

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateWithOpenAI(p: GenerateImageParams) {
  const model = p.model ?? 'gpt-image-1';
  const n = Math.min(Math.max(p.count ?? 1, 1), 4);
  const size = p.size ?? '1024x1024';

  // 最簡：把 negativePrompt 串在後面（之後可換別的 backend 再精細分欄）
  const prompt =
    p.prompt + (p.negativePrompt ? `\nNegative: ${p.negativePrompt}` : '');

  const res = await client.images.generate({
    model,
    prompt,
    size,
    n,
  });

  // 常見：res.data[i].b64_json 或 url（gpt-image-1 通常給 b64_json）
  const raws: { b64: string }[] = [];
  for (const it of res.data ?? []) {
    if (it.b64_json) raws.push({ b64: it.b64_json });
  }
  return raws;
}
