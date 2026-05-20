import type {JSX} from "react";

export interface DonutSegment {
    value: number;
    color: string;
}

interface DonutProps {
    segments: DonutSegment[];
    size?: number;
    thickness?: number;
    center?: { value: string; label: string };
}

export function Donut({segments, size = 120, thickness = 18, center}: DonutProps): JSX.Element {
    const r = size / 2 - thickness / 2;
    const c = size / 2;
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    let acc = 0;
    const circ = 2 * Math.PI * r;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={c} cy={c} r={r} stroke="#f1f5f9" strokeWidth={thickness} fill="none"/>
            {segments.map((s, i) => {
                const len = (s.value / total) * circ;
                const offset = circ - acc;
                acc += len;
                return (
                    <circle
                        key={i}
                        cx={c}
                        cy={c}
                        r={r}
                        stroke={s.color}
                        strokeWidth={thickness}
                        strokeDasharray={`${len} ${circ - len}`}
                        strokeDashoffset={offset}
                        fill="none"
                        transform={`rotate(-90 ${c} ${c})`}
                        strokeLinecap="butt"
                    />
                );
            })}
            {center && (
                <g>
                    <text
                        x="50%"
                        y="48%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{font: "700 22px 'SF Pro Display', 'SF Pro', 'Inter', system-ui, sans-serif", fill: "#0f172a"}}
                    >
                        {center.value}
                    </text>
                    <text
                        x="50%"
                        y="62%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{font: "500 10px 'SF Pro Display', 'SF Pro', 'Inter', system-ui, sans-serif", fill: "#64748b", letterSpacing: ".08em"}}
                    >
                        {center.label}
                    </text>
                </g>
            )}
        </svg>
    );
}
