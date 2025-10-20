// lib/tools/toolRegistry.ts
// import { z } from 'zod';
// import { tool } from 'ai';
// import { generateWithOpenAI, type GenerateImageParams } from './openai-image-generation-adapter';
// import { persistRawImagesToPartsSingle } from './persist-generated';

// export const imageGenerateTool = tool({
//   description: 'Generate images from a prompt; supports optional negative prompt & size.',
//   parameters: z.object({
//     prompt: z.string(),
//     negativePrompt: z.string().optional(),
//     model: z.string().optional(),
//     size: z.enum(['1536x1024', '1024x1536', '1024x1024', 'auto']).optional(),
//     steps: z.number().optional(),
//     seed: z.number().nullable().optional(),
//     cfg: z.number().nullable().optional(),
//     count: z.number().min(1).max(4).optional(),
//   }),
//   async execute(args, _options) {
//     console.log('[TOOL CALLED] image_generate args:', args);
//     const raws = await generateWithOpenAI(args as GenerateImageParams);
//     const parts = await persistRawImagesToPartsSingle(raws, { source: 'generated', type: 'thumbnail' });
//     console.log('[TOOL COMPLETED] parts:', parts.length);
//     return { parts };
//   },
// });

// export const toolRegistry = {
//   image_generate: imageGenerateTool,
// };

// lib/tools/toolRegistry.ts
// lib/tools/toolRegistry.ts
import { z } from "zod";
import { tool } from "ai";
import { generateWithReplicate } from "./replicate-image-adapter";
import { persistMixedImagesToParts } from "./persist-generated";

export const imageGenerateTool = tool({
  description: "Generate images from a prompt; supports optional negative prompt & size.",
  parameters: z.object({
    prompt: z.string(),
    negativePrompt: z.string().optional(),
    aspect_ratio: z.enum(["1:1","16:9","9:16","4:3","3:4"]).optional(),
    output_format: z.enum(["png","jpg","webp"]).optional(),
    output_quality: z.number().min(1).max(100).optional(),
    model: z.string().optional(),
  }),
  async execute(args) {
    console.log("[TOOL CALLED] image_generate with args:", args);
    const raws = await generateWithReplicate(args);
    console.log("[Replicate parsed outputs]", raws.map(x => typeof x).join(", "));

    const parts = await persistMixedImagesToParts(raws, { source: "generated", type: "thumbnail" });
    console.log("[TOOL COMPLETED] generated parts:", parts.length);

    return { parts };
  },
});

export const toolRegistry = {
  image_generate: imageGenerateTool,
};
