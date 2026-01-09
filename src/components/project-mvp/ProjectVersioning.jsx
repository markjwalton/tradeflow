import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Layers, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function ProjectVersioning({ projectId }) {
  const [openVersions, setOpenVersions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['projectVersions', projectId],
    queryFn: () => base44.entities.ProjectVersion.filter({ project_id: projectId }),
    initialData: []
  });

  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.snapshot_date || b.created_date) - new Date(a.snapshot_date || a.created_date)
  );

  const totalPages = Math.ceil(sortedVersions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVersions = sortedVersions.slice(startIndex, startIndex + itemsPerPage);

  const toggleVersion = (versionId) => {
    setOpenVersions(prev => ({
      ...prev,
      [versionId]: !prev[versionId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {isLoading ? (
          <p>Loading versions...</p>
        ) : sortedVersions.length === 0 ? (
          <p className="text-muted-foreground">No versions yet. Create your first version to track project evolution.</p>
        ) : (
          <>
            {paginatedVersions.map((version) => (
              <Collapsible 
                key={version.id}
                open={openVersions[version.id]}
                onOpenChange={() => toggleVersion(version.id)}
              >
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-[var(--color-muted)] transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="card-heading-default flex items-center gap-3">
                          <Layers className="h-5 w-5 text-[var(--color-primary)]" />
                          Version {version.version_number}
                          <Badge className={
                            version.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }>
                            {version.status}
                          </Badge>
                        </CardTitle>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(version.snapshot_date || version.created_date), 'dd/MM/yyyy')}
                          </div>
                          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openVersions[version.id] ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground mb-4">{version.description}</p>
                      {version.key_changes && version.key_changes.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Key Changes:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {version.key_changes.map((change, idx) => (
                              <li key={idx}>{change}</li>
                            ))}
                          </ul>
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
    </div>
  );
}