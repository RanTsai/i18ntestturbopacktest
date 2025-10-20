// lib/tools/adapters/replicate-image.ts
import Replicate, {FileOutput } from "replicate";

export type ReplicateGenerateParams = {
  prompt: string;
  negativePrompt?: string;
  aspect_ratio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  output_format?: "png" | "jpg" | "webp";
  output_quality?: number; // 1~100
  model?: string;          // 預設 FLUX Schnell
};

type ReplicateRawOutput = string | FileOutput | (string | FileOutput)[];

export async function generateWithReplicate(
  p: ReplicateGenerateParams
): Promise<(string | Blob)[]> {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("Missing REPLICATE_API_TOKEN");
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
    useFileOutput: true,
  });

  const model = p.model ?? "black-forest-labs/flux-schnell";
  const input: Record<string, unknown> = {
    prompt: p.prompt + (p.negativePrompt ? `\nNegative: ${p.negativePrompt}` : ""),
    aspect_ratio: p.aspect_ratio ?? "1:1",
    output_format: p.output_format ?? "png",
    output_quality: p.output_quality ?? 90,
  };

  // 用聯合型別取代 any
  const raw = (await replicate.run(
    model as `${string}/${string}`,
    { input }
  )) as ReplicateRawOutput;

  const out: (string | Blob)[] = [];

  const pushFromItem = async (it: string | FileOutput | null | undefined) => {
    if (!it) return;
    if (typeof it === "string") {
      out.push(it);
      return;
    }
    if (typeof it.url === "function") {
      out.push(String(it.url()));
      return;
    }
    if (typeof it.blob === "function") {
      const b = await it.blob();
      out.push(b);
      return;
    }
  };

  if (Array.isArray(raw)) {
    for (const it of raw) {
      await pushFromItem(it);
    }
  } else {
    await pushFromItem(raw);
  }

  console.log("[Replicate parsed outputs] count =", out.length);
  return out;
}