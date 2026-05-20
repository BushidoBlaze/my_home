import type {LucideIcon} from "lucide-react";
import type {HouseTone} from "@/apps/manager/pages/buildings/model/types.ts";

export type BigStatTone = "emerald" | "info" | "danger";

export type BigStatData = {
    label: string;
    value: string;
    sub: string;
    tone: BigStatTone;
    icon: LucideIcon;
};

export type BillingHouse = {
    addr: string;
    charged: number;
    collected: number;
    debt: number;
    debtors: number;
    pct: number;
    tone: HouseTone;
};

export type StructureItem = {
    color: string;
    label: string;
    value: string;
    pct: number;
};

export type Debtor = {
    name: string;
    addr: string;
    debt: string;
    months: number;
};

export type Payment = {
    time: string;
    payer: string;
    addr: string;
    sum: string;
    channel: string;
};

export type MonthDataPoint = {
    m: string;
    charged: number;
    paid: number;
};
