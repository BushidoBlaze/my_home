import type {LucideIcon} from "lucide-react";

export type SidebarItem = {
    icon: LucideIcon;
    path: string;
    label: string;
};

export type ManagerMenuItem = {
    id: string;
    label: string;
    icon: LucideIcon;
    path: string;
    badge?: number | "new";
};

export type ManagerMenuGroup = {
    title: string;
    items: ManagerMenuItem[];
};
