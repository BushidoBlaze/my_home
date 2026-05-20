import type {JSX} from "react";
import {Donut} from "@/shared/ui/Donut/Donut.tsx";
import {Progress} from "@/shared/ui/Progress/Progress.tsx";
import {METER_TYPES, COLLECTION_PCT, COLLECTION_COUNT, COLLECTION_TOTAL} from "../model/data.ts";

export default function MetersHero(): JSX.Element {
    return (
        <div className="card meters-hero">
            <Donut
                size={140}
                thickness={18}
                segments={[
                    {value: COLLECTION_PCT, color: "#10b981"},
                    {value: 100 - COLLECTION_PCT, color: "#f1f5f9"},
                ]}
                center={{value: `${Math.round(COLLECTION_PCT)}%`, label: "СОБРАНО"}}
            />

            <div className="meters-hero__main">
                <div className="meters-hero__count-row">
                    <span className="tnum meters-hero__count">{COLLECTION_COUNT.toLocaleString("ru-RU")}</span>
                    <span className="meters-hero__total tnum">из {COLLECTION_TOTAL.toLocaleString("ru-RU")}</span>
                </div>
                <div className="meters-hero__note">
                    Передано 84 показания за последний час. До конца окна — 14 дней.
                </div>

                <div className="meters-hero__grid">
                    {METER_TYPES.map((m, i) => {
                        const pct = Math.round((m.n / m.t) * 100);
                        const MeterIcon = m.icon;
                        return (
                            <div key={i} className="meters-hero__type">
                                <div className="meters-hero__type-head" style={{color: m.color}}>
                                    <MeterIcon size={14}/>
                                    <span className="meters-hero__type-label">{m.label}</span>
                                    <span className="tnum meters-hero__type-pct">{pct}%</span>
                                </div>
                                <div className="tnum meters-hero__type-value">
                                    {m.n.toLocaleString("ru-RU")}
                                    <span className="meters-hero__type-total"> / {m.t.toLocaleString("ru-RU")}</span>
                                </div>
                                <div style={{marginTop: 6}}>
                                    <Progress value={m.n} max={m.t} color={m.color} h={3}/>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
