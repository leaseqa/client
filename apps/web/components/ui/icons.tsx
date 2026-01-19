/**
 * Icon mapping for consistent icon usage across the application
 * Using lucide-react for unified visual style
 */
import {
    Bot,
    MessageSquare,
    Mail,
    HelpCircle,
    Scale,
    Home,
    BarChart3,
    Info,
    FileText,
    Wrench,
    Shield,
    Check,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

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
