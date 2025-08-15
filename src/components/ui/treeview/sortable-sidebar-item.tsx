//app/[locale]/(private)/humanreviewdesign/sortable-sidebar-item.tsx
"use client"

import React, { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, MoreVertical, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  id: string
  label: string
  isActive: boolean
  onClick: () => void
  onDelete: () => void
  onRename: (newLabel: string) => void
}

export default function SortableSidebarItem({
  id,
  label,
  isActive,
  onClick,
  onDelete,
  onRename,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(label)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleRenameConfirm = () => {
    onRename(inputValue.trim() || label)
    setIsEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-muted",
        isActive && "bg-muted font-semibold"
      )}
    >
      <div className="flex items-center gap-2 w-full" onClick={!isEditing ? onClick : undefined}>
        <div
          {...listeners}
          {...attributes}
          className="opacity-0 group-hover:opacity-100 cursor-grab"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {!isEditing ? (
          <span className="truncate text-sm flex-1">{label}</span>
        ) : (
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameConfirm()
              if (e.key === "Escape") setIsEditing(false)
            }}
            onBlur={handleRenameConfirm}
            className="text-sm bg-transparent border-b border-muted-foreground outline-none flex-1"
            autoFocus
          />
        )}
      </div>

      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
        {!isEditing && (
          <MoreVertical
            className="w-4 h-4 cursor-pointer text-muted-foreground"
            onClick={() => setIsEditing(true)}
          />
        )}
        <X
          className="w-4 h-4 text-destructive cursor-pointer"
          onClick={onDelete}
        />
      </div>
    </div>
  )
}
