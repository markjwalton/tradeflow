import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from "lucide-react";

export default function DiscussionFeed({ projectId }) {
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');

  const queryClient = useQueryClient();

  const { data: discussions = [] } = useQuery({
    queryKey: ['discussions', projectId],
    queryFn: () => base44.entities.Discussion.filter({ project_id: projectId }),
  });

  const createDiscussion = useMutation({
    mutationFn: (discussionData) => base44.entities.Discussion.create({
      ...discussionData,
      project_id: projectId,
      timestamp: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions', projectId]);
      setNewComment('');
    },
  });

  const handleSubmit = () => {
    if (newComment.trim()) {
      createDiscussion.mutate({
        content: newComment,
        user_name: userName || 'Anonymous',
        related_entity_type: 'general'
      });
    }
  };

  const sortedDiscussions = [...discussions].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Add Discussion</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <Textarea
              placeholder="Share your thoughts, decisions, or questions..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button onClick={handleSubmit} disabled={!newComment.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Post Discussion
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sortedDiscussions.map(discussion => (
          <Card key={discussion.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[var(--color-muted)] rounded-full">
                  <MessageSquare className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {discussion.user_name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {new Date(discussion.timestamp).toLocaleString()}
                    </span>
                    {discussion.is_decision && (
                      <Badge className="bg-amber-100 text-amber-800">Decision</Badge>
                    )}
                  </div>
                  {discussion.title && (
                    <h4 className="font-medium text-[var(--color-text-primary)] mb-1">{discussion.title}</h4>
                  )}
                  <p className="text-[var(--color-text-primary)] whitespace-pre-wrap">{discussion.content}</p>
                  {discussion.related_entity_type !== 'general' && (
                    <Badge variant="outline" className="mt-2">{discussion.related_entity_type}</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedDiscussions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[var(--color-text-secondary)]">No discussions yet. Start the conversation!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}