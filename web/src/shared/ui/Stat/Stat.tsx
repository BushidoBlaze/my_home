import type {JSX} from "react";
import {TrendingUp, TrendingDown, type LucideIcon} from "lucide-react";

export type StatAccent = "emerald" | "info" | "warning" | "danger" | "violet";
export type DeltaDir = "up" | "down";

interface StatProps {
    icon: LucideIcon;
    accent?: StatAccent;
    label: string;
    value: string | number;
    delta?: string;
    deltaDir?: DeltaDir;
    sub?: string;
}

const ACCENT_MAP: Record<StatAccent, { bg: string; fg: string }> = {
    emerald: {bg: "#d1fae5", fg: "#047857"},
    info: {bg: "#e0f2fe", fg: "#0ea5e9"},
    warning: {bg: "#fef3c7", fg: "#f59e0b"},
    danger: {bg: "#fee2e2", fg: "#ef4444"},
    violet: {bg: "#ede9fe", fg: "#7c3aed"},
};

const DELTA_BG: Record<DeltaDir, string> = {
    up: "#d1fae5",
    down: "#fee2e2",
};

export function Stat({icon: Icon, accent = "emerald", label, value, delta, deltaDir = "up", sub}: StatProps): JSX.Element {
    const a = ACCENT_MAP[accent];
    const DeltaIcon = deltaDir === "up" ? TrendingUp : TrendingDown;

    return (
        <div className="card" style={{padding: 18, display: "flex", flexDirection: "column", gap: 14}}>
            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: a.bg,
                        color: a.fg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon size={18}/>
                </div>
                {delta && (
                    <div
                        className={"chip " + (deltaDir === "up" ? "chip--emerald" : "chip--danger")}
                        style={{background: DELTA_BG[deltaDir]}}
                    >
                        <DeltaIcon size={12}/>
                        {delta}
                    </div>
                )}
            </div>
            <div>
                <div style={{color: "#64748b", fontSize: 12.5, marginBottom: 6}}>{label}</div>
                <div className="tnum" style={{fontSize: 26, fontWeight: 700, letterSpacing: "-.02em"}}>{value}</div>
                {sub && <div style={{color: "#64748b", fontSize: 12, marginTop: 6}}>{sub}</div>}
            </div>
        </div>
    );
}
