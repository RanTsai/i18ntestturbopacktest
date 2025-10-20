// components/ui/how-to-use-dialogue/youtube-preview-how-to-use.tsx
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { PageTranslations } from '@/i18n/interface';
interface Props {
    helpOpen: boolean;
    setHelpOpen: (open: boolean) => void;
    translation?: PageTranslations;
}

export default function YoutubeHomeHowToUse({ helpOpen, setHelpOpen, translation }: Props) {
    return (
        <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {translation?.how_to_use_title?.translation ?? "How to use device preview"}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {translation?.how_to_use_desc?.translation ??
                            "Instructions for using the YouTube device preview page"}
                    </DialogDescription>

                    <DialogClose className="absolute right-3 top-3 rounded-md p-1 hover:bg-accent">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogHeader>

                <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-foreground/70" />
                        <p>
                            {translation?.how_to_use_step1?.translation ??
                                "Enter a keyword and search to load trending or relevant videos."}
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-foreground/70" />
                        <p>
                            {translation?.how_to_use_step2?.translation ??
                                "Switch between Homepage, Suggested, and Mobile views to see how thumbnails look in different contexts."}
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-foreground/70" />
                        <p>
                            {translation?.how_to_use_step3?.translation ??
                                "Use this page to evaluate clickability and clarity before publishing your video."}
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-foreground/70" />
                        <p>
                            {translation?.how_to_use_step4?.translation ??
                                "Combine with AI Analysis to refine title–thumbnail synergy."}
                        </p>
                    </div>

                    <div className="mt-2 rounded-md border border-border bg-muted/40 p-3 text-xs">
                        {translation?.how_to_use_tip?.translation ??
                            "Tip: Try short keywords vs. long-tail queries to see different competitor sets."}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}