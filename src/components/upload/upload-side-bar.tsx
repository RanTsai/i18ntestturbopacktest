"use client";

import React, { useRef, useEffect, useState } from "react";
import { Trash2, Plus, PlusCircle, XCircle, Film, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserChannelStore from "@/lib/global-store/user-channel-store";
import toast from "react-hot-toast";
import clsx from "clsx";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";


import {
    Home,
    BarChart,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { GetUserChannelsFromSupabase } from "@/actions/supabase/supabase_user_channel";
import { ITags } from "@/lib/schema/user-channel-schema";
import { set } from "mongoose";
interface UploadSideBarProps {
    setShowSidebar?: (open: boolean) => void;
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
            <Tooltip>
                <TooltipTrigger asChild>{span}</TooltipTrigger>
                <TooltipContent side="top" align="start">
                    {title}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export default function UploadSideBar({
    setShowSidebar,
}: UploadSideBarProps) {
    const [hoveredChat, setHoveredChat] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedChatForDelete, setSelectedChatForDelete] = useState<any>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    //const [channels, setChannels] = React.useState<string | null>(null)
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    //const { selectedImages, setSelectedImages, totalImages, setTotalImages } = UseImageStore(); // allow user to select images from the panel
    //Change to, selected Images store, title store, has reviewed store
    const [tags, setTags] = useState<ITags[]>([]);
    const [tagInput, setTagInput] = useState('');
    const suggestedTags = ['AI', 'Finance', 'Gaming', 'Vlog', 'Tutorial', 'Education', 'Design']; // 可改成你的來源
    const [isMyChannelExpanded, setIsMyChannelExpanded] = useState(true);
    const [isAudienceExpanded, setIsAudienceExpanded] = useState(false);
    const [isTitleExpanded, setIsTitleExpanded] = useState(true);
    const { userChannels, setChannels, selectedChannel, setSelectedChannel } = UserChannelStore();

    const [isVideoTypeExpanded, setIsVideoTypeExpanded] = useState(true);
    const [videoType, setVideoType] = useState("Education");
    const [topic, setTopic] = useState("");
    const [niche, setNiche] = useState("");
    const [theme, setTheme] = useState("");

    const loadChannels = async () => {
        try {
            setLoading(true);
            let response = null;
            if (!userChannels || userChannels.length === 0) {
                response = await GetUserChannelsFromSupabase();
            }
            console.log("loading Channel resposne:", response?.data![0].tags);

            if (response && response.success) {
                setChannels(response.data ?? []);
  //              console.log("user Channels", userChannels)
                const latestChannels = UserChannelStore.getState().userChannels;
//              console.log("Latest Channels", latestChannels)

                setSelectedChannel(latestChannels![0] ?? null);
    //            console.log("Setting selected channel:", latestChannels![0].tags);
                setTags(latestChannels![0].tags!);
                setVideoType(latestChannels![0].art_sub_type ?? "Education");
            } else {
                // console.error(response);
                // toast.error("載入聊天失敗");
            }
        } catch (err: any) {
            toast.error("發生錯誤：" + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadAudience = async () => {
        try {
            //TODO: Load audience Audience
        } catch (err: any) {
            toast.error("發生錯誤：" + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChannel = async () => {
        try {


        } catch (err: any) {
            toast.error("發生錯誤：" + err.message);
        }
    };

    const handleUploadImage = async () => {
        try {

        } catch (err: any) {
            toast.error("發生錯誤：" + err.message);
        }
    };

    const [titles, setTitles] = useState<string[]>([""]);

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

    const handleDeleteImage = async (chatId: string) => {
        try {

        } catch (err: any) {
            toast.error("刪除錯誤：" + err.message);
        } finally {
            setSelectedChatForDelete(null);
        }
    };

    const addTag = ({ newTag, language }: { newTag: string; language: string }) => {
        if (!tags.includes(newTag as unknown as ITags)) {
            setTags([...tags, newTag as unknown as ITags]);
        }
        setTagInput('');
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    useEffect(() => {
        loadChannels();
    }, []);

    useEffect(() => {
        if (selectedChannel) {
            console.log("🎯 Selected Channel:", selectedChannel);

            // 更新 Tags
            setTags(selectedChannel.tags ?? []);

            // 更新 Video Type
            // console.log("Selected Channel", selectedChannel.channel_name);

            // console.log("Selected Channel Art Sub Type:", selectedChannel.art_sub_type);
            if (
                selectedChannel.art_sub_type &&
                videoCategories.includes(selectedChannel.art_sub_type)
            ) {
                //console.log("setting Selected Channel Art Sub Type:", selectedChannel.art_sub_type);

                setVideoType(selectedChannel.art_sub_type);
            } else {
                //console.log("fall back Selected Channel Art Sub Type:",videoCategories[0]);
                setVideoType(videoCategories[0]); // fallback
            }

            // 可加上其他需要同步的資料
            // setTargetAudience(selectedChannel.target_audence ?? []);
        }
    }, [selectedChannel]);

    return (
        <div className="w-64 bg-gray-900 text-white flex flex-col p-4 space-y-4">
            <nav className="flex-1 flex flex-col space-y-2">

                {/* My Channel Header */}
                <div
                    className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-800"
                    onClick={() => setIsMyChannelExpanded(!isMyChannelExpanded)}
                >
                    <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4" />
                        <span>My Channel</span>
                    </div>
                    {isMyChannelExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>

                {/* My Channel Expandable Grid with Animation */}
                <AnimatePresence initial={false}>
                    {isMyChannelExpanded && (
                        <motion.div
                            key="my-channel"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden grid grid-cols-4 gap-2 ml-2 mt-1"
                        >
                            {(userChannels ?? []).length > 0 && (userChannels ?? []).map((channel) => (
                                <Tooltip key={channel.user_channel_id}>
                                    <TooltipTrigger asChild>
                                        <div
                                            onClick={() => {
                                                setSelectedChannelId(channel.user_channel_id);
                                                setSelectedChannel(channel);                                               
                                            }}
                                            className={`
                        w-10 h-10 flex items-center justify-center
                        rounded-full border-2 cursor-pointer
                        hover:border-purple-400 transition
                        ${selectedChannelId === channel.user_channel_id ? "border-purple-500" : "border-transparent"}
                      `}
                                        >
                                            <Image
                                                src={channel.logo}
                                                alt={channel.channel_name}
                                                width={50}
                                                height={50}
                                                className="rounded-full"
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="text-xs">
                                        {channel.channel_name} ({channel.platform})
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Divider */}
                <div className="border-t border-gray-700 my-2" />
                {/* Titles Section */}
                <div className="w-full mt-4">
                    {/* Title Header */}
                    <div
                        className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-800"
                        onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                    >
                        <div className="flex items-center space-x-2">
                            <Home className="h-4 w-4" />
                            <span className="text-sm">Titles</span>
                        </div>
                        {isTitleExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </div>

                    {/* Expandable Titles Area */}
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
                                            className="flex gap-2 items-center mb-1 overflow-hidden"
                                        >
                                            <input
                                                type="text"
                                                className="w-full px-2 py-1 rounded bg-gray-800 text-xs text-white border border-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                placeholder={`Title ${i + 1}`}
                                                value={title}
                                                onChange={(e) => handleTitleChange(i, e.target.value)}
                                            />
                                            <button
                                                onClick={() => removeTitle(i)}
                                                disabled={titles.length <= 1}
                                                className="py-2 text-sm text-gray-600 hover:text-gray-400 disabled:opacity-50"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Add Title Button */}
                                <button
                                    onClick={addTitle}
                                    disabled={titles.length >= 5}
                                    className="text-xs text-gray-500 hover:text-gray-300 mt-2 flex items-center space-x-1"
                                >
                                    <PlusCircle className="w-5 h-5" />
                                    <span>Add Title</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 my-2" />


                <div className="w-full mt-4">
                    {/* Header */}
                    <div
                        className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-800"
                        onClick={() => setIsVideoTypeExpanded(!isVideoTypeExpanded)}
                    >
                        <div className="flex items-center space-x-2">
                            <Film className="h-4 w-4" />
                            <span className="text-sm">Video Type</span>
                        </div>
                        {isVideoTypeExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </div>

                    {/* Expandable Content */}
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
                                {/* Video Type Select */}
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-400 mb-1">Video Type</label>
                                    <select
                                        value={videoType}
                                        onChange={(e) => setVideoType(e.target.value)}
                                        className="px-2 py-1 rounded bg-gray-800 text-xs text-white border border-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    >
                                        {videoCategories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Topic Input */}
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-400 mb-1">Topic</label>
                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="px-2 py-1 rounded bg-gray-800 text-xs text-white border border-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        placeholder="Enter topic..."
                                    />
                                </div>

                                {/* Niche Input */}
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-400 mb-1">Niche</label>
                                    <input
                                        type="text"
                                        value={niche}
                                        onChange={(e) => setNiche(e.target.value)}
                                        className="px-2 py-1 rounded bg-gray-800 text-xs text-white border border-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        placeholder="Enter niche..."
                                    />
                                </div>

                                {/* Theme Input */}
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-400 mb-1">Theme</label>
                                    <input
                                        type="text"
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        className="px-2 py-1 rounded bg-gray-800 text-xs text-white border border-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        placeholder="Enter theme..."
                                    />
                                </div>
                                {/* Tags Input */}
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-400 mb-1">Tags</label>
                                    <div className="flex flex-wrap gap-1 p-1 bg-gray-800 rounded border border-gray-700">
                                        {tags.map((tag, idx) => (
                                            <div key={idx} className="flex items-center text-[10px] bg-gray-700 text-white px-2 py-0.5 rounded-full">
                                                {tag.label}
                                                <button
                                                    className="ml-1 text-xs hover:text-red-300"
                                                    onClick={() => removeTag(idx)}
                                                >
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
                                                    addTag({ newTag: tagInput.trim(), language: "en" });
                                                }
                                            }}
                                            className="bg-transparent text-[10px] text-white focus:outline-none flex-1 min-w-[80px]"
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
                {/* Divider */}
                <div className="border-t border-gray-700 my-2" />
                {/* Audience Header */}
                <div
                    className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-800"
                    onClick={() => setIsAudienceExpanded(!isAudienceExpanded)}
                >
                    <div className="flex items-center space-x-2">
                        <BarChart className="h-4 w-4" />
                        <span>Audience</span>
                    </div>
                    {isAudienceExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>

                {/* Audience Expandable Section with Animation */}
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
                                <Tooltip key={channel.user_channel_id}>
                                    <TooltipTrigger asChild>
                                        <div
                                            onClick={() => setSelectedChannelId(channel.user_channel_id)}
                                            className={`
                flex flex-col items-center justify-center
                cursor-pointer transition
                border-2 rounded-xl p-2 w-20
                hover:border-purple-400
                ${selectedChannelId === channel.user_channel_id ? "border-purple-500" : "border-transparent"}
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

                {/* Divider */}
                <div className="border-t border-gray-700 my-2" />
            </nav>

            <div className="text-xs text-gray-400">© 2025 My Dashboard</div>
        </div>
    );
}