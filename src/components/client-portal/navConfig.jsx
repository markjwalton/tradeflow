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
    path: "/client-portal/overview",
  },
  {
    key: "documents",
    label: "Documents",
    icon: FileText,
    path: "/client-portal/documents",
  },
  {
    key: "tech-docs",
    label: "Tech Docs",
    icon: Cpu,
    path: "/client-portal/tech-docs",
  },
  {
    key: "ai-assistant",
    label: "AI Assistant",
    icon: MessageCircle,
    path: "/client-portal/ai-assistant",
  },
  {
    key: "tasks",
    label: "Tasks",
    icon: CheckSquare,
    path: "/client-portal/tasks",
  },
  {
    key: "contracts",
    label: "Contracts",
    icon: FileSignature,
    path: "/client-portal/contracts",
  },
];