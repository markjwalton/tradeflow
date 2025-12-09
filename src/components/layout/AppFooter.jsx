import { Button } from "@/components/ui/button";
import { Sparkles, HelpCircle, Keyboard } from "lucide-react";

export function AppFooter({ tenant }) {
  return (
    <footer className="border-t bg-background/80 backdrop-blur-sm text-xs">
      <div className="flex items-center justify-between px-4 py-2 md:px-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          {tenant && <span>Client: {tenant.name}</span>}
          <span className="hidden sm:inline">• Env: Production</span>
          <span className="hidden md:inline">• v2.1.0</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-muted-foreground">
          <span>Last sync: 3 min ago</span>
          <span>•</span>
          <span>AI suggestions enabled</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <HelpCircle className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
          >
            <Keyboard className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Sparkles className="w-4 h-4 mr-1" />
            Trade-Flow AI
          </Button>
        </div>
      </div>
    </footer>
  );
}