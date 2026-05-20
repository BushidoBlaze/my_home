import type {JSX} from "react";
import type {BigStatData, BigStatTone} from "../model/types.ts";

const TONE_MAP: Record<BigStatTone, { bg: string; fg: string }> = {
    emerald: {bg: "#d1fae5", fg: "#047857"},
    info: {bg: "#e0f2fe", fg: "#0ea5e9"},
    danger: {bg: "#fee2e2", fg: "#ef4444"},
};

export default function BigStat({stat}: { stat: BigStatData }): JSX.Element {
    const t = TONE_MAP[stat.tone];
    const StatIcon = stat.icon;

    return (
        <div className="card billing-bigstat">
            <div className="billing-bigstat__head">
                <div className="t-eyebrow">{stat.label}</div>
                <div className="billing-bigstat__icon" style={{background: t.bg, color: t.fg}}>
                    <StatIcon size={16}/>
                </div>
            </div>
            <div className="tnum billing-bigstat__value">{stat.value}</div>
            <div className="billing-bigstat__sub">{stat.sub}</div>
        </div>
    );
}
