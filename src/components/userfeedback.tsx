"use client";
import React from 'react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from './ui/button';;
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslations } from 'next-intl';
import userGlobalStore, { IUserGlobalStore } from '@/lib/global-store/users-store';
import toast from 'react-hot-toast';
import { insertUserFeedback } from "@/actions/supabase/supabaseUserFeedback";


function Userfeedback() {
    const t = useTranslations();
    const { theUser } = userGlobalStore() as IUserGlobalStore;

    const [subject, setSubject] = React.useState("");
    const [feedback, setFeedback] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const handleSubmit = async () => {
        if (!subject.trim() || !feedback.trim()) {
            toast.error(t("feedbackForm.completeMessage"));
            return;
        }

        setLoading(true);
        try {
            const { success, data } = await insertUserFeedback(
                subject,
                theUser!.language,
                5,
                feedback,
                "", //AI analysis
                "",
                theUser!.supabase_user_id, 5)

            if (!success) {
                toast.error("Submit feedback failed");
                return;
            }

            
            toast.success("Thank you for your valuable feedback!");
            console.log("User feedback success: ", data);
            setSubject("");
            setFeedback("");
            setOpen(false);
        } catch (error: any) {
            toast.error(`Error sending feedback: ${error.message}`)
            
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>

                <DialogTrigger asChild>
                    <Button variant="outline">{t("feedbackForm.openfeedback")}</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("feedbackForm.feedbacktitle")}</DialogTitle>
                        <DialogDescription>
                            {t("feedbackForm.usermessage")}
                        </DialogDescription>
                        <Label htmlFor="title" className="text-right">
                            {t("feedbackForm.subject")}
                        </Label>
                        <Input id="title" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="I'd like to suggest" className="col-span-3" />
                        <Label htmlFor="feedback" className="text-right">
                            {t("feedbackForm.subject")}
                        </Label>
                        <Textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="If ... would be more useful for me" className="col-span-3" />

                    </DialogHeader>
                    <DialogFooter>
                        <Button type="submit" variant="outline" disabled={loading} onClick={handleSubmit}>
                            {loading ? "Sending..." : t("feedbackForm.confirm")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Userfeedback