import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, FileText } from "lucide-react";
import { AccordionContainer } from "@/components/common/AccordionContainer";

export default function TechnicalSpecsEditor({ projectId }) {
  const [openSpecs, setOpenSpecs] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: specs = [], isLoading } = useQuery({
    queryKey: ['technicalSpecs', projectId],
    queryFn: () => base44.entities.TechnicalSpecification.filter({ project_id: projectId }),
    initialData: []
  });

  const sortedSpecs = [...specs].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );

  const totalPages = Math.ceil(sortedSpecs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSpecs = sortedSpecs.slice(startIndex, startIndex + itemsPerPage);

  const toggleSpec = (specId) => {
    setOpenSpecs(prev => ({
      ...prev,
      [specId]: !prev[specId]
    }));
  };

  const getCategoryColor = (category) => {
    const colors = {
      entity_schema: 'bg-blue-100 text-blue-800',
      api_endpoint: 'bg-green-100 text-green-800',
      component_spec: 'bg-purple-100 text-purple-800',
      workflow: 'bg-orange-100 text-orange-800',
      data_model: 'bg-pink-100 text-pink-800',
      ui_pattern: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  return (
    <AccordionContainer title="Technical Specifications" defaultCollapsed={true}>
      <div className="space-y-4">
        {isLoading ? (
          <p>Loading specifications...</p>
        ) : sortedSpecs.length === 0 ? (
          <p className="text-muted-foreground">No specifications yet. Create your first technical specification.</p>
        ) : (
          <>
            {paginatedSpecs.map((spec) => (
              <Collapsible 
                key={spec.id}
                open={openSpecs[spec.id]}
                onOpenChange={() => toggleSpec(spec.id)}
              >
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <div className="cursor-pointer hover:bg-[var(--color-muted)] transition-colors p-6">
                      <div className="flex items-start justify-between">
                        <div className="card-heading-default flex items-center gap-3">
                          <FileText className="h-5 w-5 text-[var(--color-primary)]" />
                          {spec.name}
                          <Badge className={getCategoryColor(spec.category)}>
                            {spec.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openSpecs[spec.id] ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-[var(--color-text-primary)]">{spec.content}</div>
                      </div>
                      {spec.version && (
                        <p className="text-xs text-muted-foreground mt-4">Version: {spec.version}</p>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AccordionContainer>
  );
}