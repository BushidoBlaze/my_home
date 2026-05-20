import type {JSX} from "react";

interface ProgressProps {
    value: number;
    max?: number;
    color?: string;
    h?: number;
}

export function Progress({value, max = 100, color = "#10b981", h = 6}: ProgressProps): JSX.Element {
    return (
        <div style={{height: h, background: "#f1f5f9", borderRadius: 99, overflow: "hidden"}}>
            <div
                style={{
                    width: `${Math.min(100, (value / max) * 100)}%`,
                    height: "100%",
                    background: color,
                }}
            />
        </div>
    );
}
