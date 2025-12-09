import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Command, CommandInput, CommandList, CommandItem, CommandGroup } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search } from "lucide-react";

export function PageSwitcher({ navItems = [] }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentSlug = location.pathname.split("/").filter(Boolean).pop() || "";
  
  const flatPages = [];
  navItems.forEach((item) => {
    if (item.item_type === "page" && item.page_url) {
      flatPages.push({
        label: item.name,
        value: item.page_url,
        section: null,
      });
    }
    if (item.children) {
      item.children.forEach((child) => {
        if (child.item_type === "page" && child.page_url) {
          flatPages.push({
            label: child.name,
            value: child.page_url,
            section: item.name,
          });
        }
      });
    }
  });

  const currentPage = flatPages.find((p) => p.value.includes(currentSlug));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-2 inline-flex items-center gap-2 min-w-[200px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span className="hidden md:inline truncate">
              {currentPage ? currentPage.label : "Go to page…"}
            </span>
          </div>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-72" align="start">
        <Command>
          <CommandInput placeholder="Search pages…" />
          <CommandList className="max-h-[400px]">
            {flatPages.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">No pages found</div>
            )}
            {flatPages.length > 0 && (
              <CommandGroup>
                {flatPages.map((page) => (
                  <CommandItem
                    key={page.value}
                    value={page.label}
                    onSelect={() => {
                      setOpen(false);
                      navigate(page.value);
                    }}
                  >
                    {page.section && (
                      <span className="text-xs text-muted-foreground mr-2">
                        {page.section} /
                      </span>
                    )}
                    {page.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}