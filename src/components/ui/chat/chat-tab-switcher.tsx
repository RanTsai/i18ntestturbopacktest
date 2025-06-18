// components/ui/chat/chat-tab-switcher.tsx
"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ChatTab = "chat" | "versions";

interface Props {
  value: ChatTab;
  onChange: (tab: ChatTab) => void;
}

export default function ChatTabSwitcher({ value, onChange }: Props) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as ChatTab)}>
      <TabsList className="bg-muted text-white">
        <TabsTrigger value="chat">Chat History</TabsTrigger>
        <TabsTrigger value="versions">Thumbnail Versions</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
