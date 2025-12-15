import { Button } from "@/components/ui/button";
import { Sparkles, HelpCircle, Keyboard } from "lucide-react";

export function AppFooter({ tenant }) {
  return (
    <footer className="border-t bg-background/80 backdrop-blur-sm text-xs">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2 md:px-6">
        {tenant && (
          <span className="text-muted-foreground">
            Client: <span className="truncate max-w-[120px] sm:max-w-none inline-block align-bottom">{tenant.name}</span>
          </span>
        )}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="AI Assistant">
            <Sparkles className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Help">
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Keyboard Shortcuts">
            <Keyboard className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </footer>
  );
}