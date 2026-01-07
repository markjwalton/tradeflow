import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, ExternalLink, Check, Cloud, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export function FontManagerTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFont, setEditingFont] = useState(null);
  const [currentFonts, setCurrentFonts] = useState({ heading: null, body: null });
  const [isImporting, setIsImporting] = useState(false);
  const [fontsInUseOpen, setFontsInUseOpen] = useState(true);
  const [openFontIds, setOpenFontIds] = useState([]);
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
      
      try {
        const user = await base44.auth.me();
        if (user?.theme_fonts) {
          setCurrentFonts({
            heading: user.theme_fonts.heading || null,
            body: user.theme_fonts.body || null
          });
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
    <div className="space-y-6">
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
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

      <Card>
        <CardContent className="px-2 py-1">
          <div className="flex gap-2">
            <Button 
              variant="ghost"
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
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Font
            </Button>
          </div>
        </CardContent>
      </Card>

      <Collapsible open={fontsInUseOpen} onOpenChange={setFontsInUseOpen}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <CardTitle>Fonts in Use</CardTitle>
                  <p className="text-sm text-muted-foreground">Currently active fonts</p>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${fontsInUseOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border">
                  <div className="text-sm font-medium mb-2">Display / Headings</div>
                  {currentFonts.heading && (
                    <div className="p-3 rounded bg-muted">
                      <p style={{ fontFamily: currentFonts.heading.font_family }} className="text-2xl">
                        {currentFonts.heading.name}
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-sm font-medium mb-2">Body Text</div>
                  {currentFonts.body && (
                    <div className="p-3 rounded bg-muted">
                      <p style={{ fontFamily: currentFonts.body.font_family }} className="text-xl">
                        {currentFonts.body.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {isLoading ? (
        <div className="text-center py-12">Loading fonts...</div>
      ) : fonts.length === 0 ? (
        <Card>
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
            <Collapsible 
              key={font.id} 
              open={openFontIds.includes(font.id)}
              onOpenChange={(open) => {
                setOpenFontIds(prev => 
                  open ? [...prev, font.id] : prev.filter(id => id !== font.id)
                );
              }}
            >
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <ChevronDown className={`h-4 w-4 transition-transform ${openFontIds.includes(font.id) ? 'rotate-180' : ''}`} />
                        <div className="text-left">
                          <CardTitle className="text-base" style={{ fontFamily: font.font_family }}>{font.name}</CardTitle>
                          <p className="text-sm text-muted-foreground capitalize">{font.category}</p>
                        </div>
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
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
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="p-3 rounded bg-muted">
                      <p style={{ fontFamily: font.font_family }} className="text-lg">
                        {font.preview_text}
                      </p>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}