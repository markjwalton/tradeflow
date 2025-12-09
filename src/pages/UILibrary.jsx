import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Import showcase components
import { Typography } from "@/components/library/Typography";
import { Buttons } from "@/components/library/Buttons";
import { Cards } from "@/components/library/Cards";
import { Forms } from "@/components/library/Forms";
import { Layouts } from "@/components/library/Layouts";
import { Navigation } from "@/components/library/Navigation";
import { DataDisplay } from "@/components/library/DataDisplay";
import { Feedback } from "@/components/library/Feedback";

export default function UILibrary() {
  const [openSections, setOpenSections] = useState(["typography"]);

  const sections = [
    {
      id: "typography",
      title: "Typography",
      description: "Text styles and typographic components using design tokens",
      component: Typography,
    },
    {
      id: "buttons",
      title: "Buttons",
      description: "Button variants and interactive elements",
      component: Buttons,
    },
    {
      id: "cards",
      title: "Cards",
      description: "Card components for content containers",
      component: Cards,
    },
    {
      id: "forms",
      title: "Forms",
      description: "Form inputs and validation components",
      component: Forms,
    },
    {
      id: "layouts",
      title: "Layouts",
      description: "Layout patterns and containers",
      component: Layouts,
    },
    {
      id: "navigation",
      title: "Navigation",
      description: "Navigation components and patterns",
      component: Navigation,
    },
    {
      id: "data",
      title: "Data Display",
      description: "Tables, lists, and data visualization",
      component: DataDisplay,
    },
    {
      id: "feedback",
      title: "Feedback",
      description: "Alerts, toasts, and loading states",
      component: Feedback,
    },
  ];

  const toggleSection = (id) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display">UI Library</h1>
        <p className="text-body-color mt-2">
          Browse and explore reusable UI components built with design tokens
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const Component = section.component;
          const isOpen = openSections.includes(section.id);

          return (
            <Collapsible
              key={section.id}
              open={isOpen}
              onOpenChange={() => toggleSection(section.id)}
            >
              <Card className="overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex-1 text-left">
                      <CardTitle>{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                    />
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <Component />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}