"use client";
import React, { useState } from "react";
import {
    Home,
    Settings,
    Image,
    BarChart,
    ChevronDown,
    ChevronsLeft,
    Menu,
    Youtube,
    Baby,
    UserCheck,
    Images,
    LightbulbIcon,
    FileChartColumn,
    LaptopMinimal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DashboardSidebar() {
    const [isMyStuffExpanded, setIsMystuffExpanded] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapse = () => {
        setCollapsed((c) => {
            if (!c) setIsMystuffExpanded(false); // 收納時一併關閉 section
            return !c;
        });
    };

    // 共用 class：收納時 icon 置中；展開時 icon + 文字靠左
    const btnBase = `w-full items-center transition-all`;
    const btnLayout = collapsed ? `justify-center` : `justify-start`;
    const btnGap = collapsed ? `` : `gap-2`; // 收納時取消 gap，避免 icon 被推偏
    const labelClass = collapsed
        ? `hidden` // 收納時完全隱藏，避免殘留 margin 影響對齊
        : `inline`;

    return (
        <TooltipProvider>
            <aside
                className={`sticky top-0 h-screen border-r
        bg-[var(--sidebar, theme(colors.gray.900))]
        text-[var(--sidebar-foreground, theme(colors.gray.100))]
        flex flex-col overflow-hidden transition-[width] duration-300 ease-in-out
        ${collapsed ? "w-14" : "w-64"}`}
                aria-label="Sidebar"
            >
                {/* Header（含收納/展開按鈕） */}
                <div className="relative px-4 pt-4 pb-2 flex items-center justify-between">
                    {/* 左側圖示 + 文字 */}
                    <div
                        className={`flex items-center gap-2 transition-opacity ${collapsed ? "opacity-0 pointer-events-none w-0 overflow-hidden" : "opacity-100"
                            }`}
                    >
                        <h2 className="text-xl font-semibold opacity-80">Dashboard</h2>
                    </div>

                    {/* 收納/展開按鈕 */}
                    <button
                        type="button"
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        className={`inline-flex items-center rounded hover:bg-[var(--muted, theme(colors.gray.800))] 
      ${collapsed ? "w-10 h-8 justify-center" : "px-2 py-1"}`}
                        onClick={toggleCollapse}
                    >
                        {collapsed ? <Menu className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                    </button>


                    {/* 透明熱區：收納時覆蓋整個 header，隨便點都可展開 */}
                    {collapsed && (
                        <button
                            type="button"
                            aria-hidden
                            className="absolute inset-0 z-10"
                            onClick={toggleCollapse}
                            tabIndex={-1}
                        />
                    )}
                </div>

                {/* 導覽 */}
                <nav className="flex-1 flex flex-col space-y-2 px-2">
                    <Tooltip delayDuration={800}>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" className={`${btnBase} ${btnLayout} ${btnGap}`}>
                                <Home className="h-5 w-5 shrink-0" />
                                <span className={labelClass}>Ratings</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>View your ratings dashboard</TooltipContent>
                    </Tooltip>

                    <Link href="/youtubeview" className="w-full">
                        <Tooltip delayDuration={800}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className={`${btnBase} ${btnLayout} ${btnGap}`}>
                                    <Youtube className="h-5 w-5 shrink-0" />
                                    <span className={labelClass}>Live Preview</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Preview your YouTube content</TooltipContent>
                        </Tooltip>
                    </Link>

                    <Link href="/deviceview" className="w-full">
                        <Tooltip delayDuration={800}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className={`${btnBase} ${btnLayout} ${btnGap}`}>
                                    <UserCheck className="h-5 w-5 shrink-0" />
                                    <span className={labelClass}>Following</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>See who you follow</TooltipContent>
                        </Tooltip>
                    </Link>

                    <Link href="/deviceview" className="w-full">
                        <Tooltip delayDuration={800}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className={`${btnBase} ${btnLayout} ${btnGap}`}>
                                    <Baby className="h-5 w-5 shrink-0" />
                                    <span className={labelClass}>Followers</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>See who follows you</TooltipContent>
                        </Tooltip>
                    </Link>

                    {/* Divider */}
                    <div className="border-t border-gray-700/50 my-2" />

                    {/* Your Stuff 觸發 */}
                    <button
                        type="button"
                        className={`flex items-center w-full px-2 py-2 rounded hover:bg-[var(--muted, theme(colors.gray.800))] select-none ${btnLayout} ${btnGap}`}
                        onClick={() => !collapsed && setIsMystuffExpanded((v) => !v)}
                        aria-expanded={isMyStuffExpanded && !collapsed}
                        aria-controls="mystuff-panel"
                        disabled={collapsed}
                    >
                        <Home className="h-5 w-5 shrink-0" />
                        <span className={`text-sm ${labelClass}`}>Your Stuff</span>
                        {/* 展開箭頭只在未收納時顯示 */}
                        {!collapsed && (
                            <ChevronDown
                                className={`ml-auto h-4 w-4 transition-transform duration-200 ${isMyStuffExpanded ? "rotate-0" : "-rotate-90"}`}
                            />
                        )}
                    </button>

                    {/* Expandable Items（高度＋透明動畫） */}
                    <div
                        id="mystuff-panel"
                        className={`mx-2 grid transition-[grid-template-rows] duration-300 ease-in-out ${isMyStuffExpanded && !collapsed ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                            }`}
                    >
                        <div
                            className={`overflow-hidden ml-2 flex flex-col space-y-1 transition-opacity duration-200 ${isMyStuffExpanded && !collapsed ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            <Tooltip delayDuration={800}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className={`${btnBase} ${btnLayout} ${btnGap}`}>
                                        <Image className="h-5 w-5 shrink-0" />
                                        <span className={labelClass}>Your Thumbnails</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Manage your uploaded thumbnails</TooltipContent>
                            </Tooltip>

                            <Tooltip delayDuration={800}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className={`${btnBase} ${btnLayout} ${btnGap}`}>
                                        <LightbulbIcon className="h-5 w-5 shrink-0" />
                                        <span className={labelClass}>Inspirations</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>View saved inspirations</TooltipContent>
                            </Tooltip>

                            <Tooltip delayDuration={800}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className={`${btnBase} ${btnLayout} ${btnGap}`}>
                                        <Images className="h-5 w-5 shrink-0" />
                                        <span className={labelClass}>Assets</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Browse your uploaded assets</TooltipContent>
                            </Tooltip>

                            <Tooltip delayDuration={800}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className={`${btnBase} ${btnLayout} ${btnGap}`}>
                                        <FileChartColumn className="h-5 w-5 shrink-0" />
                                        <span className={labelClass}>Thumbnail Analysis</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Analyze your thumbnails</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-700/50 my-2" />

                    {/* Settings */}
                    <Link href="/settings" className="w-full">
                        <Tooltip delayDuration={800}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className={`${btnBase} ${btnLayout} ${btnGap}`}>
                                    <Settings className="h-5 w-5 shrink-0" />
                                    <span className={labelClass}>Settings</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Change your dashboard settings</TooltipContent>
                        </Tooltip>
                    </Link>
                </nav>

                <div className={`text-xs text-gray-400 px-4 py-3 transition-opacity ${collapsed ? "opacity-0" : "opacity-60"}`}>
                    © 2025 Mr. Clicks
                </div>

                {/* 透明熱區：收納時覆蓋整個側欄（含導覽區），點擊任何地方展開 */}
                {collapsed && (
                    <button
                        type="button"
                        aria-hidden
                        className="absolute inset-0 z-10"
                        onClick={toggleCollapse}
                        tabIndex={-1}
                        title="" // 避免原生 tooltip
                    />
                )}
            </aside>
        </TooltipProvider>
    );
}
