import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, FileText, Search } from "lucide-react";

export default function TechnicalSpecsEditor({ projectId }) {
  const [showEditor, setShowEditor] = useState(false);
  const [editingSpec, setEditingSpec] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const queryClient = useQueryClient();

  const { data: specs = [] } = useQuery({
    queryKey: ['specs', projectId],
    queryFn: () => base44.entities.TechnicalSpecification.filter({ project_id: projectId }),
  });

  const createOrUpdateSpec = useMutation({
    mutationFn: async (specData) => {
      if (editingSpec?.id) {
        return base44.entities.TechnicalSpecification.update(editingSpec.id, specData);
      }
      return base44.entities.TechnicalSpecification.create({ ...specData, project_id: projectId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['specs', projectId]);
      setShowEditor(false);
      setEditingSpec(null);
    },
  });

  const handleSave = () => {
    if (editingSpec?.name && editingSpec?.content) {
      createOrUpdateSpec.mutate(editingSpec);
    }
  };

  const filteredSpecs = specs.filter(spec => {
    const matchesSearch = spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spec.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || spec.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    const colors = {
      entity_schema: 'bg-blue-100 text-blue-800',
      api_endpoint: 'bg-purple-100 text-purple-800',
      component_spec: 'bg-green-100 text-green-800',
      workflow: 'bg-orange-100 text-orange-800',
      data_model: 'bg-indigo-100 text-indigo-800',
      ui_pattern: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search specifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Categories</option>
            <option value="entity_schema">Entity Schema</option>
            <option value="api_endpoint">API Endpoint</option>
            <option value="component_spec">Component Spec</option>
            <option value="workflow">Workflow</option>
            <option value="data_model">Data Model</option>
            <option value="ui_pattern">UI Pattern</option>
          </select>
          <Button 
            className="bg-[var(--color-primary)] text-white"
            onClick={() => {
              setEditingSpec({ name: '', content: '', category: 'entity_schema', status: 'draft' });
              setShowEditor(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Spec
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredSpecs.map(spec => (
          <Card key={spec.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => { setEditingSpec(spec); setShowEditor(true); }}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="card-heading-default flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[var(--color-primary)]" />
                  {spec.name}
                </CardTitle>
                <Badge className={getCategoryColor(spec.category)}>{spec.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">{spec.content}</p>
              {spec.version && (
                <p className="text-xs text-[var(--color-text-muted)] mt-2">Version: {spec.version}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSpecs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)]">
              {searchTerm || filterCategory !== 'all'
                ? 'No specifications match your filters'
                : 'No specifications yet. Create your first spec to document technical details.'}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSpec?.id ? 'Edit' : 'New'} Technical Specification</DialogTitle>
          </DialogHeader>
          {editingSpec && (
            <div className="space-y-4">
              <Input
                placeholder="Specification name"
                value={editingSpec.name}
                onChange={(e) => setEditingSpec({ ...editingSpec, name: e.target.value })}
              />
              <select
                value={editingSpec.category}
                onChange={(e) => setEditingSpec({ ...editingSpec, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="entity_schema">Entity Schema</option>
                <option value="api_endpoint">API Endpoint</option>
                <option value="component_spec">Component Spec</option>
                <option value="workflow">Workflow</option>
                <option value="data_model">Data Model</option>
                <option value="ui_pattern">UI Pattern</option>
                <option value="other">Other</option>
              </select>
              <Textarea
                placeholder="Specification content (supports Markdown)"
                value={editingSpec.content}
                onChange={(e) => setEditingSpec({ ...editingSpec, content: e.target.value })}
                rows={12}
                className="font-mono text-sm"
              />
              <Input
                placeholder="Version (optional)"
                value={editingSpec.version || ''}
                onChange={(e) => setEditingSpec({ ...editingSpec, version: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1" disabled={!editingSpec.name || !editingSpec.content}>
                  Save Specification
                </Button>
                <Button variant="outline" onClick={() => setShowEditor(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}