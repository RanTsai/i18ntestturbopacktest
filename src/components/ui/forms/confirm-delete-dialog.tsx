"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ConfirmDeleteDialog({
  id, onConfirm, onClose
}: {
  id: string | null;
  onConfirm: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!id} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure to delete？</DialogTitle>
          <DialogDescription className="text-destructive">⚠️ This cannot be undone</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => { if (id) onConfirm(id); onClose(); }}>
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
