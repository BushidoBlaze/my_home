import type {JSX} from "react";
import {Check} from "lucide-react";
import {APT_STATUSES, APT_COLORS} from "../model/data.ts";

function Legend({swatch, label}: { swatch: string; label: string }): JSX.Element {
    return (
        <span className="meters-apts__legend-item">
            <span className="meters-apts__legend-swatch" style={{background: swatch}}/>
            {label}
        </span>
    );
}

export default function ApartmentGrid(): JSX.Element {
    return (
        <div>
            <div className="meters-apts__legend">
                <Legend swatch="#10b981" label="передано"/>
                <Legend swatch="#f1f5f9" label="не передано"/>
                <Legend swatch="#f59e0b" label="подозрит."/>
                <Legend swatch="#ef4444" label="нет ИПУ"/>
                <Legend swatch="#64748b" label="незаселено"/>
            </div>

            <div className="meters-apts__head">
                <span className="meters-apts__head-spacer"/>
                {Array.from({length: 12}, (_, i) => (
                    <span key={i} className="meters-apts__head-cell">кв.{i + 1}</span>
                ))}
            </div>

            {Array.from({length: 5}, (_, floor) => (
                <div key={floor} className="meters-apts__row">
                    <span className="tnum meters-apts__row-label">{17 - floor} эт</span>
                    {Array.from({length: 12}, (_, i) => {
                        const s = APT_STATUSES[floor * 12 + i];
                        const c = APT_COLORS[s] || APT_COLORS.d;
                        return (
                            <div
                                key={i}
                                className="meters-apts__cell"
                                style={{background: c.bg, opacity: c.op}}
                            >
                                {s === "d" && (
                                    <Check
                                        size={9}
                                        strokeWidth={3}
                                        style={{color: "#ffffff", position: "absolute", inset: 0, margin: "auto", display: "block"}}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}

            <div className="meters-apts__foot">
                <span>Подъезд 4 · 5 этажей · 60 квартир показано</span>
                <span>↓ показать ещё 12 этажей</span>
            </div>
        </div>
    );
}
