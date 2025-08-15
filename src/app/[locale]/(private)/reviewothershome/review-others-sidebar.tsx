"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  Heart,
  Compass,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import MyChannelSelector from "@/components/upload/channel-selector"
import UserChannelStore from "@/lib/global-store/user-channel-store"
import { UseLoadChannels } from "@/hooks/loading-user-data/load-channels"
import useReviewFilterStore from "@/lib/global-store/human-review-filter-store"
import { IUserChannel } from "@/lib/schema/user-channel-schema"
import FollowingChannelStore from "@/lib/global-store/following-channel-store"
import { IFollowingChannel } from "@/lib/schema/human-review-schema"
import useTranslationStore from "@/lib/global-store/use-translation-store"
import { PageTranslations } from "@/i18n/interface"

interface ReviewOthersSideBarProps {
  pageId: string
  setShowSidebar?: (open: boolean) => void
  fallbackTranslations?: PageTranslations
}

export default function ReviewOthersSideBar({
  pageId,
  setShowSidebar,
  fallbackTranslations,
}: ReviewOthersSideBarProps) {
  const [isMyChannelsExpanded, setMyChannelsExpanded] = useState(true)
  const [isFollowingExpanded, setFollowingExpanded] = useState(true)
  const [isFollowersExpanded, setFollowersExpanded] = useState(false)
  const { getTranslation, setTranslation } = useTranslationStore()
  const [translations, setTranslations] = useState<PageTranslations | null>(null)

  const { locale } = useParams() as { locale: string }
  const {
    userChannels,
    setChannels,
    selectedChannel,
    setSelectedChannel,
  } = UserChannelStore()

  const {
    selectedMyChannelId,
    selectedFollowingChannelId,
    activeFilterGroup,
    setMyChannel,
    setFollowingChannel,
  } = useReviewFilterStore()

  const { followingChannels, fetchFollowingChannels } = FollowingChannelStore()

  UseLoadChannels()

  useEffect(() => {
    fetchFollowingChannels()
  }, [fetchFollowingChannels])

  useEffect(() => {
    const cached = getTranslation(pageId, locale)
    if (cached) {
      setTranslations(cached)
    } else if (fallbackTranslations) {
      setTranslation(pageId, locale, fallbackTranslations)
      setTranslations(fallbackTranslations)
    }
  }, [locale, fallbackTranslations])

  const followingIds = useMemo(
    () => followingChannels?.map((c) => c.user_channel_id) ?? [],
    [followingChannels]
  )

  const myChannelId = selectedChannel?.user_channel_id ?? null

  const exploreUsers: IUserChannel[] = useMemo(() => {
    return (userChannels ?? []).filter(
      (c) =>
        c.user_channel_id !== myChannelId &&
        !followingIds.includes(c.user_channel_id)
    )
  }, [userChannels, myChannelId, followingIds])

  const handleSelect = (
    type: "my" | "following" | "explore",
    id: number,
    channel?: IUserChannel
  ) => {
    if (type === "my") {
      if (activeFilterGroup === "myChannels" && selectedMyChannelId === id) {
        setMyChannel(null)
        setSelectedChannel(null)
      } else {
        setMyChannel(id)
        setSelectedChannel(channel ?? null)
      }
    } else if (type === "following") {
      if (activeFilterGroup === "following" && selectedFollowingChannelId === id) {
        setFollowingChannel(null)
      } else {
        setFollowingChannel(id)
        setSelectedChannel(null)
      }
    } else {
      if (activeFilterGroup === "myChannels" && selectedMyChannelId === id) {
        setMyChannel(null)
        setSelectedChannel(null)
      } else {
        setMyChannel(id)
        setSelectedChannel(channel ?? null)
      }
    }
  }

  const isSelected = (type: "my" | "following" | "explore", id: number) => {
    if (type === "my" || type === "explore") {
      return activeFilterGroup === "myChannels" && selectedMyChannelId === id
    }
    if (type === "following") {
      return activeFilterGroup === "following" && selectedFollowingChannelId === id
    }
    return false
  }

  const renderUserGrid = (
    list: IFollowingChannel[] | IUserChannel[],
    type: "following" | "explore"
  ) => (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden flex flex-wrap gap-4 px-2 pt-2"
    >
      {list.map((user) => {
        const isActive = isSelected(type, user.user_channel_id)

        return (
          <Tooltip key={user.user_channel_id}>
            <TooltipTrigger asChild>
              <div
                className="flex flex-col items-center w-16 cursor-pointer"
                onClick={() =>
                  handleSelect(type, user.user_channel_id, user as IUserChannel)
                }
              >
                <Image
                  src={user.logo}
                  alt={user.channel_name}
                  width={40}
                  height={40}
                  className={cn(
                    "rounded-full mb-1 border-2 transition-all",
                    isActive ? "border-purple-500" : "border-transparent"
                  )}
                />
                <span className="text-xs text-center truncate">
                  {user.channel_name}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {user.channel_name}
              {user.platform ? ` (${user.platform})` : ""}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </motion.div>
  )

  // ====== 新增：收納 / 展開邏輯 ======
  const EXPANDED_W = 256 // w-64
  const COLLAPSED_W = 56 // 窄欄
  const [collapsed, setCollapsed] = useState(false)

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

      {/* 內容：展開時渲染完整；收納時只渲染 ICON 欄 */}
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
                  {translations?.your_following_section?.translation ?? "Your Following"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-10 w-10 rounded-xl bg-[var(--muted)] hover:bg-[var(--accent)] inline-flex items-center justify-center">
                    <Compass className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {translations?.explore_section?.translation ?? "Explore"}
                </TooltipContent>
              </Tooltip>
            </div>
          </motion.div>
        ) : (
          // ====== 展開版：完整內容 ======
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
                <MyChannelSelector
                  expanded={isMyChannelsExpanded}
                  setExpanded={setMyChannelsExpanded}
                  userChannels={userChannels ?? []}
                  setSelectedChannel={setSelectedChannel}
                  pageId={pageId}
                  selectedId={selectedMyChannelId ? String(selectedMyChannelId) : null}
                  setSelectedId={(id: string | null) => setMyChannel(id ? Number(id) : null)}
                  setMyChannel={setMyChannel}
                />
              </div>

              {/* Following */}
              <div className="w-full">
                <div
                  className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                  onClick={() => {
                    setFollowingExpanded((v) => !v)
                    setFollowingChannel(null)
                  }}
                >
                  <span className="text-sm font-medium">
                    {translations?.your_following_section?.translation ?? "Your Following"}
                  </span>
                  {isFollowingExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
                <AnimatePresence initial={false}>
                  {isFollowingExpanded &&
                    renderUserGrid(followingChannels ?? [], "following")}
                </AnimatePresence>
              </div>

              {/* Explore */}
              <div className="w-full">
                <div
                  className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                  onClick={() => {
                    setFollowersExpanded((v) => !v)
                    setMyChannel(null)
                    setSelectedChannel(null)
                  }}
                >
                  <span className="text-sm font-medium">
                    {translations?.explore_section?.translation ?? "Explore"}
                  </span>
                  {isFollowersExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
                <AnimatePresence initial={false}>
                  {isFollowersExpanded && renderUserGrid(exploreUsers ?? [], "explore")}
                </AnimatePresence>
              </div>
            </nav>

            <div className="text-xs text-muted-foreground mt-auto">© 2025 Mr. Click</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}
