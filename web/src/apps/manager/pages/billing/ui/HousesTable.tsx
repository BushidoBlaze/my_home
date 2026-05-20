import type {JSX} from "react";
import {Filter, Download} from "lucide-react";
import {BuildingSwatch} from "@/shared/ui/BuildingSwatch/BuildingSwatch.tsx";
import {Progress} from "@/shared/ui/Progress/Progress.tsx";
import {BILLING_HOUSES, formatRub} from "../model/data.ts";

const TONE_COLOR: Record<string, string> = {
    danger: "#ef4444",
    warning: "#f59e0b",
    ok: "#10b981",
};

export default function HousesTable(): JSX.Element {
    return (
        <div className="card billing-houses">
            <div className="billing-houses__head">
                <div>
                    <div className="t-h3">Сводка по домам</div>
                    <div className="billing-houses__sub">47 домов · показано 7</div>
                </div>
                <div className="billing-houses__actions">
                    <button className="btn btn--sm btn--ghost">
                        <Filter size={12}/>
                        Фильтры
                    </button>
                    <button className="btn btn--sm">
                        <Download size={12}/>
                        Excel
                    </button>
                </div>
            </div>

            <table className="billing-houses__table">
                <thead>
                    <tr>
                        <th>Дом</th>
                        <th className="billing-houses__th--right">Начислено</th>
                        <th className="billing-houses__th--right">Поступило</th>
                        <th className="billing-houses__th--right">Долг</th>
                        <th className="billing-houses__th--right">Должников</th>
                        <th>Собираемость</th>
                        <th style={{width: 80}}/>
                    </tr>
                </thead>
                <tbody>
                    {BILLING_HOUSES.map((h, i) => (
                        <tr key={i}>
                            <td>
                                <div className="billing-houses__addr">
                                    <BuildingSwatch size={26} color={TONE_COLOR[h.tone]}/>
                                    <span>{h.addr}</span>
                                </div>
                            </td>
                            <td className="tnum billing-houses__td--right">{formatRub(h.charged)}</td>
                            <td className="tnum billing-houses__td--right" style={{color: "#047857", fontWeight: 600}}>
                                {formatRub(h.collected)}
                            </td>
                            <td
                                className="tnum billing-houses__td--right"
                                style={{
                                    color: h.debt ? "#ef4444" : "#64748b",
                                    fontWeight: h.debt ? 600 : 400,
                                }}
                            >
                                {formatRub(h.debt)}
                            </td>
                            <td className="tnum billing-houses__td--right">{h.debtors}</td>
                            <td>
                                <div className="billing-houses__bar">
                                    <div className="billing-houses__bar-fill">
                                        <Progress value={h.pct} max={100} color={TONE_COLOR[h.tone]} h={5}/>
                                    </div>
                                    <span className="tnum billing-houses__pct">{h.pct}%</span>
                                </div>
                            </td>
                            <td>
                                <button className="btn btn--sm btn--ghost">детали</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
