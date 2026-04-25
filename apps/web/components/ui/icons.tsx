/**
 * Icon mapping for consistent icon usage across the application
 * Using lucide-react for unified visual style
 */
import {
  BarChart3,
  Bot,
  Check,
  FileText,
  HelpCircle,
  Home,
  Info,
  LucideIcon,
  Mail,
  MessageSquare,
  Scale,
  Shield,
  Wrench,
} from "lucide-react";

// Icon mapping for homepage
export const HomePageIcons = {
  ai: Bot,
  community: MessageSquare,
  mail: Mail,
  question: HelpCircle,
  legal: Scale,
  stats: BarChart3,
  home: Home,
  info: Info,
  fileText: FileText,
  wrench: Wrench,
  shield: Shield,
  check: Check,
} as const;

// Type for icon names
export type HomePageIconName = keyof typeof HomePageIcons;

// Helper function to get icon component
export function getIcon(name: HomePageIconName): LucideIcon {
  return HomePageIcons[name];
}
