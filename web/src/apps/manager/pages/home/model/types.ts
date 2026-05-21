import type {LucideIcon} from "lucide-react";
import type {StatAccent, DeltaDir} from "@/shared/ui/Stat/Stat.tsx";

export type ChipTone = "" | "emerald" | "info" | "warning" | "danger" | "violet";

export type HomeStat = {
    id: string;
    icon: LucideIcon;
    accent: StatAccent;
    label: string;
    value: string;
    delta: string;
    deltaDir: DeltaDir;
    sub: string;
};

export type PriorityTicket = {
    id: string;
    title: string;
    subTitle: string;
    icon: LucideIcon;
    iconBg: string;
    iconFg: string;
    addr: string;
    assignee: string;
    sla: string;
    slaTone: ChipTone;
    status: string;
    statusTone: ChipTone;
};

export type CollectionsData = {
    plan: number;
    actualPct: number;
    accrued: string;
    received: string;
    debt: string;
    trend: number[];
};

export type TopBuilding = {
    addr: string;
    count: number;
    max: number;
    tone: string;
};

export type ActivityEvent = {
    time: string;
    icon: LucideIcon;
    iconFg: string;
    textParts: Array<{ text: string; muted?: boolean; bold?: boolean }>;
};

export type ActiveVote = {
    title: string;
    quorum: number;
    goal: number;
    votes: string;
    tone: string;
};

export type ComplianceStatus = "burning" | "soon" | "ok";

export type ComplianceDeadline = {
    id: string;
    category: "lift" | "gas" | "fire" | "duct";
    title: string;
    addr: string;
    dueLabel: string;
    daysLeft: number;
    status: ComplianceStatus;
};
