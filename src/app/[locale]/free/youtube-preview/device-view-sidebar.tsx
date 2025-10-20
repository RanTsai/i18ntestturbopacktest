

"use client";

import React, { useEffect, useState } from "react";
import { PlusCircle, XCircle, Images, ChevronsLeft, ChevronsRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Home,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import VideoSettingStore from "@/lib/global-store/upload-store";
import { useParams } from "next/navigation";
import { ThumbnailSelectorPanel } from "./thumbnail-selector-panel";
import { CachedTranslation } from "@/lib/idb/translation-idb";
import { useTranslationViewModel } from "@/lib/view-models/use-translation-view-model";
import ThemeToggle from "@/components/navigation/theme-toggle";

interface Props {
  initialTranslation?: CachedTranslation
}

export default function DeviceViewSideBar({
  initialTranslation,
}: Props) {
  const { locale } = useParams() as { locale: string };
  const pageId = "device_preview_page";
  const { translation, hydrateTranslation } = useTranslationViewModel(pageId, locale);
  useEffect(() => {
    if (
      initialTranslation
    ) {
      hydrateTranslation(initialTranslation.content, initialTranslation.version);
    }
  }, [initialTranslation, hydrateTranslation]);

  //const [isMyChannelExpanded, setIsMyChannelExpanded] = useState(true);
  const [isThumbnailExpanded, setIsThumbnailExpanded] = useState(true);
  const [isTitleExpanded, setIsTitleExpanded] = useState(true);

  // 整個 Sidebar 的收納狀態
  const [collapsed, setCollapsed] = useState(false);

  const { titles, setTitles, setSelectedTitle, selectedTitle, setTitle } = VideoSettingStore();

  const handleTitleChange = (index: number, value: string) => {
    const updated = [...titles];
    updated[index] = value;
    setTitles(updated);
    setTitle(value);
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
    setTitle(updated[0]);
  };

  // 🔢 動畫寬度（展開 256px，收納 56px）
  const expandedWidth = 256;
  const collapsedWidth = 56;

  return (
    <TooltipProvider delayDuration={800}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? collapsedWidth : expandedWidth }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] relative overflow-hidden"
        aria-expanded={!collapsed}
      >

        <div className="p-2 flex items-center justify-between">
          {/* 展開後才顯示標題 */}
          {!collapsed && (
            <h2 className="text-xl font-semibold opacity-80">
              {translation?.page_header?.translation ?? "Live Preview"}
            </h2>
          )}

          {/* 收納/展開按鈕 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCollapsed((v) => !v)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-[var(--muted)] relative z-30"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand" : "Collapse"}
              >
                {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{collapsed ? "Expand" : "Collapse"}</TooltipContent>
          </Tooltip>
        </div>


        {/* 內容：收納時淡出並移除（省資源）；展開時淡入 */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="sidebar-content"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="p-4 pt-0"
            >
              <nav className="flex-1 flex flex-col space-y-4">
                {/* <MyChannelSelector
                    expanded={isMyChannelExpanded}
                    setExpanded={setIsMyChannelExpanded}
                    translations={translation}
                  />

                  <div className="border-t border-[var(--sidebar-border)]" /> */}
    <div className="mt-4">
                  <ThemeToggle />
                </div>
                <div className="border-t border-[var(--sidebar-border)]" />
                {/* Thumbnails Section */}
                <div className="w-full">
                  <div
                    className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                    onClick={() => setIsThumbnailExpanded(!isThumbnailExpanded)}
                  >
                    <div className="flex items-center space-x-2">
                      <Images className="h-4 w-4" />
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <span className="cursor-help text-sm">
                            {translation?.thumbnails_section?.translation ?? "Thumbnails"}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {translation?.thumbnails_section?.tooltip ?? "Select or manage your thumbnails"}
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
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden pl-6"
                      >
                        <ThumbnailSelectorPanel translations={translation} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="border-t border-[var(--sidebar-border)]" />

                {/* Titles Section */}
                <div className="w-full">
                  <div
                    className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                    onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                  >
                    <div className="flex items-center space-x-2">
                      <Home className="h-4 w-4" />
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <span className="cursor-help text-sm">
                            {translation?.titles_section?.translation ?? "Titles"}
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
                        transition={{ duration: 0.25, ease: "easeInOut" }}
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
                                onFocus={() => setSelectedTitle(title)}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  handleTitleChange(i, newValue);
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
                          <span>{translation?.add_title_button?.translation ?? "Titles"}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>


                {/* Video Type Section
                <div className="w-full mt-4">
                    <div
                        className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                        onClick={() => setIsVideoTypeExpanded(!isVideoTypeExpanded)}
                    >
                        <div className="flex items-center space-x-2">
                            <Film className="h-4 w-4" />
                            <span className="text-sm">{translation?.video_type_section?.translation ?? 'Video Type'}</span>
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
                <div className="border-t border-[var(--sidebar-border)]" />


                {/* Audience Section */}
                {/* <div
                  className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
                  onClick={() => setIsAudienceExpanded(!isAudienceExpanded)}
                >
                  <div className="flex items-center space-x-1 text-sm">
                    <span>{translation?.audience_section?.translation ?? "Target Audience"}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="ml-1 rounded-full bg-[var(--muted)] hover:bg-[var(--accent)] p-1 cursor-pointer">
                          <HelpCircle className="h-3 w-3 text-[var(--foreground)]" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs">
                        {translation?.audience_section?.tooltip ?? ""}
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
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden flex ml-2 mt-1 gap-4 flex-wrap"
                    >
                      {(userChannels ?? []).map((channel) => (
                        <Tooltip key={channel.user_channel_id} delayDuration={300}>
                          <TooltipTrigger asChild>
                            <div
                              onClick={() => setSelectedChannelId(channel.user_channel_id)}
                              className={`flex flex-col items-center justify-center cursor-pointer transition border-2 rounded-xl p-2 w-20 hover:border-purple-400 ${selectedChannelId === channel.user_channel_id
                                ? "border-purple-500"
                                : "border-[var(--border)]"
                                }`}
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
                </AnimatePresence> */}

                <div className="border-t border-[var(--sidebar-border)]" />
              </nav>

              <div className="text-xs text-muted-foreground mt-4">© 2025 Thumbnail Analyzer</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </TooltipProvider>
  );
}
