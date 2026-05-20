import type {JSX} from "react";
import {Donut} from "@/shared/ui/Donut/Donut.tsx";
import {STRUCTURE} from "../model/data.ts";

export default function StructureCard(): JSX.Element {
    return (
        <div className="card billing-structure">
            <div className="t-h3">Структура начислений</div>
            <div className="billing-structure__sub">Май 2026</div>

            <div className="billing-structure__body">
                <Donut
                    size={120}
                    thickness={16}
                    segments={STRUCTURE.map(s => ({value: s.pct, color: s.color}))}
                />
                <div className="billing-structure__legend">
                    {STRUCTURE.map((s, i) => (
                        <div key={i} className="billing-structure__row">
                            <span className="billing-structure__dot" style={{background: s.color}}/>
                            <span className="billing-structure__label">{s.label}</span>
                            <span className="tnum billing-structure__value">{s.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
