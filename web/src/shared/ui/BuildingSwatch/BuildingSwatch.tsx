import type {JSX} from "react";
import {Building2} from "lucide-react";

interface BuildingSwatchProps {
    size?: number;
    color?: string;
    label?: string;
}

export function BuildingSwatch({size = 36, color = "#10b981", label}: BuildingSwatchProps): JSX.Element {
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: 8,
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
                position: "relative",
                border: "1px solid #e2e8f0",
            }}
        >
            <Building2 size={size * 0.55}/>
            {label && (
                <div
                    style={{
                        position: "absolute",
                        right: -2,
                        bottom: -4,
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "1px 4px",
                        background: "#0f172a",
                        color: "#ffffff",
                        borderRadius: 4,
                    }}
                >
                    {label}
                </div>
            )}
        </div>
    );
}
