// File: components/tree-view.tsx
"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown } from "lucide-react"

const treeData = [
  {
    id: "paper",
    label: "Paper",
    children: [
      {
        id: "header",
        label: "Header container",
        children: [
          { id: "avatar", label: "Avatar" },
          { id: "header-title", label: "Header Title" },
          { id: "header-caption", label: "Header Caption" },
          { id: "action-button", label: "Action Button" },
        ],
      },
      { id: "image", label: "Image" },
      {
        id: "content",
        label: "Content",
        children: [{ id: "text-content", label: "Text Content" }],
      },
      {
        id: "action-bar",
        label: "Action Bar",
        children: [
          { id: "icon1", label: "Icon Button" },
          { id: "icon2", label: "Icon Button" },
        ],
      },
    ],
  },
]

function TreeItem({ node, onSelect, selectedId }: any) {
  const [expanded, setExpanded] = useState(true)

  const hasChildren = node.children?.length > 0

  return (
    <div className="ml-2">
      <div className="flex items-center">
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mr-1 text-muted-foreground"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <span className="mr-5" />
        )}
        <Button
          variant="ghost"
          className={cn(
            "justify-start w-full text-left hover:bg-accent",
            selectedId === node.id && "bg-purple-200 text-purple-900"
          )}
          onClick={() => onSelect(node.id)}
        >
          {node.label}
        </Button>
      </div>
      {expanded && node.children?.map((child: any) => (
        <TreeItem
          key={child.id}
          node={child}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  )
}

export function TreePanel({ selectedId, onSelect }: any) {
  return (
    <div className="border-r p-2 bg-muted h-full overflow-auto">
      {treeData.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  )
}
