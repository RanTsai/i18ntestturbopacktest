"use client";

import React, { useRef, useEffect, useState } from "react";
import { PlusCircle, XCircle, Film, HelpCircle } from "lucide-react";
import UserChannelStore from "@/lib/global-store/user-channel-store";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ChannelSelector from "./channel-selector";
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
import { GetUserChannelsFromSupabase } from "@/actions/supabase/supabase_user_channel";
import { ITags } from "@/lib/schema/user-channel-schema";
import { UseLoadChannels } from "@/hooks/loading-user-data/load-channels";
import VideoSettingStore from "@/lib/global-store/upload-store";
import { PageTranslations } from "@/i18n/interface";
import { useParams } from 'next/navigation';


interface UploadSideBarProps {
    setShowSidebar?: (open: boolean) => void;
    fallbackTranslations?: PageTranslations;
}

const videoCategories = [
    "Cars and vehicles",
    "Comedy",
    "Education",
    "Entertainment",
    "Film and animation",
    "Gaming",
    "How-to and style",
    "Music",
    "News and politics",
    "Non-profits and activism",
    "People and blogs",
    "Pets and animals",
    "Science and technology",
    "Sport",
    "Travel and events"
];

function UploadBarTitleWithTooltip({ title }: { title: string }) {
    const spanRef = useRef<HTMLSpanElement>(null);
    const [isOverflowed, setIsOverflowed] = useState(false);

    useEffect(() => {
        const el = spanRef.current;
        if (el && el.scrollWidth > el.clientWidth) {
            setIsOverflowed(true);
        }
    }, [title]);

    const span = (
        <span
            ref={spanRef}
            className="text-sm text-gray-300 truncate max-w-[180px]"
        >
            {title}
        </span>
    );

    if (!isOverflowed) return span;

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>{span}</TooltipTrigger>
                <TooltipContent side="top" align="start">
                    {title}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export default function UploadSideBar({
    setShowSidebar, fallbackTranslations
}: UploadSideBarProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
    const [tagInput, setTagInput] = useState('');
    const suggestedTags = ['AI', 'Finance', 'Gaming', 'Vlog', 'Tutorial', 'Education', 'Design']; // 可改成你的來源
    const [isMyChannelExpanded, setIsMyChannelExpanded] = useState(true);
    const [isAudienceExpanded, setIsAudienceExpanded] = useState(false);
    const [isTitleExpanded, setIsTitleExpanded] = useState(true);
    const { userChannels, setChannels, selectedChannel, setSelectedChannel } = UserChannelStore();
    const { getTranslation, setTranslation } = useTranslationStore();
    const [translations, setTranslations] = useState<PageTranslations | null>(null);

    const { locale } = useParams() as { locale: string };
    const pageId = "signed_up_upload_review"; // 或用 props 傳入
    const [isVideoTypeExpanded, setIsVideoTypeExpanded] = useState(true);
    const { video_type, setVideoType, theme, setTheme, topic, setTopic, titles, setTitles, tags, setTags, niche, setNiche } = VideoSettingStore();

    console.log("translation passed in", fallbackTranslations);

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


    const handleSelectReviewCritiera = async () => {
        try {
            //TODO      
        } catch (err: any) {
            toast.error("發生錯誤：" + err.message);
        }
    };

    const handleSelectAudience = async () => {
        try {
            //TODO
        } catch (err: any) {
            toast.error("發生錯誤：" + err.message);
        }
    };

    const addTag = ({ newTag, language }: { newTag: string; language: string }) => {
        const tagObj = { label: newTag, language }; // 確保包含 language 屬性
        if (!tags.some((tag) => tag.label === newTag)) {
            setTags([...tags, tagObj]);
        }
        setTagInput('');
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    UseLoadChannels();

    useEffect(() => {
        if (selectedChannel) {
            console.log("🎯 Selected Channel:", selectedChannel);
            setTags(selectedChannel.tags ?? []);
            if (
                selectedChannel.art_sub_type &&
                videoCategories.includes(selectedChannel.art_sub_type)
            ) {
                setVideoType(selectedChannel.art_sub_type);
            } else {
                setVideoType(videoCategories[0]); // fallback
            }
            // setTargetAudience(selectedChannel.target_audence ?? []);
        }
    }, [selectedChannel]);

    return (
        <div className="w-64 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col p-4 space-y-4">
            <nav className="flex-1 flex flex-col space-y-2">
                <ChannelSelector
                    expanded={isMyChannelExpanded}
                    setExpanded={setIsMyChannelExpanded}
                    userChannels={userChannels ?? []}
                    selectedId={selectedChannelId !== null ? `my-${selectedChannelId}` : null}
                    setSelectedId={(id) => {
                        const numId = id?.startsWith("my-") ? parseInt(id.replace("my-", ""), 10) : null;
                        setSelectedChannelId(numId);
                    }}
                    setMyChannel={setSelectedChannelId} // 跟上面同步
                    setSelectedChannel={setSelectedChannel}
                    pageId="signed_up_upload_review"
                />

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
                                                onChange={(e) => handleTitleChange(i, e.target.value)}
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

                {/* Video Type Section */}
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
                                {/** Video Category */}
                                <div className="flex flex-col">
                                    <label className="text-xs text-muted-foreground mb-1">{translations?.video_category?.translation ?? 'Video Category'}</label>
                                    <select
                                        value={video_type}
                                        onChange={(e) => setVideoType(e.target.value)}
                                        className="px-2 py-1 rounded bg-[var(--input)] text-xs text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    >
                                        {videoCategories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/** Topic / Niche / Theme Input Block */}
                                <div className="flex flex-col space-y-2">
                                    {/* Topic Input */}
                                    <div className="flex flex-col">
                                        <label className="text-xs text-muted-foreground mb-1">
                                            {translations?.topic?.translation ?? 'Topic'}
                                        </label>
                                        <input
                                            type="text"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="px-2 py-1 rounded bg-[var(--input)] text-xs text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            placeholder="Enter topic..."
                                        />
                                    </div>

                                    {/* Niche Input */}
                                    <div className="flex flex-col">
                                        <label className="text-xs text-muted-foreground mb-1">
                                            {translations?.niche?.translation ?? 'Niche'}
                                        </label>
                                        <input
                                            type="text"
                                            value={niche}
                                            onChange={(e) => setNiche(e.target.value)}
                                            className="px-2 py-1 rounded bg-[var(--input)] text-xs text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            placeholder="Enter niche..."
                                        />
                                    </div>

                                    {/* Theme Input */}
                                    <div className="flex flex-col">
                                        <label className="text-xs text-muted-foreground mb-1">
                                            {translations?.theme?.translation ?? 'Theme'}
                                        </label>
                                        <input
                                            type="text"
                                            value={theme}
                                            onChange={(e) => setTheme(e.target.value)}
                                            className="px-2 py-1 rounded bg-[var(--input)] text-xs text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            placeholder="Enter theme..."
                                        />
                                    </div>
                                </div>
                                {/** Tags */}
                                <div className="flex flex-col">
                                    <label className="text-xs text-muted-foreground mb-1">{translations?.tags?.translation ?? 'Tags'}</label>
                                    <div className="flex flex-wrap gap-1 p-1 bg-[var(--input)] rounded border border-[var(--border)]">
                                        {tags.map((tag, idx) => (
                                            <div key={idx} className="flex items-center text-[10px] bg-[var(--muted)] text-[var(--foreground)] px-2 py-0.5 rounded-full">
                                                {tag.label}
                                                <button className="ml-1 text-xs hover:text-destructive" onClick={() => removeTag(idx)}>
                                                    <XCircle className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && tagInput.trim() !== '') {
                                                    e.preventDefault();
                                                    addTag({ newTag: tagInput.trim(), language: selectedChannel?.language || "en" });
                                                }
                                            }}
                                            onBlur={() => {
                                                if (tagInput.trim() !== '') {
                                                    addTag({ newTag: tagInput.trim(), language: selectedChannel?.language || "en" });
                                                }
                                            }}
                                            className="bg-transparent text-[10px] text-[var(--foreground)] focus:outline-none flex-1 min-w-[80px]"
                                            placeholder="Type and press Enter..."
                                            list="tag-suggestions"
                                        />
                                        <datalist id="tag-suggestions">
                                            {suggestedTags
                                                .filter((s) => s.toLowerCase().includes(tagInput.toLowerCase()) && !tags.some(tag => tag.label === s))
                                                .map((tag, idx) => (
                                                    <option key={idx} value={tag} />
                                                ))}
                                        </datalist>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="border-t border-[var(--sidebar-border)] my-2" />

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