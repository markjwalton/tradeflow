/**
 * NavIconMap.js - Single source of truth for navigation icons
 * Part of Sturij Design System - Sprint 1
 */

import {
  Home,
  Settings,
  Users,
  FileText,
  LayoutDashboard,
  FolderOpen,
  FolderClosed,
  Folder,
  File,
  ShoppingCart,
  Mail,
  Calendar,
  Bell,
  Search,
  Heart,
  Star,
  Bookmark,
  Clock,
  Globe,
  Lock,
  Key,
  Shield,
  Zap,
  Database,
  Server,
  Code,
  Terminal,
  Cpu,
  Monitor,
  Smartphone,
  Tablet,
  Camera,
  Image,
  Video,
  Music,
  Mic,
  Phone,
  MessageSquare,
  Send,
  Inbox,
  Archive,
  Trash,
  Edit,
  Edit2,
  PenTool,
  Layers,
  Grid,
  List,
  BarChart,
  PieChart,
  TrendingUp,
  DollarSign,
  CreditCard,
  Wallet,
  Gift,
  Tag,
  Package,
  Truck,
  MapPin,
  Navigation,
  Compass,
  Map,
  Flag,
  Award,
  Target,
  Crosshair,
  Lightbulb,
  GitBranch,
  Building2,
  Workflow,
  Layout,
  Gauge,
  BookOpen,
  FlaskConical,
  Wrench,
  Route,
  ToggleLeft,
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  MoveRight,
  CornerDownRight,
  Power,
  Copy,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Link,
  Unlink,
  RefreshCw,
  RotateCcw,
  Save,
  Download,
  Upload,
  Share,
  MoreHorizontal,
  MoreVertical,
  Menu,
  Sidebar,
  PanelLeft,
  PanelRight,
  Maximize,
  Minimize,
  Expand,
  Shrink,
} from "lucide-react";

/**
 * Complete icon map for navigation system
 * Keys are string identifiers used in data/config
 * Values are React components
 */
export const NAV_ICON_MAP = {
  // Core navigation
  Home,
  Dashboard: LayoutDashboard,
  LayoutDashboard,
  Settings,
  Menu,
  Sidebar,
  PanelLeft,
  PanelRight,
  Navigation,
  Route,
  
  // Files & Folders
  Folder,
  FolderOpen,
  FolderClosed,
  File,
  FileText,
  
  // Users & Communication
  Users,
  Mail,
  MessageSquare,
  Send,
  Inbox,
  Phone,
  Bell,
  
  // Business
  ShoppingCart,
  DollarSign,
  CreditCard,
  Wallet,
  Gift,
  Tag,
  Package,
  Truck,
  Building2,
  
  // Data & Development
  Database,
  Server,
  Code,
  Terminal,
  Cpu,
  GitBranch,
  Workflow,
  Layout,
  FlaskConical,
  
  // Tools & Settings
  Wrench,
  Settings,
  Key,
  Lock,
  Shield,
  Gauge,
  ToggleLeft,
  
  // Actions
  Edit,
  Edit2,
  Pencil,
  PenTool,
  Copy,
  Trash,
  Trash2,
  Save,
  Download,
  Upload,
  Share,
  RefreshCw,
  RotateCcw,
  Power,
  
  // Media
  Camera,
  Image,
  Video,
  Music,
  Mic,
  
  // Devices
  Monitor,
  Smartphone,
  Tablet,
  
  // Charts & Data viz
  BarChart,
  PieChart,
  TrendingUp,
  Layers,
  Grid,
  List,
  
  // Location
  MapPin,
  Compass,
  Map,
  Globe,
  
  // Status & Feedback
  Check,
  X,
  AlertCircle,
  Info,
  HelpCircle,
  Eye,
  EyeOff,
  
  // Misc
  Calendar,
  Clock,
  Search,
  Heart,
  Star,
  Bookmark,
  Flag,
  Award,
  Target,
  Crosshair,
  Lightbulb,
  Zap,
  BookOpen,
  Archive,
  Link,
  Unlink,
  ExternalLink,
  
  // Navigation controls
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  MoveRight,
  CornerDownRight,
  MoreHorizontal,
  MoreVertical,
  Maximize,
  Minimize,
  Expand,
  Shrink,
};

/**
 * Get icon options for select dropdowns
 * Returns array of { name, icon } objects
 */
export const getIconOptions = () => {
  return Object.entries(NAV_ICON_MAP).map(([name, icon]) => ({
    name,
    icon,
  }));
};

/**
 * Get icon component by name
 * Returns the icon component or a fallback
 */
export const getIconByName = (name, fallback = Home) => {
  return NAV_ICON_MAP[name] || fallback;
};

/**
 * Render icon with consistent styling
 */
export const renderIcon = (iconName, className = "h-4 w-4") => {
  const IconComponent = getIconByName(iconName);
  return IconComponent ? <IconComponent className={className} /> : null;
};

/**
 * Common icon groups for UI organization
 */
export const ICON_GROUPS = {
  navigation: ["Home", "Dashboard", "Menu", "Navigation", "Route", "Sidebar"],
  files: ["Folder", "FolderOpen", "FolderClosed", "File", "FileText"],
  users: ["Users", "Mail", "MessageSquare", "Bell", "Phone"],
  business: ["ShoppingCart", "DollarSign", "Package", "Building2", "Truck"],
  development: ["Database", "Code", "GitBranch", "Workflow", "FlaskConical"],
  tools: ["Settings", "Wrench", "Key", "Shield", "Gauge"],
  actions: ["Edit", "Copy", "Trash", "Save", "RefreshCw"],
  status: ["Check", "X", "AlertCircle", "Eye", "EyeOff"],
};

export default NAV_ICON_MAP;