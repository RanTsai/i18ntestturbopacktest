"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"
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
    pageId: string;
    setShowSidebar?: (open: boolean) => void;
    fallbackTranslations?: PageTranslations;
}


export default function ReviewOthersSideBar({ pageId, setShowSidebar, fallbackTranslations }: ReviewOthersSideBarProps) {
    const [isMyChannelsExpanded, setMyChannelsExpanded] = useState(true)
    const [isFollowingExpanded, setFollowingExpanded] = useState(true)
    const [isFollowersExpanded, setFollowersExpanded] = useState(false)
    const { getTranslation, setTranslation } = useTranslationStore();
    const [translations, setTranslations] = useState<PageTranslations | null>(null);

    const { locale } = useParams() as { locale: string };
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

        const cached = getTranslation(pageId, locale);
        if (cached) {
            setTranslations(cached);
        } else if (fallbackTranslations) {
            setTranslation(pageId, locale, fallbackTranslations);
            setTranslations(fallbackTranslations);
        } else {
            // TODO: call LoadPageTranslation API if需要
        }
    }, [locale, fallbackTranslations]);

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
                setMyChannel(null) // 全選
                setSelectedChannel(null)
            } else {
                setMyChannel(id)
                setSelectedChannel(channel ?? null)
            }
        } else if (type === "following") {
            if (activeFilterGroup === "following" && selectedFollowingChannelId === id) {
                setFollowingChannel(null) // 全選
            } else {
                setFollowingChannel(id)
                setSelectedChannel(null)
            }
        } else {
            // Explore 點擊時等同 myChannels
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

    return (
        <div className="w-64 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col p-4 space-y-4">
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
                            setFollowingExpanded((v) => !v)        // 展開/收合
                            setFollowingChannel(null)              // ✅ 全選 following，取消個別選取
                        }}
                    >
                        <span className="text-sm font-medium">{translations?.your_following_section?.translation ?? "Your Following"}</span>
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
                            setMyChannel(null)                     // ✅ 全選 explore（同等於 myChannels）
                            setSelectedChannel(null)
                            // to do, 排除自己的Channel和Following的Channel
                        }}
                    >
                        <span className="text-sm font-medium">{translations?.explore_section?.translation ?? "Explore"}</span>
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

            <div className="text-xs text-muted-foreground mt-auto">
                © 2025 Mr. Click
            </div>
        </div>
    )
}
