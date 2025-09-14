"use client";

import React, { useState, useMemo, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  Heart,
  Compass,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslationViewModel } from "@/lib/view-models/use-translation-view-model";
import { useRateCommunityChannelViewModel } from "@/lib/view-models/rate-community/rate-community-channel-view-model";
import type { ChannelSummary } from "@/lib/view-models/rate-community/types";
import { useRateCommunityFilterViewModel } from "@/lib/view-models/rate-community/rate-community-filter-view-model";

export default function ReviewOthersSideBar() {
  // ====== i18n ======
  const { locale } = useParams() as { locale: string };
  const pageId = "signed_up_upload_review";
  const { translation } = useTranslationViewModel(pageId, locale);

  // ====== VM：Channel（單一來源）======
  const {
    myChannels,
    followingChannels,
    exploreChannels,
    activeGroup,
    selectedChannelName,
    loading,
    ensureLoaded,
    select,
  } = useRateCommunityChannelViewModel();

    const {
      tags: selectedTags,
      locale: filterLocale,
  
      setSourceChannel,  
    } = useRateCommunityFilterViewModel();

  useEffect(() => {
    // 只載一次（VM 內會做 in-flight 保護/之後可接 IDB 命中）
    ensureLoaded();
  }, [ensureLoaded]);

  console.log("my channels", myChannels);
  console.log("following channels", followingChannels);

  // ====== 折疊 / 展開 ======
  const [isMyChannelsExpanded, setMyChannelsExpanded] = useState(true);
  const [isFollowingExpanded, setFollowingExpanded] = useState(true);
  const [isExploreExpanded, setExploreExpanded] = useState(false);

  const EXPANDED_W = 256; // w-64
  const COLLAPSED_W = 56; // narrow rail
  const [collapsed, setCollapsed] = useState(false);

  // ====== 選擇狀態與事件（改走 VM）======
  const isSelected = useCallback(
    (group: "my" | "following" | "explore", channelName: string) => {
      return activeGroup === group && selectedChannelName === channelName;
    },
    [activeGroup, selectedChannelName]
  );

  const handleHeaderToggle = useCallback(
    (group: "my" | "following" | "explore", setExpanded: Dispatch<SetStateAction<boolean>>) => {
      setExpanded((prev) => !prev); // OK
    },
    []
  );

  const handleSelect = useCallback(
    (group: "my" | "following" | "explore", channelName: string | null) => {
      select(group, channelName);
       setSourceChannel(channelName);
    },
    [select]
  );

  // ====== 可重用的使用者頭像清單（my / following / explore 三區共用）======
  const renderUserGrid = useCallback(
    (list: ChannelSummary[], group: "my" | "following" | "explore") => (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden flex flex-wrap gap-4 px-2 pt-2"
      >
        {list.map((user) => {
          const active = isSelected(group, user.channel_name);
          return (
            <Tooltip key={`${group}-${user.channel_name}`}>
              <TooltipTrigger asChild>
                <div
                  className="flex flex-col items-center w-16 cursor-pointer"
                  onClick={() => handleSelect(group, user.channel_name)}
                >
                  <Image
                    src={user.logo}
                    alt={user.channel_name}
                    width={40}
                    height={40}
                    className={cn(
                      "rounded-full mb-1 border-2 transition-all",
                      active ? "border-purple-500" : "border-transparent"
                    )}
                  />
                  {/* <span className="text-xs text-center truncate">
                    {user.channel_name}
                  </span> */}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {user.channel_name}
                {user.platform ? ` (${user.platform})` : ""}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </motion.div>
    ),
    [handleSelect, isSelected]
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] overflow-hidden relative z-40"
      aria-expanded={!collapsed}
    >
      {/* 收納時：點整個 Sidebar 區域即可展開 */}
      {collapsed && (
        <button
          className="absolute inset-0 z-20 bg-transparent"
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          title="Expand"
        />
      )}

      {/* 頂部切換鈕（永遠可見） */}
      <div className="p-2 flex justify-end">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-[var(--muted)] relative z-30"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {collapsed ? (
          // ====== 收納版：只顯示 ICON（提示各區塊），可搭配 Tooltip ======
          <motion.div
            key="collapsed-rail"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="pb-4"
          >
            <div className="flex flex-col items-center gap-4 pt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-10 w-10 rounded-xl bg-[var(--muted)] hover:bg-[var(--accent)] inline-flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">My Channels</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-10 w-10 rounded-xl bg-[var(--muted)] hover:bg-[var(--accent)] inline-flex items-center justify-center">
                    <Heart className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {translation?.your_following_section?.translation ?? "Your Following"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-10 w-10 rounded-xl bg-[var(--muted)] hover:bg-[var(--accent)] inline-flex items-center justify-center">
                    <Compass className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {translation?.explore_section?.translation ?? "Explore"}
                </TooltipContent>
              </Tooltip>
            </div>
          </motion.div>
        ) : (
          // ====== 展開版：完整內容（資料全來自 ChannelViewModel） ======
          <motion.div
            key="expanded-content"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col p-4 pt-0 space-y-4"
          >
            <nav className="flex-1 flex flex-col space-y-2">
              {/* My Channels */}
              <div className="w-full">
                <div
                  className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                  onClick={() => handleHeaderToggle("my", setMyChannelsExpanded)}
                >
                  <span className="text-sm font-medium">My Channels</span>
                  {isMyChannelsExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
                <AnimatePresence initial={false}>
                  {isMyChannelsExpanded && renderUserGrid(myChannels ?? [], "my")}
                </AnimatePresence>
              </div>

              {/* Following */}
              <div className="w-full">
                <div
                  className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                  onClick={() => handleHeaderToggle("following", setFollowingExpanded)}
                >
                  <span className="text-sm font-medium">
                    {translation?.your_following_section?.translation ?? "Your Following"}
                  </span>
                  {isFollowingExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
                <AnimatePresence initial={false}>
                  {isFollowingExpanded && renderUserGrid(followingChannels ?? [], "following")}
                </AnimatePresence>
              </div>

              {/* Explore */}
              <div className="w-full">
                <div
                  className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                  onClick={() => handleHeaderToggle("explore", setExploreExpanded)}
                >
                  <span className="text-sm font-medium">
                    {translation?.explore_section?.translation ?? "Explore"}
                  </span>
                  {isExploreExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
                <AnimatePresence initial={false}>
                  {isExploreExpanded && renderUserGrid(exploreChannels ?? [], "explore")}
                </AnimatePresence>
              </div>
            </nav>

            <div className="text-xs text-muted-foreground mt-auto">© 2025 Mr. Click</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 你也可以在這裡顯示 loading skeleton（載入頻道時） */}
      {/* {loading && <div className="p-4 text-xs text-muted-foreground">Loading channels...</div>} */}
    </motion.aside>
  );
}
