import {Droplet, Flame, Zap, Snowflake} from "lucide-react";
import type {MeterType, MetersHouse, AptStatus, RecentSubmission} from "./types.ts";

export const METER_TYPES: MeterType[] = [
    {icon: Droplet, label: "ХВС", n: 1290, t: 1900, color: "#0ea5e9"},
    {icon: Flame, label: "ГВС", n: 1216, t: 1900, color: "#f59e0b"},
    {icon: Zap, label: "Эл-во", n: 802, t: 1950, color: "#7c3aed"},
    {icon: Snowflake, label: "Газ", n: 104, t: 120, color: "#334155"},
];

export const METERS_HOUSES: MetersHouse[] = [
    {addr: "Берёзовая, 14", apts: 184, done: 142, pct: 77, hot: "142/184", el: "98/184", tone: "#10b981", flag: ""},
    {addr: "Берёзовая, 16", apts: 142, done: 138, pct: 97, hot: "138/142", el: "112/142", tone: "#10b981", flag: ""},
    {addr: "Парковая, 7к1", apts: 220, done: 102, pct: 46, hot: "102/220", el: "84/220", tone: "#f59e0b", flag: "медленно"},
    {addr: "Парковая, 7к2", apts: 220, done: 188, pct: 85, hot: "188/220", el: "162/220", tone: "#10b981", flag: ""},
    {addr: "Лесная, 2", apts: 96, done: 32, pct: 33, hot: "32/96", el: "18/96", tone: "#ef4444", flag: "риск"},
    {addr: "Солнечный, 11", apts: 312, done: 220, pct: 70, hot: "220/312", el: "168/312", tone: "#10b981", flag: ""},
    {addr: "Зелёная, 3к1", apts: 248, done: 240, pct: 96, hot: "240/248", el: "212/248", tone: "#10b981", flag: ""},
];

export const APT_STATUSES: AptStatus[] = [
    "d", "n", "d", "d", "d", "n", "d", "d", "n", "d", "d", "d",
    "w", "d", "d", "n", "d", "d", "d", "d", "d", "n", "d", "d",
    "d", "u", "d", "d", "d", "d", "d", "n", "d", "d", "d", "d",
    "d", "d", "d", "d", "n", "d", "d", "d", "n", "d", "d", "d",
    "d", "d", "d", "x", "d", "d", "n", "d", "d", "d", "d", "d",
];

export const APT_COLORS: Record<AptStatus, { bg: string; op: number }> = {
    d: {bg: "#10b981", op: 1},
    n: {bg: "#f1f5f9", op: 1},
    w: {bg: "#f59e0b", op: 1},
    x: {bg: "#ef4444", op: 1},
    u: {bg: "#64748b", op: 0.3},
};

export const RECENT_SUBMISSIONS: RecentSubmission[] = [
    {time: "11:42", apt: "Берёзовая, 14 · кв. 56", meter: "ХВС-12455", val: "00214.5", prev: "00208.7", delta: "+5.8 м³", icon: Droplet, color: "#0ea5e9"},
    {time: "11:38", apt: "Лесная, 2 · кв. 12", meter: "Эл-04812", val: "08214", prev: "08070", delta: "+144 кВт", icon: Zap, color: "#7c3aed"},
    {time: "11:21", apt: "Парковая, 7к1 · кв. 38", meter: "ГВС-09112", val: "00185.2", prev: "00181.4", delta: "+3.8 м³", icon: Flame, color: "#f59e0b"},
    {time: "11:14", apt: "Берёзовая, 14 · кв. 12", meter: "ХВС-12422", val: "00342.0", prev: "00335.4", delta: "+6.6 м³", icon: Droplet, color: "#0ea5e9"},
    {time: "10:58", apt: "Берёзовая, 14 · кв. 41", meter: "Эл-04781", val: "12480", prev: "12180", delta: "+300 кВт", icon: Zap, color: "#7c3aed", flag: "проверить"},
    {time: "10:42", apt: "Солнечный, 11 · кв. 88", meter: "ГВС-15021", val: "00084.2", prev: "00080.4", delta: "+3.8 м³", icon: Flame, color: "#f59e0b"},
];

export const COLLECTION_PCT = 58.1;
export const COLLECTION_COUNT = 3412;
export const COLLECTION_TOTAL = 5870;
