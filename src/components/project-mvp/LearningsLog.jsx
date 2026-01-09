import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Lightbulb, TrendingUp } from "lucide-react";

export default function LearningsLog({ projectId }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newLearning, setNewLearning] = useState({
    title: '',
    description: '',
    category: 'technical_best_practice',
    impact: 'medium'
  });

  const queryClient = useQueryClient();

  const { data: learnings = [] } = useQuery({
    queryKey: ['learnings', projectId],
    queryFn: () => base44.entities.Learning.filter({ project_id: projectId }),
  });

  const createLearning = useMutation({
    mutationFn: (learningData) => base44.entities.Learning.create({ ...learningData, project_id: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['learnings', projectId]);
      setShowCreateDialog(false);
      setNewLearning({ title: '', description: '', category: 'technical_best_practice', impact: 'medium' });
    },
  });

  const handleCreateLearning = () => {
    if (newLearning.title && newLearning.description) {
      createLearning.mutate(newLearning);
    }
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Learnings & Insights</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[var(--color-primary)] text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Learning
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Capture Learning</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Learning title"
                value={newLearning.title}
                onChange={(e) => setNewLearning({ ...newLearning, title: e.target.value })}
              />
              <Textarea
                placeholder="Detailed insight or learning"
                value={newLearning.description}
                onChange={(e) => setNewLearning({ ...newLearning, description: e.target.value })}
                rows={4}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Category</label>
                  <select
                    value={newLearning.category}
                    onChange={(e) => setNewLearning({ ...newLearning, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="technical_best_practice">Technical Best Practice</option>
                    <option value="process_improvement">Process Improvement</option>
                    <option value="ui_ux_pattern">UI/UX Pattern</option>
                    <option value="ai_prompting">AI Prompting</option>
                    <option value="project_management">Project Management</option>
                    <option value="client_communication">Client Communication</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Impact</label>
                  <select
                    value={newLearning.impact}
                    onChange={(e) => setNewLearning({ ...newLearning, impact: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleCreateLearning} className="w-full" disabled={!newLearning.title || !newLearning.description}>
                Save Learning
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {learnings.map(learning => (
          <Card key={learning.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  {learning.title}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge className={getCategoryColor(learning.category)}>
                    {learning.category.replace('_', ' ')}
                  </Badge>
                  <Badge className={getImpactColor(learning.impact)}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {learning.impact}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
          </Card>
        ))}

        {learnings.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[var(--color-text-secondary)]">No learnings yet. Capture insights as you work on the project.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}