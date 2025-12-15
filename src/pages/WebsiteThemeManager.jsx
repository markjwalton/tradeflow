import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Palette, Check, Copy, Save, Library, Loader2 } from 'lucide-react';

export default function WebsiteThemeManager() {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [editingTheme, setEditingTheme] = useState(null);
  const [cssVariables, setCssVariables] = useState('');
  const [themeName, setThemeName] = useState('');
  const [themeDescription, setThemeDescription] = useState('');
  const [headingFontId, setHeadingFontId] = useState('');
  const [bodyFontId, setBodyFontId] = useState('');

  const queryClient = useQueryClient();

  const { data: folders = [] } = useQuery({
    queryKey: ['website-folders'],
    queryFn: () => base44.entities.WebsiteFolder.list(),
  });

  const { data: fonts = [] } = useQuery({
    queryKey: ['fonts'],
    queryFn: () => base44.entities.FontFamily.list(),
  });

  const { data: themes = [] } = useQuery({
    queryKey: ['website-themes', selectedFolder?.id],
    queryFn: () => selectedFolder 
      ? base44.entities.WebsiteTheme.filter({ website_folder_id: selectedFolder.id })
      : Promise.resolve([]),
    enabled: !!selectedFolder,
  });

  const { data: libraryThemes = [] } = useQuery({
    queryKey: ['library-themes'],
    queryFn: () => base44.entities.WebsiteTheme.filter({ is_library_theme: true }),
  });

  const createThemeMutation = useMutation({
    mutationFn: (data) => base44.entities.WebsiteTheme.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-themes'] });
      resetForm();
      toast.success('Theme created');
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WebsiteTheme.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-themes'] });
      toast.success('Theme updated');
    },
  });

  const activateThemeMutation = useMutation({
    mutationFn: async (themeId) => {
      // Deactivate all themes for this folder
      const allThemes = await base44.entities.WebsiteTheme.filter({ 
        website_folder_id: selectedFolder.id 
      });
      
      for (const theme of allThemes) {
        if (theme.id !== themeId) {
          await base44.entities.WebsiteTheme.update(theme.id, { is_active: false });
        }
      }
      
      // Activate selected theme
      await base44.entities.WebsiteTheme.update(themeId, { is_active: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-themes'] });
      toast.success('Theme activated');
    },
  });

  const cloneFromLibraryMutation = useMutation({
    mutationFn: async (libraryThemeId) => {
      const libraryTheme = libraryThemes.find(t => t.id === libraryThemeId);
      await base44.entities.WebsiteTheme.create({
        name: libraryTheme.name + ' (Copy)',
        website_folder_id: selectedFolder.id,
        description: libraryTheme.description,
        css_variables: libraryTheme.css_variables,
        heading_font_id: libraryTheme.heading_font_id,
        body_font_id: libraryTheme.body_font_id,
        is_library_theme: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-themes'] });
      toast.success('Theme cloned from library');
    },
  });

  const saveToLibraryMutation = useMutation({
    mutationFn: (themeId) => {
      return base44.entities.WebsiteTheme.update(themeId, { is_library_theme: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-themes'] });
      toast.success('Theme saved to library');
    },
  });

  const resetForm = () => {
    setThemeName('');
    setThemeDescription('');
    setCssVariables('');
    setHeadingFontId('');
    setBodyFontId('');
    setEditingTheme(null);
  };

  const handleSaveTheme = () => {
    const data = {
      name: themeName,
      description: themeDescription,
      website_folder_id: selectedFolder.id,
      css_variables: cssVariables,
      heading_font_id: headingFontId || null,
      body_font_id: bodyFontId || null,
    };

    if (editingTheme) {
      updateThemeMutation.mutate({ id: editingTheme.id, data });
    } else {
      createThemeMutation.mutate(data);
    }
  };

  const loadThemeForEdit = (theme) => {
    setEditingTheme(theme);
    setThemeName(theme.name);
    setThemeDescription(theme.description || '');
    setCssVariables(theme.css_variables || '');
    setHeadingFontId(theme.heading_font_id || '');
    setBodyFontId(theme.body_font_id || '');
  };

  const generateDefaultTokens = () => {
    const defaults = `:root {
  /* Primary Colors */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  
  /* Text Colors */
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
  
  /* Background */
  --color-background: #ffffff;
  --color-background-subtle: #f9fafb;
  
  /* Spacing */
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}`;
    setCssVariables(defaults);
  };

  const activeTheme = themes.find(t => t.is_active);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Website Theme Manager" 
        description="Manage design tokens, fonts, and themes for your demo websites"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Website Folders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedFolder?.id === folder.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-sm">{folder.name}</div>
                  <div className="text-xs text-muted-foreground">/{folder.slug}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          {!selectedFolder ? (
            <CardContent className="py-12 text-center text-muted-foreground">
              Select a website folder to manage themes
            </CardContent>
          ) : (
            <Tabs defaultValue="themes">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedFolder.name} - Themes</CardTitle>
                    {activeTheme && (
                      <CardDescription className="mt-1">
                        Active: <Badge variant="outline">{activeTheme.name}</Badge>
                      </CardDescription>
                    )}
                  </div>
                  <TabsList>
                    <TabsTrigger value="themes">Themes</TabsTrigger>
                    <TabsTrigger value="editor">Theme Editor</TabsTrigger>
                    <TabsTrigger value="library">Library</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>

              <CardContent>
                <TabsContent value="themes" className="space-y-4">
                  {themes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No themes yet. Create one or clone from library.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {themes.map((theme) => (
                        <Card key={theme.id} className={theme.is_active ? 'ring-2 ring-primary' : ''}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{theme.name}</CardTitle>
                                {theme.description && (
                                  <CardDescription className="text-xs mt-1">
                                    {theme.description}
                                  </CardDescription>
                                )}
                              </div>
                              {theme.is_active && (
                                <Badge variant="default" className="bg-green-600">
                                  <Check className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => loadThemeForEdit(theme)}
                                className="flex-1"
                              >
                                Edit
                              </Button>
                              {!theme.is_active && (
                                <Button
                                  size="sm"
                                  onClick={() => activateThemeMutation.mutate(theme.id)}
                                  className="flex-1"
                                >
                                  Activate
                                </Button>
                              )}
                              {!theme.is_library_theme && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => saveToLibraryMutation.mutate(theme.id)}
                                >
                                  <Library className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="editor" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Theme Name</Label>
                      <Input
                        value={themeName}
                        onChange={(e) => setThemeName(e.target.value)}
                        placeholder="e.g., Radiant Dark"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Input
                        value={themeDescription}
                        onChange={(e) => setThemeDescription(e.target.value)}
                        placeholder="Optional description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Heading Font</Label>
                        <Select value={headingFontId} onValueChange={setHeadingFontId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {fonts.map((font) => (
                              <SelectItem key={font.id} value={font.id}>
                                {font.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Body Font</Label>
                        <Select value={bodyFontId} onValueChange={setBodyFontId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {fonts.map((font) => (
                              <SelectItem key={font.id} value={font.id}>
                                {font.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>CSS Variables (Design Tokens)</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={generateDefaultTokens}
                        >
                          Generate Defaults
                        </Button>
                      </div>
                      <Textarea
                        value={cssVariables}
                        onChange={(e) => setCssVariables(e.target.value)}
                        placeholder=":root { --color-primary: #3b82f6; }"
                        className="font-mono text-xs min-h-[300px]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveTheme} disabled={!themeName}>
                        <Save className="h-4 w-4 mr-2" />
                        {editingTheme ? 'Update Theme' : 'Create Theme'}
                      </Button>
                      {editingTheme && (
                        <Button variant="outline" onClick={resetForm}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="library" className="space-y-4">
                  {libraryThemes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No themes in library. Save themes to library for reuse.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {libraryThemes.map((theme) => (
                        <Card key={theme.id}>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Library className="h-4 w-4" />
                              {theme.name}
                            </CardTitle>
                            {theme.description && (
                              <CardDescription className="text-xs">
                                {theme.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cloneFromLibraryMutation.mutate(theme.id)}
                              className="w-full"
                            >
                              <Copy className="h-3 w-3 mr-2" />
                              Clone to {selectedFolder.name}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          )}
        </Card>
      </div>
    </div>
  );
}