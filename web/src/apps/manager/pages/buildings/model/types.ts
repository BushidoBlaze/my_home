export type HouseTone = "ok" | "warning" | "danger";

export type House = {
    id: string;
    addr: string;
    year: number;
    apts: number;
    area: string;
    debt: string;
    open: number;
    tone: HouseTone;
    selected?: boolean;
    flags: string[];
};

export type HouseTab = {
    label: string;
    active?: boolean;
    count?: number;
};

import type {LucideIcon} from "lucide-react";

export type HouseAlert = {
    title: string;
    sub: string;
    icon: LucideIcon;
    bg: string;
    fg: string;
};

export type HouseStatusSegment = {
    color: string;
    label: string;
    count: number;
    pct: number;
};

export type CouncilMember = {
    name: string;
    role: string;
    apt: string;
};

export type PassportRow = {
    k: string;
    v: string;
};
