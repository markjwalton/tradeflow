import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function SEOPanel({ formData, setFormData }) {
  const metaTitle = formData.meta_title || formData.title || '';
  const metaDescription = formData.meta_description || formData.description || '';
  
  const titleLength = metaTitle.length;
  const descriptionLength = metaDescription.length;
  
  const titleStatus = titleLength >= 50 && titleLength <= 60 ? 'optimal' :
                      titleLength > 60 ? 'too-long' : 'too-short';
  const descStatus = descriptionLength >= 150 && descriptionLength <= 160 ? 'optimal' :
                     descriptionLength > 160 ? 'too-long' : 'too-short';

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Settings</CardTitle>
        <CardDescription>
          Optimize your content for search engines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="meta_title">Meta Title</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {titleLength}/60
              </span>
              {titleStatus === 'optimal' ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Good
                </Badge>
              ) : (
                <Badge variant="warning" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {titleStatus === 'too-long' ? 'Too Long' : 'Too Short'}
                </Badge>
              )}
            </div>
          </div>
          <Input
            id="meta_title"
            value={formData.meta_title || ''}
            onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
            placeholder={formData.title || 'Enter meta title...'}
            maxLength={70}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Recommended: 50-60 characters
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {descriptionLength}/160
              </span>
              {descStatus === 'optimal' ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Good
                </Badge>
              ) : (
                <Badge variant="warning" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {descStatus === 'too-long' ? 'Too Long' : 'Too Short'}
                </Badge>
              )}
            </div>
          </div>
          <Textarea
            id="meta_description"
            value={formData.meta_description || ''}
            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
            placeholder={formData.description || 'Enter meta description...'}
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Recommended: 150-160 characters
          </p>
        </div>

        <div>
          <Label htmlFor="slug">URL Slug</Label>
          <Input
            id="slug"
            value={formData.slug || ''}
            onChange={(e) => {
              const slug = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
              setFormData({ ...formData, slug });
            }}
            placeholder="url-friendly-slug"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Auto-generated from title if left empty
          </p>
        </div>

        <div>
          <Label htmlFor="featured_image">Featured Image URL</Label>
          <Input
            id="featured_image"
            value={formData.featured_image || ''}
            onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Used for social media previews and SEO
          </p>
        </div>
      </CardContent>
    </Card>
  );
}