import type {LucideIcon} from "lucide-react";
import type {ChipTone} from "@/apps/manager/pages/home/model/types.ts";

export type TicketType = "drop" | "flame" | "bolt" | "elevator" | "wrench" | "broom" | "leaf" | "shield";
export type TicketPriority = "high" | "med" | "low";

export type Ticket = {
    /** Реальный uuid из БД — нужен для перехода на /manager/tickets/:id. */
    realId: string;
    /** Короткий человекочитаемый код («Т-XXXX») для отображения. */
    id: string;
    type: TicketType;
    title: string;
    addr: string;
    sla: string;
    slaTone: ChipTone;
    priority: TicketPriority;
};

export type KanbanColumn = {
    title: string;
    count: number;
    tone: string;
    sub?: string;
    tickets: Ticket[];
};

export type TicketTypeMeta = {
    icon: LucideIcon;
    bg: string;
    fg: string;
    label: string;
};
