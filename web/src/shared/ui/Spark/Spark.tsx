import type {JSX} from "react";

interface SparkProps {
    data: number[];
    color?: string;
    w?: number;
    h?: number;
    fill?: boolean;
}

export function Spark({data, color = "#10b981", w = 140, h = 40, fill = true}: SparkProps): JSX.Element | null {
    if (!data.length) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1 || 1);
    const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 4) - 2] as const);
    const d = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
    const area = d + ` L ${w},${h} L 0,${h} Z`;

    return (
        <svg width={w} height={h} className="spark">
            {fill && <path d={area} fill={color} opacity=".10" stroke="none"/>}
            <path d={d} stroke={color} strokeWidth="1.8" fill="none"/>
        </svg>
    );
}
