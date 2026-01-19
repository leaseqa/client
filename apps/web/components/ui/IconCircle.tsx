"use client";

import {ReactNode} from "react";
import {LucideIcon} from "lucide-react";

type IconCircleProps = {
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    variant?: "purple" | "green" | "red" | "blue" | "muted" | "glass";
    children?: ReactNode;
    icon?: LucideIcon;
    iconSize?: number;
    className?: string;
};

export default function IconCircle({
                                       size = "md",
                                       variant = "purple",
                                       children,
                                       icon: Icon,
                                       iconSize,
                                       className = ""
                                   }: IconCircleProps) {
    const sizeClass = `icon-circle-${size}`;
    const variantClass = `icon-bg-${variant}`;

    // Determine icon size based on circle size if not provided
    const getIconSize = () => {
        if (iconSize) return iconSize;
        switch (size) {
            case "xs": return 10;
            case "sm": return 16;
            case "md": return 20;
            case "lg": return 24;
            case "xl": return 28;
            case "2xl": return 40;
            default: return 20;
        }
    };

    return (
        <div className={`icon-circle ${sizeClass} ${variantClass} ${className}`}>
            {Icon ? <Icon size={getIconSize()} /> : children}
        </div>
    );
}