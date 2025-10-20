"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

type ViewCard = {
  href: string;
  imgSrc: string;
  alt: string;
  label?: string;
};

type Props = {
  items: ViewCard[];
  height?: number;
  speedSec?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  className?: string;
  ariaLabel?: string;
};

export default function ViewStripScroller({
  items,
  height = 180,
  speedSec = 40,
  direction = "left",
  pauseOnHover = true,
  className,
  ariaLabel = "Related views preview",
}: Props) {
  const hasLoop = items.length > 1;
  const dirSign = direction === "left" ? -1 : 1;
  const loopItems = hasLoop ? [...items, ...items] : items;

  return (
    <section
      aria-label={ariaLabel}
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{ height }}
    >
      {/* 漸層遮罩（左右） */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-20" />

      {/* 外層用命名 group 只控制暫停動畫，不影響卡片放大 */}
      <div
        className={`group/marquee ${
          pauseOnHover ? "hover:[&>div]:[animation-play-state:paused]" : ""
        }`}
        style={{ height }}
      >
        <div
          className="absolute inset-0 flex"
          style={{
            animation: hasLoop ? `marquee ${speedSec}s linear infinite` : undefined,
            animationDirection: dirSign === -1 ? "normal" : "reverse",
            willChange: "transform",
          }}
        >
          {loopItems.map((card, i) => (
            // 單卡片命名 group：只放大被 hover 的圖片
            <Link
              href={card.href}
              key={`${card.href}-${i}`}
              className="group/card relative shrink-0 mx-3 rounded-xl overflow-hidden ring-1 ring-border hover:ring-foreground/30 transition-all duration-300 cursor-pointer"
              style={{
                height: height - 16,
                width: Math.round((height - 16) * (16 / 9)),
                alignSelf: "center",
              }}
              aria-label={card.label ?? card.alt}
            >
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={card.imgSrc}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 768px) 60vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-110"
                  priority={i < 2}
                />
              </div>

              {card.label && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/55 backdrop-blur-sm text-white text-xs px-2 py-1">
                  {card.label}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* 唯一的 styled-jsx：keyframes + reduce-motion */}
      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*='animation: marquee'] {
            animation: none !important;
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </section>
  );
}
