import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookmarkPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SaveToLibraryButton({ 
  item, 
  itemType, // 'entity', 'page', 'feature'
  onSave,
  isSaving 
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    onSave({
      ...item,
      custom_project_id: null,
      is_custom: false,
      is_global: true
    });
    setShowConfirm(false);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setShowConfirm(true)}
        title="Save to default library"
      >
        <BookmarkPlus className="h-4 w-4" />
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to Default Library</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-charcoal)]">
              This will copy "{item?.name}" to the default library, making it available globally.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save to Library
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}