import type {LucideIcon} from "lucide-react";

export type TimelineEvent = {
    time: string;
    actor: string;
    icon: LucideIcon;
    iconBg: string;
    iconFg: string;
    title: string;
    body?: string;
};

export type RelatedTicket = {
    id: string;
    title: string;
    date: string;
};

export type SopItem = {
    text: string;
    done: boolean;
};
