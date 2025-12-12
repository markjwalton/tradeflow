import React, { useState, lazy, Suspense, memo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Star, Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Card = lazy(() => import("@/components/ui/card").then(m => ({ default: m.Card })));
const CardContent = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardContent })));
const CardHeader = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardHeader })));
const CardTitle = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardTitle })));
const Badge = lazy(() => import("@/components/ui/badge").then(m => ({ default: m.Badge })));
const Dialog = lazy(() => import("@/components/ui/dialog").then(m => ({ default: m.Dialog })));
const DialogContent = lazy(() => import("@/components/ui/dialog").then(m => ({ default: m.DialogContent })));
const DialogHeader = lazy(() => import("@/components/ui/dialog").then(m => ({ default: m.DialogHeader })));
const DialogTitle = lazy(() => import("@/components/ui/dialog").then(m => ({ default: m.DialogTitle })));
const DialogTrigger = lazy(() => import("@/components/ui/dialog").then(m => ({ default: m.DialogTrigger })));
const Select = lazy(() => import("@/components/ui/select").then(m => ({ default: m.Select })));
const SelectContent = lazy(() => import("@/components/ui/select").then(m => ({ default: m.SelectContent })));
const SelectItem = lazy(() => import("@/components/ui/select").then(m => ({ default: m.SelectItem })));
const SelectTrigger = lazy(() => import("@/components/ui/select").then(m => ({ default: m.SelectTrigger })));
const SelectValue = lazy(() => import("@/components/ui/select").then(m => ({ default: m.SelectValue })));

const FontManager = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [newFont, setNewFont] = useState({
    name: "",
    font_family: "",
    source: "google",
    category: "sans-serif",
    google_font_url: "",
    adobe_font_id: "",
    variants: []
  });
  const queryClient = useQueryClient();
  
  const { data: fonts = [], isLoading } = useQuery({
    queryKey: ["fonts"],
    queryFn: async () => {
      const results = await base44.entities.FontLibrary.filter({});
      return results;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FontLibrary.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["fonts"]);
      toast.success("Font deleted");
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }) => 
      base44.entities.FontLibrary.update(id, { is_favorite: !isFavorite }),
    onSuccess: () => queryClient.invalidateQueries(["fonts"])
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.FontLibrary.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["fonts"]);
      setAddDialogOpen(false);
      setNewFont({
        name: "",
        font_family: "",
        source: "google",
        category: "sans-serif",
        google_font_url: "",
        adobe_font_id: "",
        variants: []
      });
      toast.success("Font added to library");
    }
  });

  const setThemeFontsMutation = useMutation({
    mutationFn: async ({ headingFontId, bodyFontId }) => {
      const user = await base44.auth.me();
      const headingFont = fonts.find(f => f.id === headingFontId);
      const bodyFont = fonts.find(f => f.id === bodyFontId);
      
      await base44.auth.updateMe({
        theme_fonts: {
          heading: {
            id: headingFontId,
            name: headingFont?.name,
            font_family: headingFont?.font_family,
            source: headingFont?.source,
            url: headingFont?.google_font_url || headingFont?.adobe_font_id
          },
          body: {
            id: bodyFontId,
            name: bodyFont?.name,
            font_family: bodyFont?.font_family,
            source: bodyFont?.source,
            url: bodyFont?.google_font_url || bodyFont?.adobe_font_id
          }
        }
      });
    },
    onSuccess: () => {
      toast.success("Theme fonts updated");
      window.location.reload();
    }
  });

  const handleSave = () => {
    if (!newFont.name || !newFont.font_family) {
      toast.error("Name and font family are required");
      return;
    }
    saveMutation.mutate({
      ...newFont,
      tenant_id: "__global__"
    });
  };

  const filteredFonts = React.useMemo(() => 
    fonts.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.font_family.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || f.category === selectedCategory;
      const matchesSource = selectedSource === "all" || f.source === selectedSource;
      return matchesSearch && matchesCategory && matchesSource;
    }),
    [fonts, searchQuery, selectedCategory, selectedSource]
  );

  const [headingFont, setHeadingFont] = useState("");
  const [bodyFont, setBodyFont] = useState("");

  React.useEffect(() => {
    const loadThemeFonts = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.theme_fonts) {
          setHeadingFont(user.theme_fonts.heading?.id || "");
          setBodyFont(user.theme_fonts.body?.id || "");
        }
      } catch (e) {}
    };
    loadThemeFonts();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading fonts...</div>;
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display">Font Manager</h1>
          <p className="text-muted-foreground mt-1">Manage fonts for your design system</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Font</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Font to Library</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Font Name</Label>
                <Input
                  value={newFont.name}
                  onChange={(e) => setNewFont({ ...newFont, name: e.target.value })}
                  placeholder="e.g., Roboto, Inter, Playfair Display"
                />
              </div>
              <div className="space-y-2">
                <Label>Font Family (CSS)</Label>
                <Input
                  value={newFont.font_family}
                  onChange={(e) => setNewFont({ ...newFont, font_family: e.target.value })}
                  placeholder="e.g., 'Roboto', sans-serif"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select value={newFont.source} onValueChange={(val) => setNewFont({ ...newFont, source: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google Fonts</SelectItem>
                      <SelectItem value="adobe">Adobe Fonts</SelectItem>
                      <SelectItem value="web-standard">Web Standard</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newFont.category} onValueChange={(val) => setNewFont({ ...newFont, category: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="sans-serif">Sans Serif</SelectItem>
                      <SelectItem value="monospace">Monospace</SelectItem>
                      <SelectItem value="display">Display</SelectItem>
                      <SelectItem value="handwriting">Handwriting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newFont.source === "google" && (
                <div className="space-y-2">
                  <Label>Google Font URL</Label>
                  <Input
                    value={newFont.google_font_url}
                    onChange={(e) => setNewFont({ ...newFont, google_font_url: e.target.value })}
                    placeholder="https://fonts.googleapis.com/css2?family=..."
                  />
                </div>
              )}
              {newFont.source === "adobe" && (
                <div className="space-y-2">
                  <Label>Adobe Font ID</Label>
                  <Input
                    value={newFont.adobe_font_id}
                    onChange={(e) => setNewFont({ ...newFont, adobe_font_id: e.target.value })}
                    placeholder="abc1234"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Font</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme Fonts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heading Font</Label>
              <Select value={headingFont} onValueChange={setHeadingFont}>
                <SelectTrigger>
                  <SelectValue placeholder="Select heading font" />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Body Font</Label>
              <Select value={bodyFont} onValueChange={setBodyFont}>
                <SelectTrigger>
                  <SelectValue placeholder="Select body font" />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={() => setThemeFontsMutation.mutate({ headingFontId: headingFont, bodyFontId: bodyFont })}
            disabled={!headingFont || !bodyFont || setThemeFontsMutation.isPending}
            className="w-full"
          >
            Apply Theme Fonts
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <Search className="h-4 w-4 text-muted-foreground mt-3" />
            <Input
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="serif">Serif</SelectItem>
                <SelectItem value="sans-serif">Sans Serif</SelectItem>
                <SelectItem value="monospace">Monospace</SelectItem>
                <SelectItem value="display">Display</SelectItem>
                <SelectItem value="handwriting">Handwriting</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="adobe">Adobe</SelectItem>
                <SelectItem value="web-standard">Web Standard</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredFonts.map((font) => (
          <Card key={font.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">{font.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{font.font_family}</p>
                <div className="flex gap-1 mt-2">
                  <Badge variant="outline">{font.category}</Badge>
                  <Badge variant="secondary">{font.source}</Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleFavoriteMutation.mutate({ 
                    id: font.id, 
                    isFavorite: font.is_favorite 
                  })}
                >
                  <Star className={`h-4 w-4 ${font.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(font.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="text-2xl p-4 bg-muted/30 rounded-lg"
                style={{ fontFamily: font.font_family }}
              >
                {font.preview_text || "The quick brown fox jumps over the lazy dog"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </Suspense>
  );
};

export default memo(FontManager);