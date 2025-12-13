import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

export default function SchemaExportPanel({ open, onClose, schema }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const generateUISchema = () => {
    if (!schema?.properties) return null;

    const uiSchema = {
      type: "VerticalLayout",
      elements: Object.entries(schema.properties).map(([key, prop]) => ({
        type: "Control",
        scope: `#/properties/${key}`,
        label: key.charAt(0).toUpperCase() + key.slice(1),
      })),
    };

    return JSON.stringify(uiSchema, null, 2);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px]">
        <SheetHeader>
          <SheetTitle>Export Schema</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="entity" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entity">Entity Schema</TabsTrigger>
            <TabsTrigger value="ui">UI Schema</TabsTrigger>
          </TabsList>
          <TabsContent value="entity" className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(JSON.stringify(schema, null, 2))}
              >
                <Copy className="h-3.5 w-3.5 mr-2" />
                Copy
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-[500px]">
              {JSON.stringify(schema, null, 2)}
            </pre>
          </TabsContent>
          <TabsContent value="ui" className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(generateUISchema())}
              >
                <Copy className="h-3.5 w-3.5 mr-2" />
                Copy
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-[500px]">
              {generateUISchema()}
            </pre>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}