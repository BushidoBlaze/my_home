import type {LucideIcon} from "lucide-react";

export type MeterType = {
    icon: LucideIcon;
    label: string;
    n: number;
    t: number;
    color: string;
};

export type MetersHouse = {
    addr: string;
    apts: number;
    done: number;
    pct: number;
    hot: string;
    el: string;
    tone: string;
    flag: string;
};

export type AptStatus = "d" | "n" | "w" | "x" | "u";

export type RecentSubmission = {
    time: string;
    apt: string;
    meter: string;
    val: string;
    prev: string;
    delta: string;
    icon: LucideIcon;
    color: string;
    flag?: string;
};
