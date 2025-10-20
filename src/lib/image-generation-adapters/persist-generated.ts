// lib/tools/adapters/persist-generated.ts
import sharp from 'sharp';
import { ulid } from 'ulid';
import { insertUserStuffRecord } from '@/actions/supabase/supabase-user-stuff';
import { uploadThumbnailAndGetUrlWithPath } from '@/actions/supabase/supabase-images';
import type { ChatAttachmentPart } from '@/lib/schema/chat-attachments';
import { getErrorMessage } from '../utils/message-utils';


// 任意輸入 (遠端 URL 或 Blob) 轉 Node Buffer
async function toBuffer(input: string | Blob): Promise<Buffer> {
  if (typeof input === 'string') {
    const res = await fetch(input);
    if (!res.ok) throw new Error(`fetch image failed: ${res.status}`);
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } else {
    const ab = await input.arrayBuffer();
    return Buffer.from(ab);
  }
}

async function makeVariantJpeg(buf: Buffer, maxEdge: number, quality = 90) {
  // 以最長邊等比縮放到 maxEdge 以內
  const s = sharp(buf, { failOn: 'none' });
  const meta = await s.metadata();

  const resized = await sharp(buf)
    .resize({
      width: meta.width && meta.height && meta.width >= meta.height ? maxEdge : undefined,
      height: meta.width && meta.height && meta.height > meta.width ? maxEdge : undefined,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality, chromaSubsampling: '4:4:4' })
    .toBuffer();

  const rmeta = await sharp(resized).metadata();
  return {
    buffer: resized,
    width: rmeta.width ?? meta.width ?? 0,
    height: rmeta.height ?? meta.height ?? 0,
    byteSize: resized.byteLength,
  };
}
function bufferToArrayBuffer(buf: Buffer): ArrayBuffer {
  const ab = new ArrayBuffer(buf.byteLength);
  new Uint8Array(ab).set(buf); // 寫入拷貝，避免 SharedArrayBuffer 型別
  return ab;
}

// 安全建立 File（BlobPart = ArrayBuffer OK）
function fileFromBuffer(buf: Buffer, filename: string, type: string) {
  const ab = bufferToArrayBuffer(buf);
  return new File([ab], filename, { type });
}

export async function persistMixedImagesToParts(
  inputs: (string | Blob)[],
  opts?: { type?: 'thumbnail' | 'cover' | 'icon' | 'intext'; source?: 'generated' }
): Promise<ChatAttachmentPart[]> {
  const parts: ChatAttachmentPart[] = [];

  for (const inp of inputs) {
    try {
      const baseBuf = await toBuffer(inp);

      // 這三個請保持回傳 { buffer: Buffer, width, height, byteSize }
      const orig = await makeVariantJpeg(baseBuf, 1600, 90);
      const med  = await makeVariantJpeg(baseBuf, 800, 88);
      const sm   = await makeVariantJpeg(baseBuf, 320, 85);

      const now = new Date();
      const stem = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}/${ulid()}`;

      // ✅ 用 fileFromBuffer，而不是直接 new File([Uint8Array(...])
      const fOrig = fileFromBuffer(orig.buffer, `${stem}.jpg`,  'image/jpeg');
      const fMed  = fileFromBuffer(med.buffer,  `${stem}_m.jpg`, 'image/jpeg');
      const fSm   = fileFromBuffer(sm.buffer,   `${stem}_s.jpg`, 'image/jpeg');

      const [r1, r2, r3] = await Promise.all([
        uploadThumbnailAndGetUrlWithPath(fOrig, `images/${stem}.jpg`),
        uploadThumbnailAndGetUrlWithPath(fMed,  `images/${stem}_m.jpg`),
        uploadThumbnailAndGetUrlWithPath(fSm,   `images/${stem}_s.jpg`),
      ]);
      if (!r1?.success || !r2?.success || !r3?.success) {
        console.warn('[persistMixed] upload failed, skip one image');
        continue;
      }

      const inserted = await insertUserStuffRecord({
        original_url: r1.url!, medium_url: r2.url!, small_url: r3.url!,
        name: 'ai-generated.jpg',
        mime_type: 'image/jpeg',
        byte_size: orig.byteSize,
        width: orig.width, height: orig.height,
        checksum: crypto.randomUUID(),
        source: opts?.source ?? 'generated',
        type: opts?.type ?? 'thumbnail',
      });
      const stuffId = inserted?.data?.stuff_id ?? null;

      parts.push({
        type: 'file',
        url: r3.url!, // 對話先用小圖
        name: 'ai-generated.jpg',
        mimeType: 'image/jpeg',
        bytes: orig.byteSize,
        stuffId,
        variants: { small: r3.url!, medium: r2.url!, original: r1.url! },
      });
    } catch (e: unknown) {
      const message = getErrorMessage(e);
      console.error('[persistMixed] one image failed:', message || e);
    }
  }

  return parts;
}