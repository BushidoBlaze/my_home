import type {JSX} from "react";

interface ProgressProps {
    value: number;
    max?: number;
    color?: string;
    h?: number;
}

export function Progress({value, max = 100, color = "#1a5c3a", h = 6}: ProgressProps): JSX.Element {
    const percent = Math.min(100, (value / max) * 100);

    return (
        <div style={{
            height: h,
            background: "#e2e8f0",
            borderRadius: 99,
            overflow: "hidden",
        }}>
            <div style={{
                width: `${percent}%`,
                height: "100%",
                background: color,
                borderRadius: 99,
                transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}/>
        </div>
    );
}