import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Lightbulb, TrendingUp } from "lucide-react";
import { AccordionContainer } from "@/components/common/AccordionContainer";

export default function LearningsLog({ projectId }) {
  const [openLearnings, setOpenLearnings] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: learnings = [], isLoading } = useQuery({
    queryKey: ['learnings', projectId],
    queryFn: () => base44.entities.Learning.filter({ project_id: projectId }),
    initialData: []
  });

  const sortedLearnings = [...learnings].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );

  const totalPages = Math.ceil(sortedLearnings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLearnings = sortedLearnings.slice(startIndex, startIndex + itemsPerPage);

  const toggleLearning = (learningId) => {
    setOpenLearnings(prev => ({
      ...prev,
      [learningId]: !prev[learningId]
    }));
  };

  const getCategoryColor = (category) => {
    const colors = {
      process_improvement: 'bg-blue-100 text-blue-800',
      technical_best_practice: 'bg-green-100 text-green-800',
      ui_ux_pattern: 'bg-purple-100 text-purple-800',
      ai_prompting: 'bg-pink-100 text-pink-800',
      project_management: 'bg-orange-100 text-orange-800',
      client_communication: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const getImpactColor = (impact) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[impact] || colors.medium;
  };

  return (
    <AccordionContainer title="Learnings & Insights" defaultCollapsed={true}>
      <div className="space-y-4">
        {isLoading ? (
          <p>Loading learnings...</p>
        ) : sortedLearnings.length === 0 ? (
          <p className="text-muted-foreground">No learnings yet. Capture insights as you work on the project.</p>
        ) : (
          <>
            {paginatedLearnings.map((learning) => (
              <Collapsible 
                key={learning.id}
                open={openLearnings[learning.id]}
                onOpenChange={() => toggleLearning(learning.id)}
              >
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <div className="cursor-pointer hover:bg-[var(--color-muted)] transition-colors p-6">
                      <div className="flex items-start justify-between">
                        <div className="card-heading-default flex items-center gap-3">
                          <Lightbulb className="h-5 w-5 text-amber-500" />
                          {learning.title}
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getCategoryColor(learning.category)}>
                            {learning.category.replace('_', ' ')}
                          </Badge>
                          <Badge className={getImpactColor(learning.impact)}>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {learning.impact}
                          </Badge>
                          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openLearnings[learning.id] ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <p className="text-[var(--color-text-primary)] whitespace-pre-wrap">{learning.description}</p>
                      {learning.applicable_to && learning.applicable_to.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          <span className="text-sm text-[var(--color-text-secondary)]">Applies to:</span>
                          {learning.applicable_to.map((area, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{area}</Badge>
                          ))}
                        </div>
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