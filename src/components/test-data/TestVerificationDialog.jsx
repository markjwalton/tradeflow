import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, Loader2, Eye, FileCheck
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Helper: safely get nested or flat property
const get = (obj, key) => obj?.[key] ?? obj?.data?.[key];

export default function TestVerificationDialog({ 
  isOpen, 
  onClose, 
  item, 
  testData,
  onVerified 
}) {
  const [isMarking, setIsMarking] = useState(false);

  const markAsVerified = async () => {
    if (!testData) {
      toast.error("No test data found");
      return;
    }

    setIsMarking(true);
    try {
      await base44.entities.TestData.update(testData.id, {
        test_status: "verified"
      });
      toast.success(`${item?.name} marked as verified`);
      onVerified?.();
      onClose();
    } catch (e) {
      toast.error("Failed to update: " + e.message);
    } finally {
      setIsMarking(false);
    }
  };

  const entityData = get(testData, "entity_data") || {};
  const recordCount = Object.values(entityData).reduce(
    (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-purple-600" />
            Verify: {item?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium capitalize">{item?.type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Entities:</span>
              <span className="font-medium">{item?.entityCount || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Records:</span>
              <span className="font-medium">{recordCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium capitalize">{get(testData, "test_status") || "pending"}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <Link to={createPageUrl("LivePreview") + `?id=${item?.id}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </Link>
            
            <Button 
              onClick={markAsVerified} 
              disabled={isMarking}
              className="bg-green-600 hover:bg-green-700"
            >
              {isMarking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Mark Verified
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}