import type {JSX} from "react";

export interface DonutSegment {
    v: number;
    c: string;
    l: string;
}

interface DonutBigProps {
    segments: DonutSegment[];
    total:    string;
    monthLabel: string;
}

// Donut chart with center total and month label.
export function DonutBig({segments, total, monthLabel}: DonutBigProps): JSX.Element {
    const size      = 140;
    const thickness = 22;
    const r         = size / 2 - thickness / 2;
    const c         = size / 2;
    const sum       = segments.reduce((a, b) => a + b.v, 0) || 1;
    const circ      = 2 * Math.PI * r;

    let acc = 0;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segments.map((s, i) => {
                const len    = (s.v / sum) * circ;
                const offset = -acc;
                acc += len;
                return (
                    <circle
                        key={i}
                        cx={c}
                        cy={c}
                        r={r}
                        stroke={s.c}
                        strokeWidth={thickness}
                        strokeDasharray={`${len} ${circ - len}`}
                        strokeDashoffset={offset}
                        fill="none"
                        transform={`rotate(-90 ${c} ${c})`}
                    />
                );
            })}
            <text
                x={c}
                y={c - 2}
                textAnchor="middle"
                style={{
                    font: `700 18px "Onest", "Inter", sans-serif`,
                    fill: "#0e1f17",
                    letterSpacing: "-.02em",
                }}
            >
                {total}
            </text>
            <text
                x={c}
                y={c + 16}
                textAnchor="middle"
                style={{
                    font: `500 10px "Onest", "Inter", sans-serif`,
                    fill: "#6a766f",
                    letterSpacing: ".08em",
                }}
            >
                {monthLabel}
            </text>
        </svg>
    );
}
