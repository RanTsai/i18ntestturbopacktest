"use client";

import React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import clsx from "clsx";
import Image from "next/image";

// ===== shadcn/ui =====
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CollapsibleCard } from "../collapsiblecard";

// ===== icons =====
import {
    ChevronsLeft,
    ChevronsRight,
    Upload,
    Download,
    Wand2,
    Sparkles,
    MessageSquare,
    Star,
    AlertTriangle,
    Pencil,
    CheckCircle2,
    Clock,
    History,
    BarChart2,
    Heart,
    ChevronRight,
} from "lucide-react";

// ===== your existing ChatArea (kept intact) =====
import ChatArea from "./chat-area";

/**
 * ClientPage：SSR 的 page.tsx 請僅渲染 <ClientPage/>。
 * 這裡包住 SplitShell（左：ChatArea、右：DashboardUI），只做 UI/互動，不動既有業務邏輯。
 */
export default function ClientPage() {
    return (
        <div className="h-screen bg-background text-foreground">
            <SplitShell left={<ChatArea />} right={<DashboardUI />} />
        </div>
    );
}

/**
 * SplitShell：三欄 Grid（Left｜Handle｜Right），控制拖拉與右欄收納。
 * 注意：不接資料邏輯，僅維持 UI 行為（drag/collapse）。
 */
function SplitShell({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  const [leftPct, setLeftPct] = useState<number>(62); // 展開時左欄比例
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const isDraggingRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);

  // 監聽容器寬度（百分比 → 像素）
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerW(el.clientWidth));
    ro.observe(el);
    setContainerW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const HANDLE_W = 8;
  const RIGHT_COLLAPSED_W = 56;

  // 展開狀態下右欄的像素寬（由 leftPct 推得）
  const expandedRightPx = Math.max(0, ((100 - leftPct) / 100) * containerW);

  // 🔑 用這個數字控制 grid 第三欄寬度
  const [rightW, setRightW] = useState<number>(expandedRightPx);

  // 初始化 / leftPct 或容器變更時，若「未收合」，把 rightW 用 spring 跟上
  useEffect(() => {
    if (rightCollapsed) return;
    animate(rightW, expandedRightPx, {
      type: "spring",
      stiffness: 320,
      damping: 28,
      onUpdate: (v) => setRightW(v),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedRightPx, rightCollapsed, containerW]);

  // 拖拉（收合時禁用）
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || rightCollapsed || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      let pct = (x / rect.width) * 100;
      pct = Math.max(38, Math.min(70, pct));
      setLeftPct(pct);
      // 即時更新右欄像素寬，避免空白與卡頓
      setRightW(((100 - pct) / 100) * rect.width);
    };
    const onUp = () => (isDraggingRef.current = false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [rightCollapsed]);

  // 點擊切換收合/展開：用 spring 從當前 rightW → 目標
  const toggleRight = () => {
    setRightCollapsed((prev) => {
      const next = !prev;
      const to = next ? RIGHT_COLLAPSED_W : expandedRightPx;
      animate(rightW, to, {
        type: "spring",
        stiffness: 320,
        damping: 28,
        onUpdate: (v) => setRightW(v),
      });
      return next;
    });
  };

  return (
    <div className="mx-auto h-full max-w-[1600px] 2xl:max-w-[1760px] px-4 lg:px-6">
      {/* 🔑 grid 第三欄用 rightW（px），不再留下空白 */}
      <motion.div
        ref={containerRef}
        id="aichat-split-container"
        className="grid h-[calc(100dvh-0px)] gap-1 select-none"
        style={{
          gridTemplateColumns: `calc(100% - ${HANDLE_W}px - ${rightW}px) ${HANDLE_W}px ${rightW}px`,
        }}
      >
        {/* Left */}
        <div className="flex flex-col min-w-0 rounded-md overflow-hidden bg-background">
          {left}
        </div>

        {/* Handle */}
        <div
          role="separator"
          aria-orientation="vertical"
          title="拖曳調整左右面板寬度"
          className={`relative rounded-md ${rightCollapsed ? "cursor-not-allowed opacity-60" : "cursor-col-resize"} group`}
          onMouseDown={() => {
            if (!rightCollapsed) isDraggingRef.current = true;
          }}
        >
          <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-[3px] rounded bg-border group-hover:bg-primary/60" />
        </div>

        {/* Right: Dashboard（內容淡入淡出照舊；「寬度」交給 grid 控制） */}
        <aside className="rounded-md overflow-y-auto bg-background relative">
          <button
            onClick={toggleRight}
            className="absolute top-2 right-2 z-20 h-8 w-8 inline-flex items-center justify-center rounded-md bg-muted hover:bg-accent"
            title={rightCollapsed ? "Expand" : "Collapse"}
            aria-label={rightCollapsed ? "Expand panel" : "Collapse panel"}
          >
            {rightCollapsed ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
          </button>

          <AnimatePresence initial={false} mode="wait">
            {rightCollapsed ? (
              <motion.div
                key="rail"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
                className="h-full relative"
              >
                <button className="absolute inset-0" aria-label="Expand dashboard" onClick={toggleRight} />
                <TooltipProvider>
                  <div className="h-full flex flex-col items-center pt-14 gap-3">
                    <RailIcon icon={<Wand2 className="h-5 w-5" />} label="Thumbnail" />
                    <RailIcon icon={<MessageSquare className="h-5 w-5" />} label="Title" />
                    <RailIcon icon={<Sparkles className="h-5 w-5" />} label="Evaluation" />
                  </div>
                </TooltipProvider>
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18 }}
              >
                {right}
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </motion.div>
    </div>
  );
}


function RailIcon({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="h-10 w-10 rounded-xl bg-muted grid place-items-center hover:bg-accent">{icon}</div>
            </TooltipTrigger>
            <TooltipContent side="left">{label}</TooltipContent>
        </Tooltip>
    );
}

/**
 * DashboardUI：To Be 的右欄（純 UI）。
 * - 內部所有按鈕與操作為 stub，不呼叫外部邏輯。
 * - 具備獨立 ScrollArea，不干擾左欄。
 */
function DashboardUI() {
    // 右欄本地狀態僅供展示（不與 ChatArea 互動）
    const MOCK_TITLE = "10 JavaScript Tips That Will Transform Your Code Forever!";
    const [title, setTitle] = useState(MOCK_TITLE);
    const recommended = "60–100";
    const charCount = title.length;

    const MOCK_VERSIONS: Array<{ id: string; title: string; thumb: string; score: number; favorite?: boolean }> = [
        {
            id: "v1",
            title: "Bold Left Title",
            thumb:
                "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails/TheMonkeyMan%20V3.jpg",
            score: 8.5,
            favorite: true,
        },
        {
            id: "v2",
            title: "Centered Subject",
            thumb:
                "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails/Thumbnail%20-%20Short%201.png",
            score: 7.9,
        },
        {
            id: "v3",
            title: "High Contrast",
            thumb:
                "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails/Thumbnail%20-%20Short%201.png",
            score: 8.1,
        },
    ];

    const [activeVersion, setActiveVersion] = useState(MOCK_VERSIONS[0]);

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

    const PERSONA_META = {
        TeenAudience: { name: "青少年觀眾", color: "#60a5fa" },
        DesignerCritic: { name: "專業設計評論", color: "#a78bfa" },
        SEOGuru: { name: "SEO 專家", color: "#34d399" },
    } as const;
    type PersonaKey = keyof typeof PERSONA_META;

    const EVAL_LATEST: Record<PersonaKey, { score: number; iter: number; time: string; summary: string }> = {
        TeenAudience: { score: 8.2, iter: 3, time: "2025-09-08 14:10", summary: "顏色飽和度受歡迎，但字體可更大。" },
        DesignerCritic: { score: 7.9, iter: 2, time: "2025-09-08 14:12", summary: "留白與視覺層級需微調，標題筆畫略細。" },
        SEOGuru: { score: 8.6, iter: 1, time: "2025-09-08 14:15", summary: "關鍵詞位置好，前 40 字有效率。" },
    };

    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyPersona, setHistoryPersona] = useState<PersonaKey | null>(null);
    const openHistory = (p: PersonaKey) => {
        setHistoryPersona(p);
        setHistoryOpen(true);
    };

    const slideIn = { initial: { opacity: 0, x: 8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 8 }, transition: { duration: 0.18 } };

    const MOCK_MODEL_THUMB =
        "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails/Thumbnail%20-%20Short%201.png";

    return (
        <motion.div {...slideIn}>
            <ScrollArea className="h-full">
                <div className="space-y-4">
                    {/* Thumbnail */}
                    <CollapsibleCard title="Thumbnail">
                        <div className="group relative w-full aspect-video rounded-2xl">
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
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="輸入你的標題…" />
                                </TooltipTrigger>
                                <TooltipContent side="top" align="end" className="text-xs">
                                    <div>
                                        Character count: <span className="font-medium">{charCount}</span>
                                    </div>
                                    <div>
                                        Recommended: <span className="font-medium">{recommended}</span>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 border border-border">
                                <Image src={"/logo/logo.png"} alt="Channel logo" width={32} height={32} className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-medium leading-tight truncate">Yeah that happened</div>
                                <div className="text-xs text-muted-foreground">Public • 76.4K views</div>
                            </div>
                        </div>
                    </CollapsibleCard>

                    {/* AI Analysis */}
                    <CollapsibleCard title="AI Analsis">
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="px-3 py-1 text-xs rounded-md border border-border bg-muted hover:bg-blue-600 hover:text-white">Dummy</button>
                        </div>
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
                    </CollapsibleCard>

                    {/* Audience Evaluation */}
                    <CollapsibleCard title="Audience Evaluation">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(Object.keys(PERSONA_META) as PersonaKey[]).map((p) => (
                                <EvaluationCard key={p} persona={p} meta={PERSONA_META[p]} data={EVAL_LATEST[p]} onOpenHistory={(x) => openHistory(x)} />
                            ))}
                        </div>
                    </CollapsibleCard>

                    {/* Compare Persona */}
                    <CollapsibleCard title="Compare persona">
                        <ComparePanel />
                    </CollapsibleCard>

                    {/* Versions */}
                    <CollapsibleCard title="Versions">
                        <Tabs defaultValue="all">
                            <TabsList className="mb-3">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="favorites">Favorites</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="mt-0">
                                <div className="grid grid-cols-2 gap-3">
                                    {MOCK_VERSIONS.map((v) => (
                                        <div key={v.id} className="group relative">
                                            <VersionCard v={v} selected={v.id === activeVersion.id} onSelect={() => setActiveVersion(v)} />
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="px-2 py-1 text-xs rounded-md border border-border bg-muted hover:bg-blue-600 hover:text-white">Dummy</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="favorites" className="mt-0">
                                <div className="grid grid-cols-2 gap-3">
                                    {MOCK_VERSIONS.filter((v) => v.favorite).map((v) => (
                                        <div key={v.id} className="group relative">
                                            <VersionCard v={v} selected={v.id === activeVersion.id} onSelect={() => setActiveVersion(v)} />
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="px-2 py-1 text-xs rounded-md border border-border bg-muted hover:bg-blue-600 hover:text-white">Dummy</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CollapsibleCard>

                    {/* Notes */}
                    <CollapsibleCard title="Notes">
                        <NoteItem title="避免紅底" body="品牌主色為紫 (#6C5CE7)，背景高對比但避免純紅底。" />
                        <NoteItem title="字體建議" body="標題字級 ≥ 64px，手機端需保證可讀性。" />
                        <Button variant="outline" size="sm" className="gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Add Note
                        </Button>
                    </CollapsibleCard>
                    <div className="h-8" />
                </div>
            </ScrollArea>

            {/* History Drawer（stub） */}
            <EvaluationHistoryDrawer
                open={historyOpen}
                persona={historyPersona}
                onClose={() => setHistoryOpen(false)}
            />
        </motion.div>
    );
}

/* =================== UI Fragments =================== */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-muted-foreground">{title}</div>
            </div>
            {children}
        </div>
    );
}

function ScoreChip({ label, value, tone = "warning" }: { label: string; value: string; tone?: "success" | "warning" | "danger" }) {
    const toneCls = tone === "success" ? "text-green-500" : tone === "danger" ? "text-red-500" : "text-yellow-500";
    return (
        <div className="flex items-center gap-1 text-muted-foreground">
            <Star className={clsx("h-4 w-4", toneCls)} />
            <span>
                {label}: <span className="text-foreground">{value}</span>
            </span>
        </div>
    );
}

function VersionCard({ v, selected, onSelect }: { v: { id: string; title: string; thumb: string; score: number; favorite?: boolean }; selected?: boolean; onSelect?: () => void; }) {
    return (
        <div className={clsx("group rounded-lg border border-border overflow-hidden cursor-pointer", selected && "ring-2 ring-primary")} onClick={onSelect}>
            <div className="relative w-full aspect-video">
                <Image src={v.thumb} alt={v.title} fill className="object-cover" sizes="210px" />
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

function EvaluationCard({ persona, meta, data, onOpenHistory, }: { persona: string; meta: { name: string; color: string }; data: { score: number; iter: number; time: string; summary: string }; onOpenHistory: (p: any) => void; }) {
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
                    <Sparkles className="h-3 w-3" /> Latest
                </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="text-3xl font-bold">{data.score.toFixed(1)}/10</div>
                <div className="text-sm text-muted-foreground">{data.summary}</div>
            </CardContent>
            <CardFooter className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => onOpenHistory(persona as any)}>
                    <History className="h-4 w-4" /> History
                </Button>
                <Button size="sm" className="gap-2">
                    <Sparkles className="h-4 w-4" /> Re-evaluate
                </Button>
            </CardFooter>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="px-3 py-1 text-xs rounded-md border border-border bg-muted hover:bg-blue-600 hover:text-white">Dummy</button>
            </div>
        </Card>
    );
}

function EvaluationHistoryDrawer({ open, persona, onClose, }: { open: boolean; persona: string | null; onClose: () => void; }) {
    if (!persona) return null;
    const colorMap: Record<string, string> = { TeenAudience: "#60a5fa", DesignerCritic: "#a78bfa", SEOGuru: "#34d399" };
    const nameMap: Record<string, string> = { TeenAudience: "青少年觀眾", DesignerCritic: "專業設計評論", SEOGuru: "SEO 專家" };
    const list: Array<{ iteration: number; when: string; score: number; notes: string[] }> = [
        { iteration: 1, when: "2025-09-08 13:40", score: 7.5, notes: ["想要更亮色", "標題有趣"] },
        { iteration: 2, when: "2025-09-08 13:55", score: 7.9, notes: ["對比提升", "人物更清晰"] },
        { iteration: 3, when: "2025-09-08 14:10", score: 8.2, notes: ["字更大更清楚", "用色更吸睛"] },
    ];
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xl bg-background border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full" style={{ background: colorMap[persona] }} />
                        {nameMap[persona]} — History
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
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button>
                        <BarChart2 className="h-4 w-4 mr-1" /> Compare to Latest
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ComparePanel() {
    const [tab, setTab] = useState<"table" | "radar">("table");
    const PERSONA_META = {
        TeenAudience: { name: "青少年觀眾", color: "#60a5fa" },
        DesignerCritic: { name: "專業設計評論", color: "#a78bfa" },
        SEOGuru: { name: "SEO 專家", color: "#34d399" },
    } as const;
    const METRICS = ["overall", "ctr", "readability", "brandFit"] as const;
    const VALUES: Record<keyof typeof PERSONA_META, Record<(typeof METRICS)[number], number>> = {
        TeenAudience: { overall: 8.2, ctr: 8.6, readability: 8.1, brandFit: 7.9 },
        DesignerCritic: { overall: 7.9, ctr: 7.8, readability: 8.4, brandFit: 8.3 },
        SEOGuru: { overall: 8.6, ctr: 8.9, readability: 8.0, brandFit: 8.1 },
    };

    return (
        <Card>
            <CardHeader className="pb-2 flex items-center justify-between">
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
                                    {METRICS.map((m) => (
                                        <th key={m} className="py-2 pr-2 capitalize">
                                            {m}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(PERSONA_META).map((k) => {
                                    const key = k as keyof typeof PERSONA_META;
                                    return (
                                        <tr key={key} className="border-t">
                                            <td className="py-2 pr-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-3 w-3 rounded-full" style={{ background: PERSONA_META[key].color }} />
                                                    {PERSONA_META[key].name}
                                                </div>
                                            </td>
                                            {METRICS.map((m) => (
                                                <td key={m} className="py-2 pr-2">
                                                    {VALUES[key][m].toFixed(1)}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {Object.keys(PERSONA_META).map((k) => {
                            const key = k as keyof typeof PERSONA_META;
                            return (
                                <div key={key} className="border rounded-md p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="h-3 w-3 rounded-full" style={{ background: PERSONA_META[key].color }} />
                                        <span className="text-sm font-medium">{PERSONA_META[key].name}</span>
                                    </div>
                                    {METRICS.map((m) => {
                                        const val = VALUES[key][m];
                                        return (
                                            <div key={m} className="mb-2">
                                                <div className="text-xs text-muted-foreground capitalize mb-1">{m}</div>
                                                <div className="h-2 w-full bg-muted rounded">
                                                    <div className="h-2 rounded" style={{ width: `${(val / 10) * 100}%`, background: PERSONA_META[key].color }} />
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
