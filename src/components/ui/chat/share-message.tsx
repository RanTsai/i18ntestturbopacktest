// components/ui/chat/share-message.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  messageToShare: string;
}

export default function ShareMessage({ open, setOpen, messageToShare }: Props) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this message</DialogTitle>
        </DialogHeader>
        <Textarea
          value={messageToShare}
          readOnly
          className="h-40 resize-none"
        />
        <DialogFooter className="flex justify-end">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(messageToShare);
              setOpen(false);
            }}
          >
            Copy & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
