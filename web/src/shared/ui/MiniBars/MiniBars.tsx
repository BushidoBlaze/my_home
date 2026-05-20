import type {JSX} from "react";

interface MiniBarsProps {
    data: number[];
    w?: number;
    h?: number;
    color?: string;
    highlight?: number;
}

export function MiniBars({data, w = 160, h = 44, color = "#10b981", highlight = -1}: MiniBarsProps): JSX.Element {
    const max = Math.max(...data) || 1;
    const bw = w / data.length - 3;

    return (
        <svg width={w} height={h}>
            {data.map((v, i) => {
                const bh = Math.max(2, (v / max) * (h - 4));
                const x = i * (bw + 3);
                const y = h - bh;
                const c = i === highlight ? "#047857" : color;
                return (
                    <rect
                        key={i}
                        x={x}
                        y={y}
                        width={bw}
                        height={bh}
                        rx={2}
                        fill={c}
                        opacity={i === highlight ? 1 : 0.55}
                    />
                );
            })}
        </svg>
    );
}
