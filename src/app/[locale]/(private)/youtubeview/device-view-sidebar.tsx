"use client";

import React, { useRef, useEffect, useState } from "react";
import { PlusCircle, XCircle, Film, HelpCircle, Images } from "lucide-react";
import UserChannelStore from "@/lib/global-store/user-channel-store";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import useTranslationStore from "@/lib/global-store/use-translation-store";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import {
    Home,
    BarChart,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { UseLoadChannels } from "@/hooks/loading-user-data/load-channels";
import VideoSettingStore from "@/lib/global-store/upload-store";
import { PageTranslations } from "@/i18n/interface";
import { useParams } from 'next/navigation';
import { ThumbnailSelectorPanel } from "@/components/image-select/thumbnail-selector-panel";
import MyChannelSelector from "@/components/upload/channel-selector";


interface UploadSideBarProps {
    setShowSidebar?: (open: boolean) => void;
    fallbackTranslations?: PageTranslations;
}

export default function DeviceViewSideBar({
    setShowSidebar, fallbackTranslations
}: UploadSideBarProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
    const [isMyChannelExpanded, setIsMyChannelExpanded] = useState(true);
    const [isAudienceExpanded, setIsAudienceExpanded] = useState(false);
    const [isThumbnailExpanded, setIsThumbnailExpanded] = useState(true);

    const [isTitleExpanded, setIsTitleExpanded] = useState(true);
    const { userChannels, setChannels, selectedChannel, setSelectedChannel } = UserChannelStore();
    const { getTranslation, setTranslation } = useTranslationStore();
    const [translations, setTranslations] = useState<PageTranslations | null>(null);

    const { locale } = useParams() as { locale: string };
    const pageId = "device_preview_page"; // 或用 props 傳入
    const [isVideoTypeExpanded, setIsVideoTypeExpanded] = useState(true);
    const { titles, setTitles, setSelectedTitle, selectedTitle } = VideoSettingStore();

    //console.log("translation passed in", fallbackTranslations);

    const loadAudience = async () => {
        try {
            //TODO: Load audience Audience
        } catch (err: any) {
            toast.error("發生錯誤：" + err.message);
        } finally {
            setLoading(false);
        }
    };

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

    const handleTitleChange = (index: number, value: string) => {
        const updated = [...titles];
        updated[index] = value;
        setTitles(updated);
    };

    const addTitle = () => {
        if (titles.length < 5) {
            setTitles([...titles, ""]);
        }
    };

    const removeTitle = (index: number) => {
        const updated = [...titles];
        updated.splice(index, 1);
        setTitles(updated);
    };

    const handleSelectAudience = async () => {
        try {
            //TODO
        } catch (err: any) {
            toast.error("發生錯誤：" + err.message);
        }
    };

    UseLoadChannels();

    return (
        <div className="w-64 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col p-4 space-y-4">
            <nav className="flex-1 flex flex-col space-y-2">
                <MyChannelSelector
                    expanded={isMyChannelExpanded}
                    setExpanded={setIsMyChannelExpanded}
                    userChannels={userChannels ?? []}
                    selectedId={selectedChannelId !== null ? `my-${selectedChannelId}` : null}
                    setSelectedId={(id) => {
                        // 從 visualId 拆出實際 channel_id，並同步更新
                        const numId = id?.startsWith("my-") ? parseInt(id.replace("my-", ""), 10) : null;
                        setSelectedChannelId(numId);
                    }}
                    setMyChannel={setSelectedChannelId} // 直接重用
                    setSelectedChannel={setSelectedChannel}
                    pageId="device_preview_page"
                />

                <div className="border-t border-[var(--sidebar-border)] my-2" />

                {/* Thumbnails Section */}
                <div className="w-full mt-4">
                    <div
                        className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                        onClick={() => setIsThumbnailExpanded(!isThumbnailExpanded)}
                    >
                        <div className="flex items-center space-x-2">
                            <Images className="h-4 w-4" />
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <span className="cursor-help text-sm">{translations?.thumbnails_section?.translation ?? "Thumbnails"}</span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                    {translations?.thumbnails_section?.tooltip ?? "Select or manage your thumbnails"}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        {isThumbnailExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>

                    <AnimatePresence initial={false}>
                        {isThumbnailExpanded && (
                            <motion.div
                                key="thumbnail-section"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden pl-6"
                            >
                                <ThumbnailSelectorPanel />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="border-t border-[var(--sidebar-border)] my-2" />

                {/* Titles Section */}
                <div className="w-full mt-4">
                    <div
                        className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                        onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                    >
                        <div className="flex items-center space-x-2">
                            <Home className="h-4 w-4" />
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <span className="cursor-help text-sm">{translations?.titles_section?.translation ?? "My Channels"}</span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                    {translations?.titles_section?.tooltip ?? ""}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        {isTitleExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>

                    <AnimatePresence initial={false}>
                        {isTitleExpanded && (
                            <motion.div
                                key="title-section"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden pl-6"
                            >
                                <AnimatePresence initial={false}>
                                    {titles.map((title, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex gap-2 items-center mb-1"
                                        >
                                            <input
                                                type="text"
                                                className="w-full px-2 py-1 rounded bg-[var(--input)] text-xs text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                placeholder={`Title ${i + 1}`}
                                                value={title}
                                                onFocus={() => setSelectedTitle(title)} // ✔️ 點擊時設定選中 title
                                                onChange={(e) => {
                                                    const newValue = e.target.value;
                                                    handleTitleChange(i, newValue);

                                                    // ✔️ 如果這一欄是目前選中的，就同步更新 selectedTitle
                                                    if (titles[i] === selectedTitle) {
                                                        setSelectedTitle(newValue);
                                                    }
                                                }}
                                            />

                                            <button
                                                onClick={() => removeTitle(i)}
                                                disabled={titles.length <= 1}
                                                className="py-2 text-sm text-muted-foreground hover:text-destructive disabled:opacity-50"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <button
                                    onClick={addTitle}
                                    disabled={titles.length >= 5}
                                    className="text-xs text-muted-foreground hover:text-foreground mt-2 flex items-center space-x-1"
                                >
                                    <PlusCircle className="w-5 h-5" />
                                    <span>{translations?.add_title_button?.translation ?? 'Titles'}</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="border-t border-[var(--sidebar-border)] my-2" />

                {/* Video Type Section
                <div className="w-full mt-4">
                    <div
                        className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                        onClick={() => setIsVideoTypeExpanded(!isVideoTypeExpanded)}
                    >
                        <div className="flex items-center space-x-2">
                            <Film className="h-4 w-4" />
                            <span className="text-sm">{translations?.video_type_section?.translation ?? 'Video Type'}</span>
                        </div>
                        {isVideoTypeExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>

                    <AnimatePresence initial={false}>
                        {isVideoTypeExpanded && (
                            <motion.div
                                key="video-type"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden pl-6 space-y-2"
                            >
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="border-t border-[var(--sidebar-border)] my-2" /> */}

                {/* Audience Section */}
                <div
                    className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                    onClick={() => setIsAudienceExpanded(!isAudienceExpanded)}
                >
                    <div className="flex items-center space-x-1 text-sm">
                        <span>{translations?.audience_section?.translation ?? "Target Audience"}</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="ml-1 rounded-full bg-[var(--muted)] hover:bg-[var(--accent)] p-1 cursor-pointer">
                                    <HelpCircle className="h-3 w-3 text-[var(--foreground)]" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-xs">
                                {translations?.audience_section?.tooltip ?? ""}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    {isAudienceExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>

                <AnimatePresence initial={false}>
                    {isAudienceExpanded && (
                        <motion.div
                            key="audience"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden flex ml-2 mt-1 gap-4 flex-wrap"
                        >
                            {(userChannels ?? []).map((channel) => (
                                <Tooltip key={channel.user_channel_id} delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <div
                                            onClick={() => setSelectedChannelId(channel.user_channel_id)}
                                            className={`
                      flex flex-col items-center justify-center
                      cursor-pointer transition
                      border-2 rounded-xl p-2 w-20
                      hover:border-purple-400
                      ${selectedChannelId === channel.user_channel_id
                                                    ? "border-purple-500"
                                                    : "border-[var(--border)]"
                                                }
                    `}
                                        >
                                            <Image
                                                src={channel.logo}
                                                alt={channel.channel_name}
                                                width={40}
                                                height={40}
                                                className="rounded-full mb-1"
                                            />
                                            <span className="text-xs text-center truncate">{channel.channel_name}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                        {channel.channel_name} ({channel.platform})
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="border-t border-[var(--sidebar-border)] my-2" />
            </nav>

            <div className="text-xs text-muted-foreground">© 2025 Mr. Click</div>
        </div>
    );
}