import type {JSX} from "react";
import {Droplet, Flame, Zap, Snowflake, Gauge} from "lucide-react";
import type {MeterRecentItem} from "@/api/managerMeter.api.ts";

interface IconMeta {
    icon: typeof Droplet;
    color: string;
}

function pickIcon(meterType: string): IconMeta {
    const t = meterType.toLowerCase();
    if (t.includes("hot")    || t.includes("гвс") || t.includes("горяч")) return {icon: Flame,     color: "#f59e0b"};
    if (t.includes("cold")   || t.includes("хвс") || t.includes("холод")) return {icon: Droplet,   color: "#0ea5e9"};
    if (t.includes("electr") || t.includes("эл"))                          return {icon: Zap,       color: "#7c3aed"};
    if (t.includes("gas")    || t.includes("газ"))                         return {icon: Snowflake, color: "#334155"};
    return {icon: Gauge, color: "#64748b"};
}

function formatTime(iso: string): string {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
        return d.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"});
    }
    return d.toLocaleDateString("ru-RU", {day: "2-digit", month: "short"});
}

interface Props {
    items: MeterRecentItem[];
}

export default function RecentSubmissions({items}: Props): JSX.Element {
    return (
        <div className="card meters-recent">
            <div className="meters-recent__head">
                <div className="t-h3">Последние показания</div>
                <div className="meters-recent__sub">
                    {items.length > 0 ? `${items.length} последних` : "Пока нет принятых показаний"}
                </div>
            </div>

            <div className="meters-recent__list">
                {items.map(r => {
                    const meta = pickIcon(r.meterType);
                    const SubIcon = meta.icon;
                    return (
                        <div key={r.id} className="meters-recent__item">
                            <div
                                className="meters-recent__icon"
                                style={{
                                    background: `rgba(${parseInt(meta.color.slice(1, 3), 16)}, ${parseInt(meta.color.slice(3, 5), 16)}, ${parseInt(meta.color.slice(5, 7), 16)}, 0.12)`,
                                    color: meta.color,
                                }}
                            >
                                <SubIcon size={15}/>
                            </div>
                            <div className="meters-recent__main">
                                <div className="tnum meters-recent__meta">
                                    {formatTime(r.createdAt)} · {r.meterType}
                                </div>
                                <div className="meters-recent__apt">{r.addr}</div>
                            </div>
                            <div className="meters-recent__values">
                                <div className="tnum mono meters-recent__val">
                                    {r.value.toLocaleString("ru-RU", {maximumFractionDigits: 2})}
                                </div>
                                <div className="tnum meters-recent__delta" style={{color: "#64748b"}}>
                                    {r.fullName}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {items.length === 0 && (
                    <div style={{padding: 24, textAlign: "center", color: "#64748b", fontSize: 13}}>
                        Показаний за этот период пока не поступало.
                    </div>
                )}
            </div>
        </div>
    );
}
