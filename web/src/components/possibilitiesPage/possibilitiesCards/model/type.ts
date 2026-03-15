import type {LucideIcon} from "lucide-react";

export interface PossibilityCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    tag: "Жильцы" | "УК";
}