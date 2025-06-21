// File: components/preview-panel.tsx
"use client"
import { cn } from "@/lib/utils"

const sectionList = [
  "avatar",
  "header-title",
  "header-caption",
  "image",
  "text-content",
  "action-bar",
  "icon1",
  "icon2",
]

export function PreviewPanel({ selectedId, onSelect }: { selectedId: string, onSelect: (id: string) => void }) {
  const highlight = (id: string) =>
    cn("rounded-md p-1 cursor-pointer", selectedId === id && "ring-2 ring-purple-500")

  return (
    <div className="p-6 flex justify-center items-center bg-background">
      <div className="w-[360px] bg-card text-card-foreground rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-center gap-4">
          <div onClick={() => onSelect("avatar")} className={highlight("avatar")}>
            <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center">
              R
            </div>
          </div>
          <div>
            <h3
              className={highlight("header-title")}
              onClick={() => onSelect("header-title")}
            >
              Shrimp and Chorizo Paella
            </h3>
            <p
              className={highlight("header-caption")}
              onClick={() => onSelect("header-caption")}
            >
              September 14, 2016
            </p>
          </div>
        </div>
        <img
          src="/thumbnail1.png"
          alt="Paella dish"
          onClick={() => onSelect("image")}
          className={highlight("image") + " w-full max-h-60 object-cover"}
        />
        <div
          className={highlight("text-content") + " p-4 text-sm"}
          onClick={() => onSelect("text-content")}
        >
          This impressive paella is a perfect party dish and a fun meal to cook together with your guests.
        </div>
        <div
          className={highlight("action-bar") + " flex gap-4 p-4"}
          onClick={() => onSelect("action-bar")}
        >
          <span onClick={() => onSelect("icon1")} className={highlight("icon1")}>❤️</span>
          <span onClick={() => onSelect("icon2")} className={highlight("icon2")}>🔗</span>
        </div>
      </div>
    </div>
  )
}