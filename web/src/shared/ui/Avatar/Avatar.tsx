import type {JSX} from "react";

const AVATAR_COLORS = [
    "#10b981", "#0ea5e9", "#7c3aed", "#f59e0b",
    "#ef4444", "#14b8a6", "#6366f1", "#db2777",
    "#84cc16", "#f97316",
];

function hashStr(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
}

interface AvatarProps {
    name?: string;
    size?: number;
    src?: string;
}

export function Avatar({name = "?", size = 28, src}: AvatarProps): JSX.Element {
    const initials = name.split(/[ -]/).filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase();
    const color = AVATAR_COLORS[hashStr(name) % AVATAR_COLORS.length];

    return (
        <div
            style={{
                width: size,
                height: size,
                minWidth: size,
                borderRadius: "50%",
                background: src ? "#f1f5f9" : color + "22",
                color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: Math.round(size * 0.42),
                fontWeight: 600,
                letterSpacing: ".02em",
                border: "1px solid #e2e8f0",
                backgroundImage: src ? `url(${src})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {!src && initials}
        </div>
    );
}
