// components/ui/scroll/WheelToHorizontal.tsx
"use client"

import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  children: React.ReactNode
  revealScrollbarMs?: number  // 停止滾動後多久隱藏
  speed?: number              // 滾輪轉水平的速度倍率
}

export default function WheelToHorizontal({
  className,
  children,
  revealScrollbarMs = 1500,
  speed = 1,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      // 允許縮放手勢
      if (e.ctrlKey) return

      const canScrollX = el.scrollWidth > el.clientWidth
      if (!canScrollX) return

      // 只有當垂直滾超過水平滾時才攔截（觸控板水平滑仍保留）
      const mainlyVertical = Math.abs(e.deltaY) > Math.abs(e.deltaX)
      if (!mainlyVertical) return

      e.preventDefault() // 關鍵：攔截預設垂直滾動
      el.scrollBy({ left: e.deltaY * speed, behavior: "auto" })
      setShow(true)
      // 停止後自動隱藏捲軸
      window.clearTimeout((el as any).__hideScrollbarTimer)
      ;(el as any).__hideScrollbarTimer = window.setTimeout(() => setShow(false), revealScrollbarMs)
    }

    // 要 passive:false 才能 preventDefault
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => {
      el.removeEventListener("wheel", onWheel as any)
      window.clearTimeout((el as any).__hideScrollbarTimer)
    }
  }, [revealScrollbarMs, speed])

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-x-auto",        // 保留水平滾動
        show ? "scrollbar-visible" : "hide-scrollbar", // 你的自動顯示/隱藏樣式
        className
      )}
    >
      {children}
    </div>
  )
}
