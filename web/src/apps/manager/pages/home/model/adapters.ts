// Адаптеры из ответов API в типы компонентов.
// Иконки сервер не отдаёт (это React-компоненты), поэтому маппим их тут по id/категории.

import {
    Inbox, UserX, AlertTriangle, RussianRuble, Gauge,
    Droplet, ArrowUpDown, Flame, Zap, Wrench, Brush, Leaf, Shield,
    CheckCircle2, Send, Vote, Info,
    type LucideIcon,
} from "lucide-react";
import type {
    KpiResponse,
    PriorityTicketsResponse,
    PriorityTicket as ApiTicket,
    CollectionsResponse,
    ComplianceResponse,
    ActivityResponse,
    ActiveVotesResponse,
} from "@/api/managerDashboard.api.ts";
import type {
    HomeStat,
    PriorityTicket,
    CollectionsData,
    ComplianceDeadline,
    ActivityEvent,
    ActiveVote,
} from "./types.ts";

// KPI

const KPI_ICON: Record<string, LucideIcon> = {
    tickets: Inbox,
    unassigned: UserX,
    alerts: AlertTriangle,
    collection: RussianRuble,
    meters: Gauge,
};

export function adaptKpi(api: KpiResponse): HomeStat[] {
    return api.cards.map(c => ({
        id: c.id,
        icon: KPI_ICON[c.id] ?? Inbox,
        accent: c.accent,
        label: c.label,
        value: c.value,
        delta: c.delta,
        deltaDir: c.deltaDir === "flat" ? "up" : c.deltaDir,
        sub: c.sub,
    }));
}

// приоритетные заявки

const CATEGORY_ICON: Record<ApiTicket["category"], {icon: LucideIcon; bg: string; fg: string}> = {
    plumbing: {icon: Droplet, bg: "#e0f2fe", fg: "#0ea5e9"},
    electric: {icon: Zap, bg: "#fef3c7", fg: "#f59e0b"},
    heating: {icon: Flame, bg: "#fef3c7", fg: "#f59e0b"},
    lift: {icon: ArrowUpDown, bg: "#fee2e2", fg: "#ef4444"},
    repair: {icon: Wrench, bg: "#d1fae5", fg: "#047857"},
    cleaning: {icon: Brush, bg: "#d1fae5", fg: "#047857"},
    yard: {icon: Leaf, bg: "#d1fae5", fg: "#047857"},
    security: {icon: Shield, bg: "#ede9fe", fg: "#7c3aed"},
    other: {icon: Wrench, bg: "#f1f5f9", fg: "#64748b"},
};

export function adaptPriorityTickets(api: PriorityTicketsResponse): PriorityTicket[] {
    return api.items.map(t => {
        const cat = CATEGORY_ICON[t.category] ?? CATEGORY_ICON.other;
        return {
            id: t.id,
            title: t.title,
            subTitle: t.subTitle,
            icon: cat.icon,
            iconBg: cat.bg,
            iconFg: cat.fg,
            addr: t.addr,
            assignee: t.assignee ?? "—",
            sla: t.sla,
            slaTone: t.slaTone,
            status: t.status,
            statusTone: t.statusTone,
        };
    });
}

// собираемость

export function adaptCollections(api: CollectionsResponse): CollectionsData {
    return {
        plan: api.plan,
        actualPct: api.actualPct,
        accrued: api.accrued,
        received: api.received,
        debt: api.debt,
        trend: api.trend,
    };
}

// регуляторные сроки

export function adaptCompliance(api: ComplianceResponse): ComplianceDeadline[] {
    return api.items.map(c => ({
        id: c.id,
        category: c.category,
        title: c.title,
        addr: c.addr,
        dueLabel: c.dueLabel,
        daysLeft: c.daysLeft,
        status: c.status,
    }));
}

// лента событий

const ACTIVITY_ICON: Record<string, LucideIcon> = {
    check: CheckCircle2,
    send: Send,
    alert: AlertTriangle,
    vote: Vote,
    gauge: Gauge,
    info: Info,
};
const ACTIVITY_FG: Record<string, string> = {
    emerald: "#047857",
    info: "#0ea5e9",
    warning: "#f59e0b",
    danger: "#ef4444",
    violet: "#7c3aed",
};

export function adaptActivity(api: ActivityResponse): ActivityEvent[] {
    return api.items.map(e => ({
        time: e.time,
        icon: ACTIVITY_ICON[e.icon] ?? Info,
        iconFg: ACTIVITY_FG[e.accent] ?? "#64748b",
        textParts: e.textParts,
    }));
}

// активные голосования

export function adaptActiveVotes(api: ActiveVotesResponse): ActiveVote[] {
    return api.items.map(v => ({
        title: v.title,
        quorum: v.quorum,
        goal: v.goal,
        votes: v.votes,
        tone: v.tone,
    }));
}
