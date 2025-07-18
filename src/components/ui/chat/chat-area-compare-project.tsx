"use client";

import React from "react";
import { Menu, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Messages from "./messages";
import ChatListBar from "./chat-list-sidebar";
import ThumbnailCard from "../review/thumbnail-card";
import { mockChatSession } from "./mockdata";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog"; // shadcn dialog

import ReviewCard from "@/components/ui/review/reviewcard";

export default function ChatAreaCompareProject() {
  const [showSidebar, setShowSideBar] = React.useState(false);
  const [messages, setMessages] = React.useState<any[]>(mockChatSession.messages);
  const [input, setInput] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("idle");
  const [userSelectedId, setUserSelectedId] = React.useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = React.useState<Set<string>>(new Set());
  const [aiHighlightedIds, setAIHighlightedIds] = React.useState<Set<string>>(new Set(["v2", "v4"])); // 範例高亮
  const [reviewDialogOpen, setReviewDialogOpen] = React.useState(false);
  const [reviewData, setReviewData] = React.useState<{
    thumbnailUrl: string;
    title: string;
    score: number;
    aspects: number[];
    aiMarkdown: string;
  } | null>(null);


  const handleSelect = (id: string, selected: boolean) => {
    setUserSelectedId(selected ? id : null);
  };

  const handleToggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleReview = (id: string) => {
    const item = mockChatSession.thumbnailVersions.find(v => v.id === id);
    if (!item) return;

    setReviewData({
      thumbnailUrl: item.imageUrl,
      title: item.title ?? `Thumbnail ${id}`,
      score: 4.2,
      aspects: [4.1, 3.8, 4.5, 3.9, 4.0],
      aiMarkdown: "AI thinks this thumbnail could be more eye-catching.",
    });

    setReviewDialogOpen(true);
  };

  const handleDownload = (id: string) => {
    console.log("Downloading:", id);
  };



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const extractMentionedThumbnailIds = (text: string): string[] => {
    const ids = mockChatSession.thumbnailVersions.map((v) => v.id);
    return ids.filter((id) => text.includes(id));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const aiReply = {
      role: "ai",
      content: `Here's my response to: ${input}`,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setStatus("streaming");

    setTimeout(() => {
      const mentionedIds = extractMentionedThumbnailIds(input);
      setAIHighlightedIds(new Set(mentionedIds));

      setMessages((prev) => [...prev, aiReply]);
      setStatus("ready");
    }, 800);
  };

  return (
  <div className="bg-[var(--background)] text-[var(--foreground)] h-screen grid grid-rows-[auto_1fr_auto]">
    {/* Sticky Header + Tabs */}
    <div className="sticky top-0 z-20 bg-[var(--background)] border-b border-[var(--border)]">
      {/* Thumbnail Select Row */}
      <div className="grid grid-cols-4 gap-3 px-5 pb-4 h-[240px] overflow-y-auto">
        {mockChatSession.thumbnailVersions.map((version) => {
          const isUserSelected = userSelectedId === version.id;
          const isAIHighlighted = aiHighlightedIds.has(version.id);
          const highlightType = isUserSelected
            ? "user"
            : isAIHighlighted
              ? "ai"
              : null;

          return (
            <ThumbnailCard
              key={version.id}
              id={version.id}
              imageUrl={version.imageUrl}
              versionLabel={version.versionLabel ?? 1}
              isSelected={isUserSelected}
              isFavorite={favoriteIds.has(version.id)}
              highlightType={highlightType}
              onSelect={handleSelect}
              onToggleFavorite={handleToggleFavorite}
              onDownload={handleDownload}
              onReview={handleReview}
            />
          );
        })}
      </div>
    </div>

    {/* Main Area */}
    <div className="flex-1 px-5 overflow-auto">
      <Messages messages={messages} status={status} onAddToVersions={() => {}} />
    </div>

    {/* Fixed Bottom Input */}
    <div className="p-5 bg-[var(--card)] border-t border-[var(--border)]">
      <form onSubmit={handleSubmit} className="relative">
        <input
          name="prompt"
          value={input}
          onChange={handleInputChange}
          id="input"
          placeholder="Type your message..."
          className="flex-1 w-full p-2 text-[var(--foreground)] bg-transparent border border-[var(--border)] rounded focus:outline-none pr-10"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          <Send size={16} />
        </Button>
      </form>
    </div>

    {/* Sidebar Drawer (Mobile) */}
    <Sheet open={showSidebar} onOpenChange={setShowSideBar}>
      <SheetContent side="left" className="w-64 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] p-0">
        <ChatListBar setShowSidebar={setShowSideBar} userId={null} supabaseUserWorkId={null} />
      </SheetContent>
    </Sheet>

    <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
      <DialogContent className="max-w-3xl bg-[var(--card)] border-[var(--border)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--foreground)] text-lg">Thumbnail Review</DialogTitle>
          <DialogDescription className="text-[var(--muted-foreground)]">
            AI-generated feedback on the selected thumbnail
          </DialogDescription>
        </DialogHeader>

        {reviewData && (
          <ReviewCard
            thumbnailUrl={reviewData.thumbnailUrl}
            title={reviewData.title}
            score={reviewData.score}
            aspects={reviewData.aspects}
            aiMarkdown={reviewData.aiMarkdown}
          />
        )}
      </DialogContent>
    </Dialog>
  </div>
);

}
