import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Import showcase components
import TypographyShowcase from "../pages/TypographyShowcase";
import ButtonsShowcase from "../pages/ButtonsShowcase";
import CardsShowcase from "../pages/CardsShowcase";
import FormsShowcase from "../pages/FormsShowcase";
import LayoutShowcase from "../pages/LayoutShowcase";
import NavigationShowcase from "../pages/NavigationShowcase";
import DataDisplayShowcase from "../pages/DataDisplayShowcase";
import FeedbackShowcase from "../pages/FeedbackShowcase";
import CompactButtonShowcase from "../pages/CompactButtonShowcase";
import { PageHeader } from "@/components/sturij";

export default function UILibrary() {
  const [openSections, setOpenSections] = useState(["typography"]);

  const sections = [
    {
      id: "typography",
      title: "Typography",
      description: "Text styles and typographic components using design tokens",
      component: TypographyShowcase,
    },
    {
      id: "buttons",
      title: "Buttons",
      description: "Button variants and interactive elements",
      component: ButtonsShowcase,
    },
    {
      id: "compact-buttons",
      title: "Compact Buttons",
      description: "Ultra-small buttons for dense UI controls",
      component: CompactButtonShowcase,
    },
    {
      id: "cards",
      title: "Cards",
      description: "Card components for content containers",
      component: CardsShowcase,
    },
    {
      id: "forms",
      title: "Forms",
      description: "Form inputs and validation components",
      component: FormsShowcase,
    },
    {
      id: "layouts",
      title: "Layouts",
      description: "Layout patterns and containers",
      component: LayoutShowcase,
    },
    {
      id: "navigation",
      title: "Navigation",
      description: "Navigation components and patterns",
      component: NavigationShowcase,
    },
    {
      id: "data",
      title: "Data Display",
      description: "Tables, lists, and data visualization",
      component: DataDisplayShowcase,
    },
    {
      id: "feedback",
      title: "Feedback",
      description: "Alerts, toasts, and loading states",
      component: FeedbackShowcase,
    },
  ];

  const toggleSection = (id) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title="UI Library"
        description="Browse and explore reusable UI components built with design tokens"
      />

      <Card className="border-border">
        <CardContent className="p-4">
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
              <Card className="border-border overflow-hidden">
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
        </CardContent>
      </Card>
    </div>
  );
}