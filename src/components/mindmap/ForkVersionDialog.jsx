import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, GitFork } from "lucide-react";

export default function ForkVersionDialog({
  open,
  onOpenChange,
  currentMindMap,
  onFork,
  isPending,
}) {
  const [changeNotes, setChangeNotes] = useState("");
  const nextVersion = (currentMindMap?.version || 1) + 1;

  const handleFork = () => {
    onFork({
      changeNotes,
      newVersion: nextVersion,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitFork className="h-5 w-5" />
            Fork New Version
          </DialogTitle>
          <DialogDescription>
            Create a new version of "{currentMindMap?.name}" to continue development.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Current</p>
              <p className="text-xl font-bold">v{currentMindMap?.version || 1}</p>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">New</p>
              <p className="text-xl font-bold text-info">v{nextVersion}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Change Notes</label>
            <Textarea
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              placeholder="Describe what you plan to change in this version..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              These notes help track the evolution of your architecture.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleFork}
              disabled={isPending}
            >
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create v{nextVersion}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}