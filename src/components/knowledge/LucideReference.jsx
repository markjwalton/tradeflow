import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, Copy, CheckCircle2, ExternalLink,
  // Common icons for reference
  Home, Settings, User, Users, Mail, Phone, Calendar, Clock,
  Plus, Minus, X, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
  Edit, Pencil, Trash2, Save, Download, Upload, RefreshCw,
  Eye, EyeOff, Lock, Unlock, Key,
  File, FileText, Folder, FolderOpen,
  Image, Video, Music, Link2, ExternalLink as ExtLink,
  Heart, Star, Bookmark, Flag, Bell, BellOff,
  MessageCircle, MessageSquare, Send,
  Search as SearchIcon, Filter, SlidersHorizontal,
  Menu, MoreHorizontal, MoreVertical, Grid, List,
  Sun, Moon, Laptop, Smartphone,
  AlertCircle, AlertTriangle, Info, HelpCircle,
  CheckCircle, XCircle, MinusCircle, PlusCircle,
  Loader2, RotateCw, RotateCcw,
  Copy as CopyIcon, Clipboard, ClipboardCheck,
  Share, Share2, Forward, Reply,
  Maximize, Minimize,
  ZoomIn, ZoomOut, Move,
  Tag, Hash, AtSign,
  Database, Server, Cloud, CloudOff,
  Code, Terminal, Bug,
  Palette, Brush,
  LayoutGrid, LayoutList, Columns, Rows,
  Circle, Square, Triangle, Hexagon,
  Package, Box, Gift, ShoppingCart, ShoppingBag,
  CreditCard, Wallet, DollarSign, Receipt,
  Building, Building2, Store, Factory,
  Map, MapPin, Navigation, Compass,
  Globe, Plane, Car,
  Activity, BarChart, BarChart2, BarChart3, LineChart, PieChart,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Zap, Sparkles, Lightbulb, Target, Award, Trophy,
  Shield, ShieldCheck, ShieldAlert, ShieldOff,
  Layers, Component, Puzzle,
  GitBranch, GitCommit, GitMerge, GitPullRequest,
  Play, Pause, SkipBack, SkipForward,
  Volume, Volume1, Volume2, VolumeX,
  Mic, MicOff, Camera, CameraOff,
  Printer, QrCode
} from "lucide-react";
import { toast } from "sonner";

// Organized icon categories with actual components
const ICON_CATEGORIES = {
  navigation: {
    name: "Navigation & Actions",
    icons: [
      { name: "Home", component: Home },
      { name: "Menu", component: Menu },
      { name: "ArrowLeft", component: ArrowLeft },
      { name: "ArrowRight", component: ArrowRight },
      { name: "ArrowUp", component: ArrowUp },
      { name: "ArrowDown", component: ArrowDown },
      { name: "ChevronDown", component: ChevronDown },
      { name: "ChevronUp", component: ChevronUp },
      { name: "ChevronLeft", component: ChevronLeft },
      { name: "ChevronRight", component: ChevronRight },
      { name: "ExternalLink", component: ExtLink },
      { name: "Link2", component: Link2 },
      { name: "MoreHorizontal", component: MoreHorizontal },
      { name: "MoreVertical", component: MoreVertical }
    ]
  },
  actions: {
    name: "Common Actions",
    icons: [
      { name: "Plus", component: Plus },
      { name: "Minus", component: Minus },
      { name: "X", component: X },
      { name: "Check", component: Check },
      { name: "Edit", component: Edit },
      { name: "Pencil", component: Pencil },
      { name: "Trash2", component: Trash2 },
      { name: "Save", component: Save },
      { name: "Download", component: Download },
      { name: "Upload", component: Upload },
      { name: "RefreshCw", component: RefreshCw },
      { name: "Copy", component: CopyIcon },
      { name: "Search", component: SearchIcon },
      { name: "Filter", component: Filter }
    ]
  },
  feedback: {
    name: "Feedback & Status",
    icons: [
      { name: "CheckCircle2", component: CheckCircle2 },
      { name: "AlertCircle", component: AlertCircle },
      { name: "AlertTriangle", component: AlertTriangle },
      { name: "Info", component: Info },
      { name: "HelpCircle", component: HelpCircle },
      { name: "XCircle", component: XCircle },
      { name: "Loader2", component: Loader2, note: "Add animate-spin" },
      { name: "CheckCircle", component: CheckCircle },
      { name: "Bell", component: Bell },
      { name: "BellOff", component: BellOff }
    ]
  },
  user: {
    name: "User & Communication",
    icons: [
      { name: "User", component: User },
      { name: "Users", component: Users },
      { name: "Mail", component: Mail },
      { name: "Phone", component: Phone },
      { name: "MessageCircle", component: MessageCircle },
      { name: "MessageSquare", component: MessageSquare },
      { name: "Send", component: Send },
      { name: "Share", component: Share },
      { name: "Share2", component: Share2 }
    ]
  },
  files: {
    name: "Files & Media",
    icons: [
      { name: "File", component: File },
      { name: "FileText", component: FileText },
      { name: "Folder", component: Folder },
      { name: "FolderOpen", component: FolderOpen },
      { name: "Image", component: Image },
      { name: "Video", component: Video },
      { name: "Music", component: Music },
      { name: "Clipboard", component: Clipboard }
    ]
  },
  ui: {
    name: "UI & Layout",
    icons: [
      { name: "Settings", component: Settings },
      { name: "SlidersHorizontal", component: SlidersHorizontal },
      { name: "Grid", component: Grid },
      { name: "List", component: List },
      { name: "LayoutGrid", component: LayoutGrid },
      { name: "Columns", component: Columns },
      { name: "Layers", component: Layers },
      { name: "Eye", component: Eye },
      { name: "EyeOff", component: EyeOff },
      { name: "Lock", component: Lock },
      { name: "Unlock", component: Unlock }
    ]
  },
  data: {
    name: "Data & Charts",
    icons: [
      { name: "BarChart3", component: BarChart3 },
      { name: "LineChart", component: LineChart },
      { name: "PieChart", component: PieChart },
      { name: "TrendingUp", component: TrendingUp },
      { name: "TrendingDown", component: TrendingDown },
      { name: "Activity", component: Activity },
      { name: "Database", component: Database }
    ]
  },
  business: {
    name: "Business & Commerce",
    icons: [
      { name: "Building2", component: Building2 },
      { name: "Store", component: Store },
      { name: "Package", component: Package },
      { name: "Box", component: Box },
      { name: "ShoppingCart", component: ShoppingCart },
      { name: "CreditCard", component: CreditCard },
      { name: "DollarSign", component: DollarSign },
      { name: "Receipt", component: Receipt }
    ]
  },
  time: {
    name: "Time & Calendar",
    icons: [
      { name: "Calendar", component: Calendar },
      { name: "Clock", component: Clock }
    ]
  },
  development: {
    name: "Development",
    icons: [
      { name: "Code", component: Code },
      { name: "Terminal", component: Terminal },
      { name: "Bug", component: Bug },
      { name: "GitBranch", component: GitBranch },
      { name: "Component", component: Component },
      { name: "Zap", component: Zap },
      { name: "Sparkles", component: Sparkles },
      { name: "Lightbulb", component: Lightbulb }
    ]
  },
  shapes: {
    name: "Shapes & Markers",
    icons: [
      { name: "Circle", component: Circle },
      { name: "Square", component: Square },
      { name: "Star", component: Star },
      { name: "Heart", component: Heart },
      { name: "Bookmark", component: Bookmark },
      { name: "Flag", component: Flag },
      { name: "Tag", component: Tag },
      { name: "MapPin", component: MapPin }
    ]
  }
};

export default function LucideReference() {
  const [search, setSearch] = useState("");
  const [copiedIcon, setCopiedIcon] = useState(null);

  const copyUsage = (iconName) => {
    const code = `<${iconName} className="h-4 w-4" />`;
    navigator.clipboard.writeText(code);
    setCopiedIcon(iconName + "-usage");
    toast.success(`Copied ${iconName} usage`);
    setTimeout(() => setCopiedIcon(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-600" />
            Lucide Icons Reference
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              All Icons
            </a>
          </Button>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="mt-2 p-2 bg-orange-50 rounded-lg">
          <p className="text-xs text-orange-800">
            <strong>Important:</strong> Only import icons that exist! Verify icon names at lucide.dev before using.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {Object.entries(ICON_CATEGORIES).map(([key, category]) => {
              const filteredIcons = category.icons.filter(icon =>
                !search || icon.name.toLowerCase().includes(search.toLowerCase())
              );

              if (filteredIcons.length === 0) return null;

              return (
                <div key={key}>
                  <h3 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    {category.name}
                    <Badge variant="outline" className="ml-auto">{filteredIcons.length}</Badge>
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {filteredIcons.map((icon) => {
                      const IconComponent = icon.component;
                      return (
                        <div
                          key={icon.name}
                          className="group relative p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer text-center"
                          onClick={() => copyUsage(icon.name)}
                        >
                          <IconComponent className="h-5 w-5 mx-auto text-gray-700 group-hover:text-orange-700" />
                          <p className="text-[10px] mt-1 text-gray-600 truncate">{icon.name}</p>
                          {icon.note && (
                            <p className="text-[8px] text-orange-600">{icon.note}</p>
                          )}
                          {copiedIcon === icon.name + "-usage" && (
                            <div className="absolute inset-0 bg-green-500/90 rounded-lg flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Quick Usage</h4>
          <div className="space-y-2 text-xs">
            <div>
              <p className="text-gray-600 mb-1">Import:</p>
              <code className="bg-gray-900 text-gray-100 p-2 rounded block">
                {`import { Home, Settings, User } from "lucide-react"`}
              </code>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Usage:</p>
              <code className="bg-gray-900 text-gray-100 p-2 rounded block">
                {`<Home className="h-4 w-4" />`}
              </code>
            </div>
            <div>
              <p className="text-gray-600 mb-1">With Sturij colors:</p>
              <code className="bg-gray-900 text-gray-100 p-2 rounded block">
                {`<Home className="h-4 w-4 text-[var(--color-primary)]" />`}
              </code>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Spinning loader:</p>
              <code className="bg-gray-900 text-gray-100 p-2 rounded block">
                {`<Loader2 className="h-4 w-4 animate-spin" />`}
              </code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}