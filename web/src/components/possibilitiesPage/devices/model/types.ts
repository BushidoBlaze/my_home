import type {LucideIcon} from "lucide-react";

export interface ListItemProps {
    icon: LucideIcon;
    text: string;
}

export type DevicesType = "laptop" | "tablet" | "phone";
export interface DevicesProps {
    name: string;
    type: DevicesType;
    imageUrl: string;
}

export interface TagsProps {
    icon: LucideIcon;
    text: string;
}
