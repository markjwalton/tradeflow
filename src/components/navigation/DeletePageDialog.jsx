import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, File, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DeletePageDialog({ 
  open, 
  onClose, 
  page, 
  relatedEntities = [],
  onConfirm 
}) {
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      setSelectedFiles(new Set([page?.slug].filter(Boolean)));
      setConfirmed(false);
    }
  }, [open, page]);

  const handleToggleFile = (file) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(file)) {
        next.delete(file);
      } else {
        next.add(file);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirm({
      page,
      selectedFiles: Array.from(selectedFiles),
    });
    onClose();
  };

  if (!page) return null;

  const allFiles = [
    { name: page.slug, type: "page", label: `Page: ${page.name}` },
    ...relatedEntities.map(e => ({ name: e, type: "entity", label: `Entity: ${e}` }))
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Delete Page & Related Files</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            This action is irreversible. Select files to delete.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Banner */}
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Warning: This will permanently delete selected files from your project.
            </p>
          </div>

          {/* Page Info */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <File className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">{page.name}</span>
              <Badge variant="outline" className="text-xs">/{page.slug}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              This page will be removed from navigation and optionally deleted from the filesystem.
            </p>
          </div>

          {/* Files Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Files to Delete:</Label>
            <div className="border rounded-lg divide-y">
              {allFiles.map((file) => (
                <div 
                  key={file.name}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`file-${file.name}`}
                    checked={selectedFiles.has(file.name)}
                    onCheckedChange={() => handleToggleFile(file.name)}
                  />
                  <Label 
                    htmlFor={`file-${file.name}`}
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                  >
                    {file.type === "entity" ? (
                      <Database className="h-4 w-4 text-blue-500" />
                    ) : (
                      <File className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm">{file.label}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
            <Checkbox
              id="confirm-delete"
              checked={confirmed}
              onCheckedChange={setConfirmed}
            />
            <Label 
              htmlFor="confirm-delete"
              className="text-sm cursor-pointer leading-relaxed"
            >
              I understand this action is <strong>not reversible</strong> and will permanently delete the selected files.
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={!confirmed || selectedFiles.size === 0}
          >
            Delete {selectedFiles.size} {selectedFiles.size === 1 ? 'File' : 'Files'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}