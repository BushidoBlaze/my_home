import type {JSX} from "react";
import {Droplet, Flame, Zap, Snowflake} from "lucide-react";
import {Donut} from "@/shared/ui/Donut/Donut.tsx";
import {Progress} from "@/shared/ui/Progress/Progress.tsx";
import type {MeterSummary} from "@/api/managerMeter.api.ts";

const ICON_BY_CODE: Record<string, typeof Droplet> = {
    ColdWater: Droplet,
    HotWater: Flame,
    Electricity: Zap,
    Gas: Snowflake,
};

interface Props {
    summary: MeterSummary;
}

export default function MetersHero({summary}: Props): JSX.Element {
    return (
        <div className="card meters-hero">
            <Donut
                size={140}
                thickness={18}
                segments={[
                    {value: summary.pct, color: "#10b981"},
                    {value: 100 - summary.pct, color: "#f1f5f9"},
                ]}
                center={{value: `${summary.pct}%`, label: "СОБРАНО"}}
            />

            <div className="meters-hero__main">
                <div className="meters-hero__count-row">
                    <span className="tnum meters-hero__count">{summary.delivered.toLocaleString("ru-RU")}</span>
                    <span className="meters-hero__total tnum">
                        из {summary.apartmentsTotal.toLocaleString("ru-RU")} квартир
                    </span>
                </div>
                <div className="meters-hero__note">
                    Окно приёма — {summary.periodLabel}. До 25-го числа осталось {summary.daysLeft} дн.
                </div>

                <div className="meters-hero__grid">
                    {summary.meterTypes.map((m, i) => {
                        const pct = m.t > 0 ? Math.round((m.n / m.t) * 100) : 0;
                        const Icon = ICON_BY_CODE[m.code] ?? Droplet;
                        return (
                            <div key={i} className="meters-hero__type">
                                <div className="meters-hero__type-head" style={{color: m.color}}>
                                    <Icon size={14}/>
                                    <span className="meters-hero__type-label">{m.label}</span>
                                    <span className="tnum meters-hero__type-pct">{pct}%</span>
                                </div>
                                <div className="tnum meters-hero__type-value">
                                    {m.n.toLocaleString("ru-RU")}
                                    <span className="meters-hero__type-total"> / {m.t.toLocaleString("ru-RU")}</span>
                                </div>
                                <div style={{marginTop: 6}}>
                                    <Progress value={m.n} max={Math.max(m.t, 1)} color={m.color} h={3}/>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
