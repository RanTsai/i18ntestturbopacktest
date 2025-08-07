// mockdata.ts

import { Question } from "@/lib/schema/questionaire-schema";

export const mockQuestions: Question[] = [
  {
    id: "q1",
    type: "image-select",
    label: "請選擇你覺得表現最佳的縮圖",
    required: true,
    options: [
      { value: "thumb_1", label: "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails//TheMonkeyMan%20V3.jpg" },
      { value: "thumb_2", label: "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails//artwork%20(4).png" },
      { value: "thumb_3", label: "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails//Thumbnail%20-%20Short%202.png" },
      { value: "thumb_4", label: "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails//Thumbnail%20-%20Short%201.png" }
    ]
  },
  {
    id: "q1_reason",
    type: "text",
    label: "請簡述你選擇此縮圖的原因",
    required: true,
    placeholder: "輸入原因…"
  },
  {
    id: "q2",
    type: "title-select",
    label: "請選擇你覺得最吸引人的標題",
    required: true,
    options: [
      { value: "title_1", label: "你不會相信發生了什麼事…" },
      { value: "title_2", label: "這是2024最好的教學影片" },
      { value: "title_3", label: "看完這部影片，你會重新思考人生" },
      { value: "title_4", label: "這個標題為何點閱率爆炸？原因竟然是…" }
    ]
  },
  {
    id: "q2_reason",
    type: "text",
    label: "請簡述你選擇此標題的原因",
    required: true,
    placeholder: "輸入原因…"
  }
]
