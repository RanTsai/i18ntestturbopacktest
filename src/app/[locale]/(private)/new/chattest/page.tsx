"use client";

import * as React from "react";
import { CollapsibleCard } from "./collapsiblecard";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
    MessageSquare,
    Upload,
    Download,
    Sparkles,
    Star,
    CheckCircle2,
    AlertTriangle,
    ChevronRight,
    Heart,
    Pencil,
    Wand2,
    Info,
    History,
    Clock,
    BarChart2
} from "lucide-react";

// --- shadcn/ui ---
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import clsx from "clsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";



// ---------- Mock Data ----------
type ChatMsg = {
    id: string;
    role: "user" | "assistant";
    content: string;
    time?: string;
    kind?: "text" | "titles" | "thumbs" | "score";
};

type Version = {
    id: string;
    title: string;
    thumb: string;
    score: number;
    favorite?: boolean;
};

const MOCK_MESSAGES: ChatMsg[] = [
    {
        id: "m1",
        role: "assistant",
        time: "03:04 PM",
        content:
            "Hi! I'm your YouTube optimization assistant. Upload a thumbnail and title, and I'll help you maximize views & engagement!",
    },
    {
        id: "m2",
        role: "assistant",
        kind: "titles",
        content:
            "這裡是三個標題建議：\n1) 10 個 JS 祕技：專案效能大躍進！\n2) 你不知道的 JS 誤區（修好之後點擊率暴升）\n3) 這 10 招讓你的 JS 變簡潔又高速",
    },
    {
        id: "m3",
        role: "assistant",
        kind: "thumbs",
        content:
            "我幫你生成了 3 張縮圖初稿，你可以在右側 Versions 區切換觀看或分析～",
    },
];

const MOCK_TITLE =
    "10 JavaScript Tips That Will Transform Your Code Forever!";
const MOCK_VERSIONS: Version[] = [
    {
        id: "v1",
        title: "Bold Left Title",
        thumb: "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails/TheMonkeyMan%20V3.jpg",
        score: 8.5,
        favorite: true,
    },
    {
        id: "v2",
        title: "Centered Subject",
        thumb: "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails/Thumbnail%20-%20Short%201.png",
        score: 7.9,
    },
    {
        id: "v3",
        title: "High Contrast",
        thumb: "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails/Thumbnail%20-%20Short%201.png",
        score: 8.1,
    },
];

const MOCK_SCORES = {
    overall: 8.5,
    ctr: "High",
    engagement: "Very Good",
    suggestions: [
        "Consider making the text larger for mobile viewers",
        "Add more contrast between text and background",
        "Facial expression could be more excited",
    ],
};

// ---------- UI ----------
export default function YouTubeOptimizerDemo() {
    const [activeVersion, setActiveVersion] = React.useState<Version>(
        MOCK_VERSIONS[0]
    );
    const [title, setTitle] = React.useState(MOCK_TITLE);

    const charCount = title.length;
    const recommended = "60–100";

    const [leftPct, setLeftPct] = React.useState<number>(62); // 左欄%寬（預設 62%）
    const isDraggingRef = React.useRef(false);

    React.useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;
            // 取得容器寬度，換算成百分比
            const container = document.getElementById("yt-optimizer-container");
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            let pct = (x / rect.width) * 100;
            // 限制左右欄比例（避免太窄/太寬）
            pct = Math.max(38, Math.min(70, pct));
            setLeftPct(pct);
        };
        const onUp = () => (isDraggingRef.current = false);

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, []);

    // 建議標題（示例）
    const SUGGESTED_TITLES = [
        "末日的機器人：人類最後的夥伴？",
        "他們稱它為末日機器人，但真相不只如此",
        "用這 7 招打造爆紅末日機器人縮圖"
    ];

    // 模擬模型生成縮圖（可改成你的 URL）
    const MOCK_MODEL_THUMB = "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails/Thumbnail%20-%20Short%201.png";

    // 把建議標題套用到右側欄位
    const applySuggestedTitle = (t: string) => setTitle(t);

    // 把模型生成的縮圖替換到右側預覽
    const useModelThumbnail = () =>
        setActiveVersion((prev) => ({ ...prev, thumb: MOCK_MODEL_THUMB }));


    // 右側收納狀態
    const RIGHT_COLLAPSED_W = 56; // 收納 rail 寬度（px）
    const [rightCollapsed, setRightCollapsed] = React.useState(false);

    React.useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!isDraggingRef.current || rightCollapsed) return; // 收納時禁止拖拉
            const container = document.getElementById("yt-optimizer-container");
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            let pct = (x / rect.width) * 100;
            pct = Math.max(38, Math.min(70, pct));
            setLeftPct(pct);
        };
        const onUp = () => (isDraggingRef.current = false);

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [rightCollapsed]);

    // grid 欄寬：展開用百分比，收納改成固定 rail 寬
    const gridCols = rightCollapsed
        ? `calc(100% - 8px - ${RIGHT_COLLAPSED_W}px) 8px ${RIGHT_COLLAPSED_W}px`
        : `${leftPct}% 8px ${100 - leftPct}%`;

    // 動畫參數
    const slideIn = { initial: { opacity: 0, x: 8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 8 }, transition: { duration: 0.18 } };
    const slideOut = { initial: { opacity: 0, x: 8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 8 }, transition: { duration: 0.12 } };

    const [historyOpen, setHistoryOpen] = React.useState(false);
    const [historyPersona, setHistoryPersona] = React.useState<PersonaKey | null>(null);
    const openHistory = (p: PersonaKey) => {
        setHistoryPersona(p);
        setHistoryOpen(true);
    };

    return (
        <div className="h-dvh w-full bg-background text-foreground">
            {/* 容器：限制最大寬度並置中，適配 1080p～4K */}
            <div className="mx-auto h-full max-w-[1600px] 2xl:max-w-[1760px] px-4 lg:px-6">
                {/* 可調整左右欄的 Grid：中間放一條「拖拉桿」 */}
                <div
                    id="yt-optimizer-container"
                    className="grid h-[calc(100dvh-48px)] gap-4 select-none"
                    style={{ gridTemplateColumns: gridCols }}
                >
                    {/* Left: Chat（會跟著 leftPct 自適應） */}
                    <div className="border-r border-border flex flex-col min-w-0 rounded-md overflow-hidden bg-background">
                        <ChatHeader />
                        <Separator />
                        <ScrollArea className="flex-1">
                            <div className="p-4 space-y-6">
                                {MOCK_MESSAGES.map((m: any) => <ChatBubble key={m.id} msg={m} />)}

                                {/* 模型建議標題（hover 顯示 Use） */}
                                <div className="flex justify-start">
                                    <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3 max-w-[70%]">
                                        <div className="text-sm font-medium mb-2">模型建議標題</div>
                                        <ul className="space-y-2">
                                            {SUGGESTED_TITLES.map((t) => (
                                                <li key={t} className="group relative border border-border rounded-md p-2 text-sm hover:bg-muted/70 transition-colors">
                                                    <div className="pr-24">{t}</div>
                                                    <button
                                                        className="absolute top-1/2 -translate-y-1/2 right-2 px-3 py-1 text-xs rounded-md border border-border bg-muted opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 hover:text-white"
                                                        onClick={() => applySuggestedTitle(t)}
                                                    >
                                                        Use
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* 模型生成縮圖（hover 顯示 Use Thumbnail） */}
                                <div className="flex justify-start">
                                    <div className="bg-muted rounded-2xl rounded-bl-none p-3">
                                        <div className="text-sm font-medium mb-2">模型生成縮圖（模擬）</div>
                                        <div className="relative w-[min(520px,60vw)] max-w-full aspect-video border border-border rounded-lg overflow-hidden group">
                                            <img src={MOCK_MODEL_THUMB} alt="Model generated thumbnail (mock)" className="w-full h-full object-cover" />
                                            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="px-3 py-1 text-xs rounded-md border border-border bg-muted hover:bg-blue-600 hover:text-white"
                                                    onClick={useModelThumbnail}
                                                >
                                                    Use Thumbnail
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 其他對話 */}
                                <ChatBubble msg={{ id: "m4", role: "user", content: "我選 v1，幫我分析一下並給改進建議" }} />
                                <ChatBubble msg={{ id: "m5", role: "assistant", kind: "score", content: "分析完成：CTR 高、整體 8.5/10，建議提高標題字重與對比度，並保留左側留白。" }} />
                            </div>
                        </ScrollArea>

                        {/* Input Bar (Mock) */}
                        <div className="p-3 border-t border-border">
                            <div className="flex items-center gap-2">
                                <Input placeholder="Ask for feedback on your thumbnail and title..." />
                                <Button variant="outline" className="gap-2">
                                    <Upload className="h-4 w-4" />
                                    Upload
                                </Button>
                                <Button className="gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Generate Ideas
                                </Button>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <button className="hover:text-foreground">Quick Tips</button>
                                <span>•</span>
                                <button className="hover:text-foreground">Templates</button>
                            </div>
                        </div>
                    </div>

                    {/* Drag handle（拖拉桿） */}
                    <div
                        role="separator"
                        aria-orientation="vertical"
                        title="拖曳調整左右面板寬度"
                        className="relative cursor-col-resize group rounded-md"
                        onMouseDown={() => { if (!rightCollapsed) isDraggingRef.current = true; }}
                    >
                        <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-[3px] rounded bg-border group-hover:bg-primary/60" />
                    </div>

                    {/* Right: Dashboard（自適應剩餘寬度，可收納） */}
                    <motion.aside
                        initial={false}
                        className="rounded-md overflow-hidden bg-background border border-border relative"
                        aria-expanded={!rightCollapsed}
                    >
                        {/* 收納/展開按鈕 */}
                        <button
                            onClick={() => setRightCollapsed(v => !v)}
                            className="absolute top-2 right-2 z-20 h-8 w-8 inline-flex items-center justify-center rounded-md bg-muted hover:bg-accent"
                            title={rightCollapsed ? "Expand" : "Collapse"}
                            aria-label={rightCollapsed ? "Expand panel" : "Collapse panel"}
                        >
                            {rightCollapsed ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
                        </button>

                        <AnimatePresence initial={false} mode="wait">
                            {rightCollapsed ? (
                                // 收納：Rail 模式
                                <motion.div key="rail" {...slideOut} className="h-full relative">
                                    <button className="absolute inset-0" aria-label="Expand dashboard" onClick={() => setRightCollapsed(false)} title="Expand" />
                                    <TooltipProvider>
                                        <div className="h-full flex flex-col items-center pt-14 gap-3">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="h-10 w-10 rounded-xl bg-muted grid place-items-center hover:bg-accent">
                                                        <Wand2 className="h-5 w-5" />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="left">Thumbnail</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="h-10 w-10 rounded-xl bg-muted grid place-items-center hover:bg-accent">
                                                        <MessageSquare className="h-5 w-5" />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="left">Title</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="h-10 w-10 rounded-xl bg-muted grid place-items-center hover:bg-accent">
                                                        <Sparkles className="h-5 w-5" />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="left">Evaluation</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
                                </motion.div>
                            ) : (
                                // 展開：完整 Dashboard
                                <motion.div key="expanded" {...slideIn}>
                                    <ScrollArea className="h-full">
                                        <div className="p-3 md:p-4 space-y-4">
                                            {/* Thumbnail Preview（含 hover dummy 按鈕） */}
                                            <CollapsibleCard title="Thumbnail">
                                                <Card className="overflow-hidden">
                                                    <CardContent className="p-0">
                                                        <div className="group relative w-full aspect-video">
                                                            <Image
                                                                src={activeVersion.thumb}
                                                                alt="Active thumbnail"
                                                                fill
                                                                className="object-cover"
                                                                sizes="(min-width: 1280px) 700px, 100vw"
                                                                priority
                                                            />
                                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600/40" />
                                                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button size="sm" variant="secondary" className="pointer-events-auto bg-white/90 hover:bg-white">
                                                                    <Upload className="h-4 w-4 mr-1" />
                                                                    Upload
                                                                </Button>
                                                                <Button size="sm" variant="secondary" className="pointer-events-auto bg-white/90 hover:bg-white">
                                                                    <Wand2 className="h-4 w-4 mr-1" />
                                                                    Replace
                                                                </Button>
                                                                <Button size="sm" className="pointer-events-auto bg-white/90 text-foreground hover:bg-white" variant="secondary">
                                                                    <Download className="h-4 w-4 mr-1" />
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </CollapsibleCard>

                                            {/* Title Editor（保留你的 hover 提示） */}
                                            <CollapsibleCard title="Title">

                                                <Card>
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-center gap-2 rounded-2xl hover:text-foreground hover:border-2 hover:border-purple-400">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Input
                                                                            value={title}
                                                                            onChange={(e) => setTitle(e.target.value)}
                                                                            placeholder="輸入你的標題…"
                                                                        />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" align="end" className="text-xs">
                                                                        <div>Character count: <span className="font-medium">{charCount}</span></div>
                                                                        <div>Recommended: <span className="font-medium">{recommended}</span></div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </CardHeader>

                                                    <CardContent className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 border border-border">
                                                                <Image src={"/logo/logo.png"} alt="Channel logo" width={32} height={32} className="h-full w-full object-cover" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-medium leading-tight truncate">Yeah that happened</div>
                                                                <div className="text-xs text-muted-foreground">Public • 76.4K views</div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </CollapsibleCard>

                                            {/* AI Evaluation（你原有的一卡，保留） */}
                                            <CollapsibleCard title="AI Analysis">

                                                <Card className="group relative">
                                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="px-3 py-1 text-xs rounded-md border border-border bg-muted hover:bg-blue-600 hover:text-white">
                                                            Dummy
                                                        </button>
                                                    </div>
                                                    <CardHeader className="pb-2">
                                                        <div className="flex items-center justify-between">
                                                            <CardTitle className="flex items-center gap-2 text-[clamp(14px,1vw,18px)]">
                                                                AI Evaluation
                                                                <Badge variant="secondary" className="gap-1">
                                                                    <Sparkles className="h-3 w-3" />
                                                                    AI Powered
                                                                </Badge>
                                                            </CardTitle>
                                                            <Button size="sm" className="gap-2">
                                                                <Sparkles className="h-4 w-4" />
                                                                Re-analyze Content
                                                            </Button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div className="flex items-end gap-6">
                                                            <div className="text-3xl font-bold">{MOCK_SCORES.overall}/10</div>
                                                            <div className="flex items-center gap-3 text-sm">
                                                                <ScoreChip label="Click-through" value={MOCK_SCORES.ctr} />
                                                                <ScoreChip label="Engagement" value={MOCK_SCORES.engagement} tone="success" />
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">Suggestions for Improvement:</div>
                                                        <ul className="text-sm space-y-2">
                                                            {MOCK_SCORES.suggestions.map((s, i) => (
                                                                <li key={i} className="flex items-start gap-2">
                                                                    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
                                                                    <span>{s}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </CardContent>
                                                </Card>
                                            </CollapsibleCard>


                                            {/* ============ 新增區塊 1：多 Persona 最新評分卡 ============ */}
                                            <CollapsibleCard title="Audience Evaluation">

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {(Object.keys(PERSONA_META) as PersonaKey[]).map((p) => (
                                                        <EvaluationCard key={p} persona={p} onOpenHistory={openHistory} />
                                                    ))}
                                                </div>
                                            </CollapsibleCard>

                                            {/* ============ 新增區塊 2：Compare Panel（跨 Persona 對比） ============ */}
                                            <CollapsibleCard title="Compare persona">
                                            <ComparePanel />
                                            </CollapsibleCard>

                                            {/* Versions Gallery（保留你的區塊） */}
                                            <CollapsibleCard title="Version Gallery">

                                                <Card>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-[clamp(14px,1vw,18px)]">Versions</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <Tabs defaultValue="all">
                                                            <TabsList className="mb-3">
                                                                <TabsTrigger value="all">All</TabsTrigger>
                                                                <TabsTrigger value="favorites">Favorites</TabsTrigger>
                                                            </TabsList>

                                                            <TabsContent value="all" className="mt-0">
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {MOCK_VERSIONS.map((v: any) => (
                                                                        <div key={v.id} className="group relative">
                                                                            <VersionCard v={v} selected={v.id === activeVersion.id} onSelect={() => setActiveVersion(v)} />
                                                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <button className="px-2 py-1 text-xs rounded-md border border-border bg-muted hover:bg-blue-600 hover:text-white">
                                                                                    Dummy
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </TabsContent>

                                                            <TabsContent value="favorites" className="mt-0">
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {MOCK_VERSIONS.filter((v: any) => v.favorite).map((v: any) => (
                                                                        <div key={v.id} className="group relative">
                                                                            <VersionCard v={v} selected={v.id === activeVersion.id} onSelect={() => setActiveVersion(v)} />
                                                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <button className="px-2 py-1 text-xs rounded-md border border-border bg-muted hover:bg-blue-600 hover:text-white">
                                                                                    Dummy
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </TabsContent>
                                                        </Tabs>
                                                    </CardContent>
                                                </Card>
                                            </CollapsibleCard>

                                            <CollapsibleCard title="Notes">
                                                {/* Notes / References（保留） */}
                                                <Card>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-[clamp(14px,1vw,18px)]">Notes & References</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <NoteItem title="避免紅底" body="品牌主色為紫 (#6C5CE7)，背景高對比但避免純紅底。" />
                                                        <NoteItem title="字體建議" body="標題字級 ≥ 64px，手機端需保證可讀性。" />
                                                        <Button variant="outline" size="sm" className="gap-2">
                                                            <MessageSquare className="h-4 w-4" />
                                                            Add Note
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </CollapsibleCard>

                                            <div className="h-8" />
                                        </div>
                                    </ScrollArea>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.aside>
                </div>
            </div>

            {/* ============ 新增：History Drawer ============ */}
            <EvaluationHistoryDrawer
                open={historyOpen}
                persona={historyPersona}
                onClose={() => setHistoryOpen(false)}
            />
        </div>
    );
}

// ---------- Pieces ----------
function ChatHeader() {
    return (<></>
        // <div className="h-12 px-4 flex items-center justify-between">
        //     <div className="flex items-center gap-2">
        //         <div className="h-7 w-7 rounded-full bg-muted grid place-items-center">
        //             <Sparkles className="h-4 w-4" />
        //         </div>
        //         <div className="font-semibold">AI Assistant</div>
        //     </div>
        //     <div className="flex items-center gap-2 text-xs text-muted-foreground">
        //         <button className="hover:text-foreground">Notes</button>
        //         <span>•</span>
        //         <button className="hover:text-foreground">History</button>
        //         <span>•</span>
        //         <button className="hover:text-foreground">Settings</button>
        //     </div>
        // </div>
    );
}

function ChatBubble({ msg }: { msg: ChatMsg }) {
    const isUser = msg.role === "user";
    return (
        <div
            className={clsx("flex gap-2", {
                "justify-end": isUser,
                "justify-start": !isUser,
            })}
        >
            {!isUser && (
                <div className="h-8 w-8 rounded-full bg-muted grid place-items-center shrink-0">
                    <Sparkles className="h-4 w-4" />
                </div>
            )}
            <div
                className={clsx(
                    "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                    isUser
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                )}
            >
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                {msg.kind === "titles" && (
                    <div className="mt-2 text-xs text-muted-foreground">
                        點右側 Title 區可直接編輯與重新分析
                    </div>
                )}
                {msg.kind === "thumbs" && (
                    <div className="mt-2 text-xs text-muted-foreground">
                        縮圖初稿已放在右側 Versions 區
                    </div>
                )}
                {msg.kind === "score" && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Overall 8.5/10</span>
                    </div>
                )}
            </div>
            {isUser && (
                <div className="h-8 w-8 rounded-full bg-muted grid place-items-center shrink-0">
                    <MessageSquare className="h-4 w-4" />
                </div>
            )}
        </div>
    );
}

function ScoreChip({
    label,
    value,
    tone = "warning",
}: {
    label: string;
    value: string;
    tone?: "success" | "warning" | "danger";
}) {
    const toneCls =
        tone === "success"
            ? "text-green-500"
            : tone === "danger"
                ? "text-red-500"
                : "text-yellow-500";
    return (
        <div className="flex items-center gap-1 text-muted-foreground">
            <Star className={clsx("h-4 w-4", toneCls)} />
            <span>
                {label}: <span className="text-foreground">{value}</span>
            </span>
        </div>
    );
}

function VersionCard({
    v,
    selected,
    onSelect,
}: {
    v: Version;
    selected?: boolean;
    onSelect?: () => void;
}) {
    return (
        <div
            className={clsx(
                "group rounded-lg border border-border overflow-hidden cursor-pointer",
                selected && "ring-2 ring-primary"
            )}
            onClick={onSelect}
        >
            <div className="relative w-full aspect-video">
                <Image
                    src={v.thumb}
                    alt={v.title}
                    fill
                    className="object-cover"
                    sizes="210px"
                />
                <div className="absolute inset-0 hidden group-hover:flex items-center justify-center gap-2 bg-black/30">
                    <Button size="sm" variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Select
                    </Button>
                    <Button size="sm" variant="secondary" className="gap-1">
                        <Wand2 className="h-4 w-4" />
                        Analyse
                    </Button>
                    <Button size="sm" variant="secondary" className="gap-1">
                        <Pencil className="h-4 w-4" />
                        Edit
                    </Button>
                </div>
            </div>
            <div className="p-2 flex items-center justify-between">
                <div className="text-sm font-medium truncate">{v.title}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 text-yellow-400" />
                    {v.score}
                    {v.favorite && <Heart className="h-3 w-3 text-pink-400 ml-1" />}
                </div>
            </div>
        </div>
    );
}

function NoteItem({ title, body }: { title: string; body: string }) {
    return (
        <div className="rounded-md border border-border p-3">
            <div className="text-sm font-medium">{title}</div>
            <div className="text-xs text-muted-foreground mt-1">{body}</div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <button className="hover:text-foreground flex items-center gap-1">
                    <Pencil className="h-3 w-3" /> Edit
                </button>
                <span>•</span>
                <button className="hover:text-foreground flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" /> Copy
                </button>
                <span>•</span>
                <button className="hover:text-foreground flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Delete
                </button>
            </div>
        </div>
    );
}


type PersonaKey = "TeenAudience" | "DesignerCritic" | "SEOGuru";
type MetricKey = "overall" | "ctr" | "readability" | "brandFit";

const PERSONA_META: Record<PersonaKey, { name: string; color: string }> = {
    TeenAudience: { name: "青少年觀眾", color: "#60a5fa" },
    DesignerCritic: { name: "專業設計評論", color: "#a78bfa" },
    SEOGuru: { name: "SEO 專家", color: "#34d399" },
};

const EVAL_LATEST: Record<PersonaKey, { score: number; iter: number; time: string; summary: string }> = {
    TeenAudience: { score: 8.2, iter: 3, time: "2025-09-08 14:10", summary: "顏色飽和度受歡迎，但字體可更大。" },
    DesignerCritic: { score: 7.9, iter: 2, time: "2025-09-08 14:12", summary: "留白與視覺層級需微調，標題筆畫略細。" },
    SEOGuru: { score: 8.6, iter: 1, time: "2025-09-08 14:15", summary: "關鍵詞位置好，前 40 字有效率。" },
};

const EVAL_HISTORY: Record<
    PersonaKey,
    Array<{ iteration: number; when: string; score: number; notes: string[] }>
> = {
    TeenAudience: [
        { iteration: 1, when: "2025-09-08 13:40", score: 7.5, notes: ["想要更亮色", "標題有趣"] },
        { iteration: 2, when: "2025-09-08 13:55", score: 7.9, notes: ["對比提升", "人物更清晰"] },
        { iteration: 3, when: "2025-09-08 14:10", score: 8.2, notes: ["字更大更清楚", "用色更吸睛"] },
    ],
    DesignerCritic: [
        { iteration: 1, when: "2025-09-08 13:50", score: 7.4, notes: ["排版稀疏", "色塊未對齊"] },
        { iteration: 2, when: "2025-09-08 14:12", score: 7.9, notes: ["標題加粗", "主視覺對焦正確"] },
    ],
    SEOGuru: [
        { iteration: 1, when: "2025-09-08 14:15", score: 8.6, notes: ["關鍵詞靠左上", "避免截斷"] },
    ],
};

// ComparePanel 用的指標（dummy）
const COMPARE_METRICS: MetricKey[] = ["overall", "ctr", "readability", "brandFit"];
const COMPARE_VALUES: Record<PersonaKey, Record<MetricKey, number>> = {
    TeenAudience: { overall: 8.2, ctr: 8.6, readability: 8.1, brandFit: 7.9 },
    DesignerCritic: { overall: 7.9, ctr: 7.8, readability: 8.4, brandFit: 8.3 },
    SEOGuru: { overall: 8.6, ctr: 8.9, readability: 8.0, brandFit: 8.1 },
};

/** ========== 新增：評分 UI 元件 ========== */
function EvaluationCard({
    persona,
    onOpenHistory,
}: {
    persona: PersonaKey;
    onOpenHistory: (p: PersonaKey) => void;
}) {
    const meta = PERSONA_META[persona];
    const data = EVAL_LATEST[persona];

    return (
        <Card className="group relative">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full" style={{ background: meta.color }} />
                    <div>
                        <div className="text-sm font-medium">{meta.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {data.time}（Iter #{data.iter}）
                        </div>
                    </div>
                </div>
                <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Latest
                </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="text-3xl font-bold">{data.score.toFixed(1)}/10</div>
                <div className="text-sm text-muted-foreground">{data.summary}</div>
            </CardContent>
            <CardFooter className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => onOpenHistory(persona)}>
                    <History className="h-4 w-4" />
                    History
                </Button>
                <Button size="sm" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Re-evaluate
                </Button>
            </CardFooter>

            {/* hover dummy */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="px-3 py-1 text-xs rounded-md border border-border bg-muted hover:bg-blue-600 hover:text-white">
                    Dummy
                </button>
            </div>
        </Card>
    );
}

function EvaluationHistoryDrawer({
    open,
    persona,
    onClose,
}: {
    open: boolean;
    persona: PersonaKey | null;
    onClose: () => void;
}) {
    if (!persona) return null;
    const meta = PERSONA_META[persona];
    const list = EVAL_HISTORY[persona] ?? [];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xl bg-background border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full" style={{ background: meta.color }} />
                        {meta.name} — History
                    </DialogTitle>
                    <DialogDescription>該 Persona 對此版本的歷次迭代評分紀錄</DialogDescription>
                </DialogHeader>

                <div className="space-y-3 max-h-[50vh] overflow-auto">
                    {list.map((it) => (
                        <div key={it.iteration} className="border rounded-md p-3">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">Iteration #{it.iteration}</div>
                                <div className="text-xs text-muted-foreground">{it.when}</div>
                            </div>
                            <div className="text-2xl font-semibold mt-1">{it.score.toFixed(1)}/10</div>
                            <ul className="text-sm mt-2 space-y-1">
                                {it.notes.map((n, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        <span>{n}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button>
                        <BarChart2 className="h-4 w-4 mr-1" />
                        Compare to Latest
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ComparePanel() {
    const [tab, setTab] = React.useState<"table" | "radar">("table");

    return (
        <Card>
            <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[clamp(14px,1vw,18px)]">
                    Compare Personas
                    <Badge variant="secondary">Latest</Badge>
                </CardTitle>
                <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                    <TabsList>
                        <TabsTrigger value="table">Table</TabsTrigger>
                        <TabsTrigger value="radar">Radar</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>

            <CardContent>
                {tab === "table" ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-muted-foreground">
                                    <th className="py-2 pr-2">Persona</th>
                                    {COMPARE_METRICS.map((m) => (
                                        <th key={m} className="py-2 pr-2 capitalize">{m}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(PERSONA_META).map((k) => {
                                    const key = k as PersonaKey;
                                    return (
                                        <tr key={key} className="border-t">
                                            <td className="py-2 pr-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-3 w-3 rounded-full" style={{ background: PERSONA_META[key].color }} />
                                                    {PERSONA_META[key].name}
                                                </div>
                                            </td>
                                            {COMPARE_METRICS.map((m) => (
                                                <td key={m} className="py-2 pr-2">
                                                    {COMPARE_VALUES[key][m].toFixed(1)}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // 簡易雷達占位（純 CSS 柱狀環圈的假視覺）
                    <div className="grid grid-cols-3 gap-4">
                        {Object.keys(PERSONA_META).map((k) => {
                            const key = k as PersonaKey;
                            return (
                                <div key={key} className="border rounded-md p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="h-3 w-3 rounded-full" style={{ background: PERSONA_META[key].color }} />
                                        <span className="text-sm font-medium">{PERSONA_META[key].name}</span>
                                    </div>
                                    {COMPARE_METRICS.map((m) => {
                                        const val = COMPARE_VALUES[key][m];
                                        return (
                                            <div key={m} className="mb-2">
                                                <div className="text-xs text-muted-foreground capitalize mb-1">{m}</div>
                                                <div className="h-2 w-full bg-muted rounded">
                                                    <div
                                                        className="h-2 rounded"
                                                        style={{ width: `${(val / 10) * 100}%`, background: PERSONA_META[key].color }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}