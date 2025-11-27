import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, ArrowRight, Link2 } from "lucide-react";

export default function EntityRelationshipDiagram({
  open,
  onOpenChange,
  nodes,
  connections,
}) {
  // Extract entity nodes and their schemas
  const entities = useMemo(() => {
    return nodes
      .filter(n => n.node_type === "entity")
      .map(node => {
        let schema = null;
        let relationships = [];
        
        try {
          if (node.entity_schema) {
            schema = typeof node.entity_schema === "string" 
              ? JSON.parse(node.entity_schema) 
              : node.entity_schema;
          }
          if (node.entity_relationships) {
            relationships = typeof node.entity_relationships === "string"
              ? JSON.parse(node.entity_relationships)
              : node.entity_relationships;
          }
        } catch (e) {}
        
        return {
          id: node.id,
          name: node.text,
          schema,
          relationships,
          color: node.color || "#3b82f6",
        };
      });
  }, [nodes]);

  // Build relationship map
  const relationshipLinks = useMemo(() => {
    const links = [];
    
    entities.forEach(entity => {
      if (entity.schema?.properties) {
        Object.entries(entity.schema.properties).forEach(([fieldName, config]) => {
          if (config.description?.includes("Reference to")) {
            const match = config.description.match(/Reference to (\w+)/);
            if (match) {
              const targetEntity = entities.find(e => e.name === match[1]);
              if (targetEntity) {
                links.push({
                  source: entity.name,
                  target: match[1],
                  field: fieldName,
                  type: "many-to-one",
                });
              }
            }
          }
        });
      }
      
      // Also check explicit relationships
      entity.relationships?.forEach(rel => {
        if (!links.find(l => l.source === entity.name && l.field === rel.field)) {
          links.push({
            source: entity.name,
            target: rel.targetEntity,
            field: rel.field,
            type: rel.type || "many-to-one",
          });
        }
      });
    });
    
    return links;
  }, [entities]);

  const getFieldsList = (schema) => {
    if (!schema?.properties) return [];
    return Object.entries(schema.properties).slice(0, 8).map(([name, config]) => ({
      name,
      type: config.format || config.type,
      isRelationship: config.description?.includes("Reference to"),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Entity Relationship Diagram
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[600px]">
          <div className="p-4">
            {entities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No entities defined yet.</p>
                <p className="text-sm">Mark nodes as "Entity" type to see them here.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Entity Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {entities.map(entity => (
                    <div
                      key={entity.id}
                      className="border rounded-lg overflow-hidden"
                      style={{ borderColor: entity.color }}
                    >
                      {/* Header */}
                      <div
                        className="px-3 py-2 text-white font-medium flex items-center gap-2"
                        style={{ backgroundColor: entity.color }}
                      >
                        <Database className="h-4 w-4" />
                        {entity.name}
                      </div>
                      
                      {/* Fields */}
                      <div className="p-2 bg-white">
                        {entity.schema?.properties ? (
                          <div className="space-y-1">
                            {getFieldsList(entity.schema).map(field => (
                              <div
                                key={field.name}
                                className="flex items-center justify-between text-xs px-2 py-1 rounded bg-gray-50"
                              >
                                <span className="flex items-center gap-1">
                                  {field.isRelationship && <Link2 className="h-3 w-3 text-blue-500" />}
                                  {field.name}
                                </span>
                                <Badge variant="outline" className="text-xs h-5">
                                  {field.type}
                                </Badge>
                              </div>
                            ))}
                            {Object.keys(entity.schema.properties).length > 8 && (
                              <p className="text-xs text-gray-400 text-center">
                                +{Object.keys(entity.schema.properties).length - 8} more fields
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 text-center py-2">
                            No schema defined
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Relationships */}
                {relationshipLinks.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      Relationships
                    </h3>
                    <div className="space-y-2">
                      {relationshipLinks.map((link, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <Badge style={{ backgroundColor: entities.find(e => e.name === link.source)?.color }}>
                            {link.source}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <span className="font-mono text-xs">.{link.field}</span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <Badge style={{ backgroundColor: entities.find(e => e.name === link.target)?.color }}>
                            {link.target}
                          </Badge>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {link.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary Stats */}
                <div className="flex gap-4 text-sm text-gray-500 pt-4 border-t">
                  <span>{entities.length} entities</span>
                  <span>{relationshipLinks.length} relationships</span>
                  <span>
                    {entities.reduce((sum, e) => sum + (Object.keys(e.schema?.properties || {}).length), 0)} total fields
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}