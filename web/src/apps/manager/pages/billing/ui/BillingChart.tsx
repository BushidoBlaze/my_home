import type {JSX} from "react";
import {CHART_DATA} from "../model/data.ts";

export default function BillingChart(): JSX.Element {
    const max = Math.max(...CHART_DATA.map(d => d.charged));
    const w = 720;
    const h = 200;
    const pad = 24;
    const gap = 6;
    const groupW = (w - pad * 2) / CHART_DATA.length;
    const barW = (groupW - gap * 2) / 2;

    return (
        <svg
            width="100%"
            height={h + 24}
            viewBox={`0 0 ${w} ${h + 24}`}
            style={{marginTop: 14}}
            preserveAspectRatio="none"
        >
            {[0.25, 0.5, 0.75, 1].map(p => (
                <line
                    key={p}
                    x1={pad}
                    y1={pad + (h - pad) * (1 - p) - pad}
                    x2={w - pad}
                    y2={pad + (h - pad) * (1 - p) - pad}
                    stroke="#f1f5f9"
                    strokeDasharray="3 4"
                />
            ))}
            {CHART_DATA.map((d, i) => {
                const x = pad + groupW * i + gap;
                const cH = (d.charged / max) * (h - pad - 10);
                const pH = (d.paid / max) * (h - pad - 10);
                return (
                    <g key={i}>
                        <rect x={x} y={h - cH} width={barW} height={cH} fill="#0ea5e9" opacity="0.75" rx="3"/>
                        <rect x={x + barW + 4} y={h - pH} width={barW} height={pH} fill="#10b981" rx="3"/>
                        <text
                            x={x + barW + 2}
                            y={h + 16}
                            textAnchor="middle"
                            style={{font: "500 10px 'SF Pro Display', 'SF Pro', 'Inter', system-ui, sans-serif", fill: "#64748b"}}
                        >
                            {d.m}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
