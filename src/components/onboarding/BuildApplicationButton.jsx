import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Rocket, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function BuildApplicationButton({ sessionId }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState({
    buildEntities: true,
    buildPages: true,
    buildFeatures: false,
    buildIntegrations: false
  });
  const [buildResult, setBuildResult] = useState(null);

  const buildMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await base44.functions.invoke('buildApplication', {
          sessionId,
          ...options
        });
        return response.data;
      } catch (error) {
        console.error("Build error:", error);
        throw new Error(error?.response?.data?.details || error?.message || "Build failed");
      }
    },
    onSuccess: (data) => {
      setBuildResult(data);
      if (data.success) {
        toast.success(`Build ${data.buildNumber}: ${data.summary.entities} entities, ${data.summary.pages} pages`);
      }
    },
    onError: (error) => {
      const errorMsg = error.message || "Unknown error";
      toast.error("Build failed: " + errorMsg);
      setBuildResult({ success: false, error: errorMsg });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Rocket className="mr-2 h-4 w-4" />
          Build Application
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Build Application</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select what to build from the generated architecture specifications.
          </p>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="entities"
                checked={options.buildEntities}
                onCheckedChange={(checked) => setOptions({ ...options, buildEntities: checked })}
              />
              <Label htmlFor="entities" className="cursor-pointer">
                <span className="font-medium">Entities</span>
                <p className="text-xs text-muted-foreground">Generate database schemas</p>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="pages"
                checked={options.buildPages}
                onCheckedChange={(checked) => setOptions({ ...options, buildPages: checked })}
              />
              <Label htmlFor="pages" className="cursor-pointer">
                <span className="font-medium">Pages</span>
                <p className="text-xs text-muted-foreground">Generate React page components</p>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="features"
                checked={options.buildFeatures}
                onCheckedChange={(checked) => setOptions({ ...options, buildFeatures: checked })}
              />
              <Label htmlFor="features" className="cursor-pointer">
                <span className="font-medium">Features</span>
                <p className="text-xs text-muted-foreground">Generate implementation documentation</p>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="integrations"
                checked={options.buildIntegrations}
                onCheckedChange={(checked) => setOptions({ ...options, buildIntegrations: checked })}
              />
              <Label htmlFor="integrations" className="cursor-pointer">
                <span className="font-medium">Integrations</span>
                <p className="text-xs text-muted-foreground">Generate backend functions</p>
              </Label>
            </div>
          </div>

          {buildResult && (
            <div className={`p-4 rounded-lg ${buildResult.success ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"}`}>
              <div className="flex items-start gap-3">
                {buildResult.success ? (
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                )}
                <div className="flex-1 space-y-2">
                  <p className="font-medium">{buildResult.message}</p>
                  {buildResult.buildNumber && (
                    <p className="text-sm font-medium mb-2">Build: {buildResult.buildNumber}</p>
                  )}
                  {buildResult.summary && (
                    <div className="text-sm space-y-1">
                      <p>✓ Entities: {buildResult.summary.entities}</p>
                      <p>✓ Pages: {buildResult.summary.pages}</p>
                      <p>✓ Features: {buildResult.summary.features}</p>
                      <p>✓ Integrations: {buildResult.summary.integrations}</p>
                      {buildResult.summary.errors > 0 && (
                        <p className="text-destructive">⚠ Errors: {buildResult.summary.errors}</p>
                      )}
                    </div>
                  )}
                  {buildResult.error && !buildResult.summary && (
                    <p className="text-sm text-destructive">{buildResult.error}</p>
                  )}
                  {buildResult.results?.errors && buildResult.results.errors.length > 0 && (
                    <div className="text-xs space-y-1 mt-2">
                      <p className="font-medium">Errors:</p>
                      {buildResult.results.errors.map((err, idx) => (
                        <p key={idx} className="text-destructive">• {err.type}: {err.name} - {err.error}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => buildMutation.mutate()}
              disabled={buildMutation.isPending}
            >
              {buildMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Building...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Start Build
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}