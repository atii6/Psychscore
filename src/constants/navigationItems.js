import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Upload,
  ClipboardEdit,
  FileText,
  BookOpen,
  Database,
  BarChart3,
} from "lucide-react";

const NAVIGATION_ITEMS = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Upload & Extract",
    url: createPageUrl("Upload"),
    icon: Upload,
  },
  {
    title: "Manual Entry",
    url: createPageUrl("ManualEntry"),
    icon: ClipboardEdit,
  },
  {
    title: "Reports",
    url: createPageUrl("Reports"),
    icon: FileText,
  },
  {
    title: "Report Templates",
    url: createPageUrl("Templates"),
    icon: BookOpen,
  },
  {
    title: "Test Bank",
    url: createPageUrl("TestBank"),
    icon: Database,
  },
  {
    title: "Score Descriptors",
    url: createPageUrl("ScoreReference"),
    icon: BarChart3,
  },
];

export default NAVIGATION_ITEMS;
