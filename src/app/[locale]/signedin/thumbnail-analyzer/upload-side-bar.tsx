"use client";

import React, { useEffect, useState, useMemo } from "react";
import { PlusCircle, XCircle, Film, Heading, ChevronsLeft, ChevronsRight, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useVideoSettingViewModel } from "@/lib/view-models/use-video-setting-view-model";
import { useParams } from "next/navigation";
import { useTranslationViewModel } from "@/lib/view-models/use-translation-view-model";
import { CachedTranslation } from "@/lib/idb/translation-idb";
import MyChannelSelector from "@/components/upload/channel-selector";

interface Props {
  initialTranslation?: CachedTranslation;
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
  "Travel and events",
];

export default function UploadSideBar({
  initialTranslation,
}: Props) {
  const { locale } = useParams() as { locale: string };
  const pageId = "signed_up_upload_review";
  const { translation, hydrateTranslation } = useTranslationViewModel(pageId, locale);
  useEffect(() => {
    if (
      initialTranslation
    ) {
      hydrateTranslation(initialTranslation.content, initialTranslation.version);
    }
  }, [initialTranslation, hydrateTranslation]);

  const [isTitleExpanded, setIsTitleExpanded] = useState(true);
  const [isMyChannelExpanded, setIsMyChannelExpanded] = useState(true);

  const [isVideoTypeExpanded, setIsVideoTypeExpanded] = useState(true);
  const { video_type, setVideoType, theme, setTheme, topic, setTopic, setTitle, titles, setTitles, niche, setNiche, selectedTitle, setSelectedTitle } =
    useVideoSettingViewModel();

  const activeIndex = useMemo(() => {
    const idx = titles.findIndex((t) => t === selectedTitle);
    return idx >= 0 ? idx : 0;
  }, [titles, selectedTitle]);

  const EXPANDED_W = 256; // 展開寬度（原 w-64）
  const COLLAPSED_W = 56; // 收納窄欄

  const [collapsed, setCollapsed] = useState(false);

  const handleTitleChange = (index: number, value: string) => {
    const updated = [...titles];
    updated[index] = value;
    setTitles(updated);

    // 如果改的就是當前使用中那筆，就同步到 store.title 與 selectedTitle
    if (index === activeIndex) {
      setTitle(value);
      setSelectedTitle(value);
    }
  };

  const selectTitle = (index: number) => {
    const v = titles[index] ?? "";
    setSelectedTitle(v);
    setTitle(v);
  };
  const addTitle = () => {
    if (titles.length < 5) setTitles([...titles, ""]);
  };

  const removeTitle = (index: number) => {
    const updated = [...titles];
    updated.splice(index, 1);
    setTitles(updated);
  };

  return (
    <TooltipProvider delayDuration={500}>
      <motion.div
        initial={false}
        animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col border-r border-[var(--sidebar-border)] overflow-hidden relative z-[40]"
      >
        {/* 收納時：透明層可點擊展開 */}
        {collapsed && (
          <button
            className="absolute inset-0 z-20 bg-transparent"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            title="Expand"
          />
        )}

        {/* 頂部區塊 */}
        <div className="p-2 flex items-center justify-between">
          {/* 展開後才顯示標題 */}
          {!collapsed && (
            <h2 className="text-xl font-semibold opacity-80">
              {translation?.page_header?.translation ?? "Thumbnail Analyser"}
            </h2>
          )}

          {/* 收納/展開按鈕 */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-[var(--muted)] relative z-30"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </button>
        </div>


        {/* 內容：只有在展開時才渲染，避免殘影 */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="sidebar-content"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1 p-4 pt-0 space-y-2"
            >
              <nav className="flex-1 flex flex-col space-y-2">
                <MyChannelSelector
                  expanded={isMyChannelExpanded}
                  setExpanded={setIsMyChannelExpanded}
                  translations={translation}
                />

                <div className="border-t border-[var(--sidebar-border)] my-2" />

                {/* Titles Section */}
                <div className="w-full mt-4">
                  <div
                    className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                    onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                  >
                    <div className="flex items-center space-x-2">
                      <Heading className="h-4 w-4" />
                      <Tooltip delayDuration={500}>
                        <TooltipTrigger asChild>
                          <span className="cursor-help text-sm">
                            {translation?.titles_section?.translation ?? "My Channels"}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {translation?.titles_section?.tooltip ?? ""}
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
                              <Tooltip delayDuration={500}>
                                <TooltipTrigger asChild>
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1 rounded bg-[var(--input)] text-xs text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    placeholder={translation?.title_placeholder?.translation ??
                                      "New title"}
                                    value={title}
                                    onChange={(e) => handleTitleChange(i, e.target.value)}
                                    onFocus={() => selectTitle(i)} // 也可改成按鈕
                                  />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs max-w-xs">
                                  {translation?.title_placeholder?.tooltip ??
                                    "Enter a video title here for comparison"}
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip delayDuration={500}>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => removeTitle(i)}
                                    disabled={titles.length <= 1}
                                    className="py-2 text-sm text-muted-foreground hover:text-destructive disabled:opacity-50"
                                  >
                                    <XCircle className="w-5 h-5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs max-w-xs">
                                  {translation?.title_remove_button?.tooltip ??
                                    "Delete this title, it cannot be undone"}
                                </TooltipContent>
                              </Tooltip>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <Tooltip delayDuration={500}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={addTitle}
                              disabled={titles.length >= 5}
                              className="text-xs text-muted-foreground hover:text-foreground mt-2 flex items-center space-x-1"
                            >
                              <PlusCircle className="w-5 h-5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs max-w-xs">
                            {translation?.add_title_button?.tooltip ??
                              "Click to add a new title"}
                          </TooltipContent>
                        </Tooltip>
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
                      <span className="text-sm">{translation?.video_type_section?.translation ?? "Video Type"}</span>
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
                        {/* Video Category */}
                        <div className="flex flex-col">
                          <label className="text-xs text-muted-foreground mb-1">
                            {translation?.video_category?.translation ?? "Video Category"}
                          </label>
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

                        {/* Topic */}
                        <div className="flex flex-col">
                          <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Tooltip delayDuration={500}>
                              <TooltipTrigger asChild>
                                <span>
                                  {translation?.topic_label?.translation ?? "Topic (Optional)"}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs max-w-xs">
                                {translation?.topic_label?.tooltip ??
                                  "The main subject your thumbnail is about. Helps AI judge if the thumbnail matches the topic."}
                              </TooltipContent>
                            </Tooltip>
                          </label>

                          <Tooltip delayDuration={500}>
                            <TooltipTrigger asChild>
                              <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="px-2 py-1 rounded bg-[var(--input)] text-xs text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-purple-500"
                                placeholder={translation?.topic_placeholder?.translation ?? "My topic is..."}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-xs">
                              {translation?.topic_placeholder?.tooltip ??
                                "Main subject or idea shown in the thumbnail. For example: 'Space Travel', 'Healthy Eating', 'Stock Market Crash'. Helps AI judge if the thumbnail matches the topic."}
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        {/* Niche */}
                        <div className="flex flex-col">
                          <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Tooltip delayDuration={500}>
                              <TooltipTrigger asChild>
                                <span>
                                  {translation?.niche_label?.translation ?? "Niche (Optional)"}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs max-w-xs">
                                {translation?.niche_label?.tooltip ??
                                  "Who you are making this for. Helps AI review from your audience’s perspective."}
                              </TooltipContent>
                            </Tooltip>
                          </label>

                          <Tooltip delayDuration={500}>
                            <TooltipTrigger asChild>
                              <input
                                type="text"
                                value={niche}
                                onChange={(e) => setNiche(e.target.value)}
                                className="px-2 py-1 rounded bg-[var(--input)] text-xs text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-purple-500"
                                placeholder={translation?.niche_placeholder?.translation ?? "My audience is..."}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-xs">
                              {translation?.niche_placeholder?.tooltip ??
                                "Describe the group of people you want to reach. For example: 'Gamers', 'Startup Founders', 'History Buffs'."}
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        {/* Theme */}
                        <div className="flex flex-col">
                          <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Tooltip delayDuration={500}>
                              <TooltipTrigger asChild>
                                <span>
                                  {translation?.theme_label?.translation ?? "Theme (Optional)"}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs max-w-xs">
                                {translation?.theme_label?.tooltip ??
                                  "The style or mood of your content. Helps AI understand the tone your thumbnail should match."}
                              </TooltipContent>
                            </Tooltip>
                          </label>

                          <Tooltip delayDuration={500}>
                            <TooltipTrigger asChild>
                              <input
                                type="text"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                className="px-2 py-1 rounded bg-[var(--input)] text-xs text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-purple-500"
                                placeholder={translation?.theme_placeholder?.translation ?? "My theme is..."}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-xs">
                              {translation?.theme_placeholder?.tooltip ??
                                "Describe the overall style or mood (e.g., playful, dramatic, professional)."}
                            </TooltipContent>
                          </Tooltip>
                        </div>



                        {/* Tags */}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="border-t border-[var(--sidebar-border)] my-2" />

                <div className="border-t border-[var(--sidebar-border)] my-2" />
              </nav>

              <div className="text-xs text-muted-foreground">© 2025 Thumbnail Analyzer</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
}
