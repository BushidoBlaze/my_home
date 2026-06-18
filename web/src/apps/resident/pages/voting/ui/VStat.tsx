import type {JSX} from "react";
import type {LucideIcon} from "lucide-react";

type VStatTone = "emerald" | "violet" | "info" | "default";

interface VStatProps {
    icon:  LucideIcon;
    tone:  VStatTone;
    label: string;
    value: string | number;
    sub?:  string;
}

// Stat colors match tokens.css palette (emerald / violet / info / mute).
const TONE: Record<VStatTone, {color: string; bg: string}> = {
    emerald: {color: "#047857", bg: "rgba(4, 120, 87, 0.12)"},
    violet:  {color: "#7c3aed", bg: "rgba(124, 58, 237, 0.12)"},
    info:    {color: "#1d4ed8", bg: "rgba(29, 78, 216, 0.12)"},
    default: {color: "#3f4b44", bg: "rgba(63, 75, 68, 0.12)"},
};

export function VStat({icon: Icon, tone, label, value, sub}: VStatProps): JSX.Element {
    const {color, bg} = TONE[tone];

    return (
        <div className="voting-page__vstat">
            <div className="voting-page__vstat-row">
                <div
                    className="voting-page__vstat-icon"
                    style={{background: bg, color}}
                >
                    <Icon size={19}/>
                </div>
                <div className="voting-page__vstat-body">
                    <div className="voting-page__vstat-label">{label}</div>
                    <div className="tnum voting-page__vstat-value">{value}</div>
                </div>
            </div>
            {sub && <div className="voting-page__vstat-sub">{sub}</div>}
        </div>
    );
}
