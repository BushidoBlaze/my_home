import type {JSX} from "react";
import type {LucideIcon} from "lucide-react";

type Tone = "emerald" | "info" | "danger";

const TONE_MAP: Record<Tone, {bg: string; fg: string}> = {
    emerald: {bg: "#d1fae5", fg: "#047857"},
    info: {bg: "#e0f2fe", fg: "#0ea5e9"},
    danger: {bg: "#fee2e2", fg: "#ef4444"},
};

interface Props {
    label: string;
    value: string;
    sub: string;
    tone: Tone;
    icon: LucideIcon;
}

export default function BigStat({label, value, sub, tone, icon: Icon}: Props): JSX.Element {
    const t = TONE_MAP[tone];
    return (
        <div className="card billing-bigstat">
            <div className="billing-bigstat__head">
                <div className="t-eyebrow">{label}</div>
                <div className="billing-bigstat__icon" style={{background: t.bg, color: t.fg}}>
                    <Icon size={16}/>
                </div>
            </div>
            <div className="tnum billing-bigstat__value">{value}</div>
            <div className="billing-bigstat__sub">{sub}</div>
        </div>
    );
}
