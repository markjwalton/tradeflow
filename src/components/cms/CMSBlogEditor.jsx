import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CMSBlogEditor({ post, tenantId, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    featured_image: post?.featured_image || "",
    author_name: post?.author_name || "",
    author_email: post?.author_email || "",
    status: post?.status || "draft",
    categories: post?.categories?.join(", ") || "",
    tags: post?.tags?.join(", ") || "",
    meta_title: post?.meta_title || "",
    meta_description: post?.meta_description || "",
    allow_comments: post?.allow_comments !== false
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        categories: data.categories.split(",").map(s => s.trim()).filter(Boolean),
        tags: data.tags.split(",").map(s => s.trim()).filter(Boolean),
        publish_date: data.status === "published" && !post?.publish_date 
          ? new Date().toISOString() 
          : post?.publish_date
      };
      if (post) {
        return base44.entities.CMSBlogPost.update(post.id, payload);
      } else {
        return base44.entities.CMSBlogPost.create({ ...payload, tenant_id: tenantId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsPosts"] });
      toast.success(post ? "Post updated" : "Post created");
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      toast.error("Title and slug are required");
      return;
    }
    mutation.mutate(formData);
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData({ ...formData, slug });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? "Edit Blog Post" : "New Blog Post"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onBlur={() => !formData.slug && generateSlug()}
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Excerpt</Label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              placeholder="Short summary..."
            />
          </div>

          <div>
            <Label>Content</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              placeholder="Blog post content..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Author Name</Label>
              <Input
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Author Email</Label>
              <Input
                type="email"
                value={formData.author_email}
                onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Featured Image URL</Label>
              <Input
                value={formData.featured_image}
                onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Categories (comma-separated)</Label>
              <Input
                value={formData.categories}
                onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
              />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Meta Title</Label>
              <Input
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              />
            </div>
            <div>
              <Label>Meta Description</Label>
              <Input
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.allow_comments}
              onCheckedChange={(v) => setFormData({ ...formData, allow_comments: v })}
            />
            <Label>Allow Comments</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
              {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {post ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}