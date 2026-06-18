import type {JSX} from "react";
import {Filter, Download} from "lucide-react";
import {BuildingSwatch} from "@/shared/ui/BuildingSwatch/BuildingSwatch.tsx";
import {Progress} from "@/shared/ui/Progress/Progress.tsx";
import type {BillingHouseRow} from "@/api/managerBilling.api.ts";

const TONE_COLOR: Record<BillingHouseRow["tone"], string> = {
    danger: "#ef4444",
    warning: "#f59e0b",
    ok: "#10b981",
};

function rub(n: number): string {
    return n.toLocaleString("ru-RU", {maximumFractionDigits: 0}) + " ₽";
}

interface Props {
    houses: BillingHouseRow[];
}

export default function HousesTable({houses}: Props): JSX.Element {
    return (
        <div className="card billing-houses">
            <div className="billing-houses__head">
                <div>
                    <div className="t-h3">Сводка по домам</div>
                    <div className="billing-houses__sub">
                        {houses.length} {pluralRu(houses.length, "дом", "дома", "домов")}
                    </div>
                </div>
                <div className="billing-houses__actions">
                    <button className="btn btn--sm btn--ghost" disabled>
                        <Filter size={12}/> Фильтры
                    </button>
                    <button className="btn btn--sm" disabled>
                        <Download size={12}/> Excel
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
                        <th>Собираемость</th>
                        <th style={{width: 80}}/>
                    </tr>
                </thead>
                <tbody>
                    {houses.map(h => (
                        <tr key={h.id}>
                            <td>
                                <div className="billing-houses__addr">
                                    <BuildingSwatch size={26} color={TONE_COLOR[h.tone]}/>
                                    <span>{h.addr}</span>
                                </div>
                            </td>
                            <td className="tnum billing-houses__td--right">{rub(h.charged)}</td>
                            <td className="tnum billing-houses__td--right" style={{color: "#047857", fontWeight: 600}}>
                                {rub(h.paid)}
                            </td>
                            <td
                                className="tnum billing-houses__td--right"
                                style={{
                                    color: h.debt ? "#ef4444" : "#64748b",
                                    fontWeight: h.debt ? 600 : 400,
                                }}
                            >
                                {rub(h.debt)}
                            </td>
                            <td>
                                <div className="billing-houses__bar">
                                    <div className="billing-houses__bar-fill">
                                        <Progress value={h.collectionPct} max={100} color={TONE_COLOR[h.tone]} h={5}/>
                                    </div>
                                    <span className="tnum billing-houses__pct">{h.collectionPct.toFixed(1)}%</span>
                                </div>
                            </td>
                            <td>
                                <button className="btn btn--sm btn--ghost" disabled>детали</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function pluralRu(n: number, one: string, few: string, many: string): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
}
