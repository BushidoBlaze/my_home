import type {JSX} from "react";
import {Donut} from "@/shared/ui/Donut/Donut.tsx";
import type {BillingStructureItem} from "@/api/managerBilling.api.ts";

interface Props {
    items: BillingStructureItem[];
}

function moneyShort(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} млн`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)} тыс`;
    return n.toFixed(0);
}

export default function StructureCard({items}: Props): JSX.Element {
    return (
        <div className="card billing-structure">
            <div className="t-h3">Структура начислений</div>
            <div className="billing-structure__sub">по категориям</div>

            <div className="billing-structure__body">
                <Donut
                    size={120}
                    thickness={16}
                    segments={items.map(s => ({value: s.pct, color: s.color}))}
                />
                <div className="billing-structure__legend">
                    {items.map((s, i) => (
                        <div key={i} className="billing-structure__row">
                            <span className="billing-structure__dot" style={{background: s.color}}/>
                            <span className="billing-structure__label">{s.label}</span>
                            <span className="tnum billing-structure__value">{moneyShort(s.amount)}</span>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div style={{color: "#64748b", fontSize: 13}}>
                            Нет начислений за период.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
