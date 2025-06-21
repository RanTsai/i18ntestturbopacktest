"use client"
import { useState } from "react";
import { TreePanel } from "@/components/ui/treeview/tree-view";
import { PreviewPanel } from "@/components/ui/treeview/preview-panel";

export default function Page() {
  const [selectedId, setSelectedId] = useState("")

  return (
    <main className="grid grid-cols-[250px_1fr] h-screen">
      <TreePanel selectedId={selectedId} onSelect={setSelectedId} />
      <PreviewPanel selectedId={selectedId} onSelect={setSelectedId} />
    </main>
  )
}
