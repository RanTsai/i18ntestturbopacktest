// components/ui/how-to-use-dialogue/ThumbnailAnalyzer-how-to-use.tsx
import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import {
    X,
    Upload,
    Bot,
    BarChart3,
    ShieldCheck,
    Lightbulb,
} from "lucide-react";
import { PageTranslations } from "@/i18n/interface";

interface Props {
    helpOpen: boolean;
    setHelpOpen: (open: boolean) => void;
    translation?: PageTranslations;
}

export default function ThumbnailAnalyzerHowToUse({
    helpOpen,
    setHelpOpen,
    translation,
}: Props) {
    return (
        <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
            <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-md border border-border shadow-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
                        {translation?.how_to_use_title?.translation ?? "How to use AI Analysis"}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {translation?.how_to_use_desc?.translation ??
                            "Quick steps to upload thumbnails and get AI analysis results"}
                    </DialogDescription>
                    <DialogClose className="absolute right-3 top-3 rounded-md p-1 hover:bg-accent">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogHeader>

                {/* Steps */}
                <div className="space-y-5 text-sm">
                    {/* Step 1 */}
                    <div className="flex items-start gap-3 rounded-md border border-border  p-3">
                        <span className="flex items-center justify-center h-9 w-9 rounded-full text-yellow-600 aspect-square">
                            <Upload className="h-4 w-4" />
                        </span>
                        <div>
                            <p className="font-semibold text-foreground">1) Upload</p>
                            <p className="text-muted-foreground">
                                Drop or click to upload your thumbnails (up to 6).{" "}
                                <span className="text-yellow-600 font-medium">
                                    HD helps, but message matters more than looks.
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3 rounded-md border border-border p-3">
                        <span className="flex items-center justify-center h-9 w-9 rounded-full  text-yellow-600 aspect-square">
                            <Bot className="h-4 w-4" />
                        </span>
                        <div>
                            <p className="font-semibold text-foreground">2) Get Review</p>
                            <p className="text-muted-foreground">
                                Click{" "}
                                <span className="text-yellow-600 font-medium">
                                    “Get Review”
                                </span>{" "}
                                to see how believable, clear, and aligned your thumbnail feels.
                                Sign in and add your video goal for deeper,{" "}
                                <span className="text-yellow-600 font-medium">
                                    intention-based analysis
                                </span>
                                .
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3 rounded-md border border-border p-3">
                        <span className="flex items-center justify-center h-9 w-9 rounded-full  text-yellow-600 aspect-square">
                            <BarChart3 className="h-4 w-4" />
                        </span>
                        <div>
                            <p className="font-semibold text-foreground">3) Read & Improve</p>
                            <p className="text-muted-foreground">
                                You’ll get scores for{" "}
                                <span className="text-yellow-600 font-medium">
                                    Clickability, Clarity, Relevance, CTR
                                </span>{" "}
                                and{" "}
                                <span className="text-yellow-600 font-medium">Branding</span>.
                                Focus on{" "}
                                <span className="text-yellow-600 font-medium">alignment</span>{" "}
                                — a simple but convincing thumbnail beats a beautiful yet
                                misleading one.
                            </p>
                        </div>
                    </div>

                    {/* Philosophy */}
                    <div className="flex items-start gap-3 rounded-md bg-muted/40 p-3">
                        <span className="flex items-center justify-center h-9 w-9 rounded-full text-yellow-600 aspect-square">
                            <Lightbulb className="h-4 w-4" />
                        </span>
                        <p className="text-muted-foreground">
                            <span className="text-yellow-600 font-medium">
                                Pretty isn’t always persuasive.
                            </span>{" "}
                            The goal is to make thumbnails that{" "}
                            <span className="font-medium text-foreground">
                                feel right to your audience.
                            </span>
                        </p>
                    </div>

                    {/* Privacy */}
                    <div className="flex items-start gap-3 rounded-md border p-3">
                        <ShieldCheck className="h-4 w-4 mt-0.5 text-yellow-600 shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Your thumbnails are stored securely for your features.{" "}
                            <span className="text-yellow-600 font-medium">
                                Your data are not used to train any AI
                            </span>
                            , and I’ll always ask first if that ever changes.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
