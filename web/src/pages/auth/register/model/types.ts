import type {LucideIcon} from "lucide-react";

export type RegisterMode = "resident" | "manager";

export interface RegisterFeature {
    id: number;
    text: string;
    icon: LucideIcon;
}