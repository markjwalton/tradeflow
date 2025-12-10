
import {
  LayoutDashboard,
  FileText,
  Cpu,
  MessageCircle,
  CheckSquare,
  FileSignature,
} from "lucide-react";

export const clientNav = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    key: "documents",
    label: "Documents",
    icon: FileText,
  },
  {
    key: "tech-docs",
    label: "Tech Docs",
    icon: Cpu,
  },
  {
    key: "ai-assistant",
    label: "AI Assistant",
    icon: MessageCircle,
  },
  {
    key: "tasks",
    label: "Tasks",
    icon: CheckSquare,
  },
  {
    key: "contracts",
    label: "Contracts",
    icon: FileSignature,
  },
];
