import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, ExternalLink, Check, Cloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/sturij';

export default function FontManager() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFont, setEditingFont] = useState(null);
  const [currentFonts, setCurrentFonts] = useState({ heading: null, body: null });
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    font_family: '',
    source: 'google',
    url: '',
    category: 'display',
    weights: [400],
    preview_text: 'The quick brown fox jumps over the lazy dog'
  });

  const { data: fonts = [], isLoading } = useQuery({
    queryKey: ['fonts'],
    queryFn: async () => {
      const allFonts = await base44.entities.FontFamily.list();
      
      // Load current fonts on first fetch
      try {
        const user = await base44.auth.me();
        if (user?.theme_fonts) {
          setCurrentFonts({
            heading: user.theme_fonts.heading || null,
            body: user.theme_fonts.body || null
          });
        } else {
          // Set defaults from globals.css
          setCurrentFonts({
            heading: { name: 'Degular Display', font_family: 'degular-display, sans-serif', source: 'adobe' },
            body: { name: 'Mrs Eaves XL Serif', font_family: 'mrs-eaves-xl-serif-narrow, serif', source: 'adobe' }
          });
          
          // Auto-create default fonts if they don't exist
          const hasDisplay = allFonts.some(f => f.name === 'Degular Display');
          const hasBody = allFonts.some(f => f.name === 'Mrs Eaves XL Serif');
          
          if (!hasDisplay) {
            await base44.entities.FontFamily.create({
              name: 'Degular Display',
              font_family: 'degular-display, sans-serif',
              source: 'adobe',
              category: 'display',
              weights: [300, 400, 500, 600, 700, 800],
              preview_text: 'The quick brown fox jumps over the lazy dog',
              is_active: true
            });
          }
          
          if (!hasBody) {
            await base44.entities.FontFamily.create({
              name: 'Mrs Eaves XL Serif',
              font_family: 'mrs-eaves-xl-serif-narrow, serif',
              source: 'adobe',
              category: 'body',
              weights: [400, 500, 600, 700],
              preview_text: 'The quick brown fox jumps over the lazy dog',
              is_active: true
            });
          }
          
          return base44.entities.FontFamily.list();
        }
      } catch (e) {
        console.error('Error loading current fonts:', e);
      }
      
      return allFonts;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FontFamily.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['fonts']);
      setDialogOpen(false);
      resetForm();
      toast.success('Font added successfully');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FontFamily.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['fonts']);
      setDialogOpen(false);
      resetForm();
      toast.success('Font updated successfully');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FontFamily.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['fonts']);
      toast.success('Font deleted successfully');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      font_family: '',
      source: 'google',
      url: '',
      category: 'display',
      weights: [400],
      preview_text: 'The quick brown fox jumps over the lazy dog'
    });
    setEditingFont(null);
  };

  const handleEdit = (font) => {
    setEditingFont(font);
    setFormData({
      name: font.name,
      font_family: font.font_family,
      source: font.source,
      url: font.url || '',
      category: font.category,
      weights: font.weights || [400],
      preview_text: font.preview_text || 'The quick brown fox jumps over the lazy dog'
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingFont) {
      updateMutation.mutate({ id: editingFont.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleActivate = async (font) => {
    try {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        theme_fonts: {
          ...(user.theme_fonts || {}),
          [font.category]: {
            name: font.name,
            font_family: font.font_family,
            source: font.source,
            url: font.url
          }
        }
      });
      toast.success(`${font.name} activated for ${font.category} text`);
      window.location.reload();
    } catch (e) {
      toast.error('Failed to activate font');
    }
  };

  const handleImportAdobeFonts = async () => {
    setIsImporting(true);
    try {
      const { data } = await base44.functions.invoke('getAdobeFonts');
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      let imported = 0;
      for (const font of data.fonts) {
        const existing = fonts.find(f => f.name === font.name && f.source === 'adobe');
        if (!existing) {
          await base44.entities.FontFamily.create(font);
          imported++;
        }
      }

      queryClient.invalidateQueries(['fonts']);
      toast.success(`Imported ${imported} fonts from Adobe Fonts`);
    } catch (error) {
      toast.error("Failed to import Adobe Fonts");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto -mt-6 pb-8">
      <PageHeader 
        title="Font Library"
        description="Manage your typography font families"
      />
      
      <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <div style={{ display: 'none' }}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Font
              </Button>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFont ? 'Edit Font' : 'Add New Font'}</DialogTitle>
              <DialogDescription>
                Add a new font family to your typography library
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Font Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Roboto"
                  />
                </div>
                <div>
                  <Label>CSS Font Family</Label>
                  <Input
                    value={formData.font_family}
                    onChange={(e) => setFormData({ ...formData, font_family: e.target.value })}
                    placeholder="e.g., 'Roboto', sans-serif"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Source</Label>
                  <Select value={formData.source} onValueChange={(val) => setFormData({ ...formData, source: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google Fonts</SelectItem>
                      <SelectItem value="adobe">Adobe Fonts</SelectItem>
                      <SelectItem value="system">System Font</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="display">Display / Headings</SelectItem>
                      <SelectItem value="body">Body Text</SelectItem>
                      <SelectItem value="mono">Monospace / Code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Font URL (optional)</Label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://fonts.googleapis.com/css2?family=..."
                />
              </div>
              <div>
                <Label>Preview Text</Label>
                <Input
                  value={formData.preview_text}
                  onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                />
              </div>
              <div className="p-4 border rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <p style={{ fontFamily: formData.font_family }} className="text-xl">
                  {formData.preview_text}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingFont ? 'Update' : 'Add'} Font
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      <Card className="border-border mb-4">
        <CardContent className="px-2 py-1">
          <div className="flex gap-2">
            <Button 
              variant="ghost"
              className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
              onClick={handleImportAdobeFonts}
              disabled={isImporting}
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Cloud className="h-4 w-4 mr-2" />
              )}
              Import from Adobe
            </Button>
            <Button 
              variant="ghost"
              className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Font
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4">
          {/* Fonts in Use Section */}
          <Card className="mb-6 border-border">
        <CardHeader>
          <CardTitle>Fonts in Use</CardTitle>
          <CardDescription>Currently active fonts in the main application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium">Display / Headings</div>
                  <code className="text-xs text-muted-foreground">{currentFonts.heading?.font_family || 'Not set'}</code>
                </div>
                <span className="text-xs text-muted-foreground capitalize">{currentFonts.heading?.source || 'default'}</span>
              </div>
              {currentFonts.heading && (
                <div className="p-3 rounded bg-muted">
                  <p style={{ fontFamily: currentFonts.heading.font_family }} className="text-2xl font-light">
                    {currentFonts.heading.name}
                  </p>
                  <p style={{ fontFamily: currentFonts.heading.font_family }} className="text-base mt-2">
                    The quick brown fox jumps over the lazy dog
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium">Body Text</div>
                  <code className="text-xs text-muted-foreground">{currentFonts.body?.font_family || 'Not set'}</code>
                </div>
                <span className="text-xs text-muted-foreground capitalize">{currentFonts.body?.source || 'default'}</span>
              </div>
              {currentFonts.body && (
                <div className="p-3 rounded bg-muted">
                  <p style={{ fontFamily: currentFonts.body.font_family }} className="text-xl">
                    {currentFonts.body.name}
                  </p>
                  <p style={{ fontFamily: currentFonts.body.font_family }} className="text-base mt-2">
                    The quick brown fox jumps over the lazy dog. Typography plays a crucial role in design.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">Loading fonts...</div>
      ) : fonts.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No fonts added yet</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Font
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {fonts.map((font) => (
            <Card key={font.id} className="border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{font.name}</CardTitle>
                    <CardDescription className="capitalize">{font.category}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleActivate(font)}
                      title="Activate this font"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(font)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Delete this font?')) {
                          deleteMutation.mutate(font.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <code className="text-xs text-muted-foreground block mb-3">{font.font_family}</code>
                <div className="p-3 rounded bg-muted">
                  <p style={{ fontFamily: font.font_family }} className="text-lg">
                    {font.preview_text}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <span className="capitalize">{font.source}</span>
                  {font.url && (
                    <>
                      <span>•</span>
                      <a href={font.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        View Source
                      </a>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </CardContent>
      </Card>
    </div>
  );
}