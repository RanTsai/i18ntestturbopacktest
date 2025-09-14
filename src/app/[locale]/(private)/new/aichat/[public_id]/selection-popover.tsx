// components/ui/chat/SelectionPopover.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { StickyNote, CornerDownRight } from "lucide-react";

export type SelectionPopoverProps = {
    open: boolean;
    anchorRect?: DOMRect | null;
    onInclude?: () => void;
    onAddNote?: () => void;
    onClose?: () => void;
    containerRef?: React.Ref<HTMLDivElement>; // ← 新增：讓父層帶 ref
}; export default function SelectionPopover({
    open,
    anchorRect,
    onInclude,
    onAddNote,
    onClose,
    containerRef, // ← 新增
}: SelectionPopoverProps) {
    if (!open || !anchorRect) return null;

    const gap = 6;
    const centerX = Math.max(8, anchorRect.left + anchorRect.width / 2);

    // 先嘗試放在上方
    let top = anchorRect.top - gap;
    let transform = "translate(-50%, -100%)";

    // 簡單防溢出：如果太靠近視窗頂端，就改放下方
    if (top < 12) {
        top = anchorRect.bottom + gap;
        transform = "translate(-50%, 0)"; // 下方不需要往上抬
    }


    return (
        <div
            role="dialog"
            aria-label="Text selection actions"
            className="fixed z-50"
            style={{ top, left: centerX, transform }}
            ref={containerRef} // ← 新增：把 ref 掛在這
            onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <div className="rounded-xl border border-border bg-popover shadow-lg px-1 py-1 flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={onInclude}>
                    <CornerDownRight className="size-4 mr-1" />
                    Include
                </Button>
                <Button variant="ghost" size="sm" onClick={onAddNote}>
                    <StickyNote className="size-4 mr-1" />
                    Add to note
                </Button>
                <div className="h-5 w-px bg-border mx-1" />
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close selection menu">
                    ✕
                </Button>
            </div>
        </div>
    );
}
