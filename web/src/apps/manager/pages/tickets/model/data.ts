// Статика для UI карточек заявки: иконка/цвета по визуальному «типу» заявки.
// Сами заявки приходят из API (см. adapters.ts → adaptRequest), мок-данных нет.

import {Droplet, Flame, Zap, ArrowUpDown, Wrench, Brush, Leaf, Shield} from "lucide-react";
import type {TicketType, TicketTypeMeta} from "./types.ts";

export const KANBAN_TYPES: Record<TicketType, TicketTypeMeta> = {
    drop: {icon: Droplet, bg: "#e0f2fe", fg: "#0ea5e9", label: "Сантехника"},
    flame: {icon: Flame, bg: "#fef3c7", fg: "#f59e0b", label: "Тепло"},
    bolt: {icon: Zap, bg: "#fef3c7", fg: "#f59e0b", label: "Электрика"},
    elevator: {icon: ArrowUpDown, bg: "#fee2e2", fg: "#ef4444", label: "Лифт"},
    wrench: {icon: Wrench, bg: "#d1fae5", fg: "#047857", label: "Ремонт"},
    broom: {icon: Brush, bg: "#d1fae5", fg: "#047857", label: "Уборка"},
    leaf: {icon: Leaf, bg: "#d1fae5", fg: "#047857", label: "Двор"},
    shield: {icon: Shield, bg: "#ede9fe", fg: "#7c3aed", label: "Безопасность"},
};

/** Табы фильтра. Каждый соответствует предикату в filterRequests (adapters.ts). */
export const FILTER_TABS = [
    {id: "all", label: "Все"},
    {id: "alerts", label: "Аварийные"},
    {id: "overdue", label: "Просроченные"},
];
