import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Lock, AlertTriangle } from "lucide-react";

export default function PublishVersionDialog({
  open,
  onOpenChange,
  currentMindMap,
  onPublish,
  isPending,
}) {
  const [changeNotes, setChangeNotes] = useState(currentMindMap?.change_notes || "");

  const handlePublish = () => {
    onPublish({ changeNotes });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Publish Version
          </DialogTitle>
          <DialogDescription>
            Lock v{currentMindMap?.version || 1} as a published release.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
            <p className="text-sm text-warning">
              Once published, this version cannot be edited. You'll need to fork a new version to make changes.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Release Notes</label>
            <Textarea
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              placeholder="Summarize what's included in this release..."
              rows={4}
            />
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
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
              onClick={handlePublish}
              disabled={isPending}
            >
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Publish v{currentMindMap?.version || 1}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}