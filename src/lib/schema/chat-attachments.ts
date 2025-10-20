// lib/schema/chat-attachments.ts
export type ChatAttachmentPart = {
  type: 'file';   // 建議一律 'file'，UI 依 mimeType 判斷即可
  url: string;              // 建議存可直接展示的小/中圖
  name?: string;
  mimeType?: string;        // 圖片至少是 image/*
  bytes?: number | null;
  stuffId?: number | null;  // 關聯 user_stuff.stuff_id
  variants?: {
    small?: string;
    medium?: string;
    original?: string;
  };
};


export type GenerateImageParams = {
  prompt: string;
  negativePrompt?: string;
  model?: string;         // 'gpt-image-1' 等
  size?: `${number}x${number}` | '1536x1024' | '1024x1536' | '1024x1024';
  steps?: number;
  seed?: number | null;
  cfg?: number | null;
  backend?: string; // 若未指定，伺服器用預設
};

export type GeneratedImagePart = import('@/lib/schema/chat-attachments').ChatAttachmentPart;

export type RawImageResult = {
  data?: ArrayBuffer;   // 後端回傳的二進位
  url?: string;         // 或者直接是 URL
  mimeType: string;     // 'image/png' | 'image/jpeg'
  filename?: string;
};

export interface ImageGenAdapter {
  generate(params: GenerateImageParams): Promise<RawImageResult[]>;
}
