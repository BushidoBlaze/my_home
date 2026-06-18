import {useEffect, useState, type JSX} from "react";
import {User} from "lucide-react";

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
    // Что показывать, когда фото нет (или не загрузилось):
    // "initials" — буквы имени (по умолчанию, удобно для списков людей),
    // "icon" — нейтральная иконка пользователя.
    fallback?: "initials" | "icon";
}

export function Avatar({name = "?", size = 28, src, fallback = "initials"}: AvatarProps): JSX.Element {
    const initials = name.split(/[ -]/).filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase();
    const color = AVATAR_COLORS[hashStr(name) % AVATAR_COLORS.length];

    // Когда src приходит позже первого рендера (профиль догружается асинхронно),
    // сбрасываем флаг ошибки, чтобы новая картинка попыталась загрузиться.
    const [errored, setErrored] = useState(false);
    useEffect(() => {
        setErrored(false);
    }, [src]);

    const showImage = Boolean(src) && !errored;

    return (
        <div
            style={{
                width: size,
                height: size,
                minWidth: size,
                borderRadius: "50%",
                background: color + "22",
                color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: Math.round(size * 0.42),
                fontWeight: 600,
                letterSpacing: ".02em",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
            }}
        >
            {showImage ? (
                <img
                    key={src}
                    src={src}
                    alt={name}
                    onError={() => setErrored(true)}
                    style={{width: "100%", height: "100%", objectFit: "cover", display: "block"}}
                />
            ) : fallback === "icon" ? (
                <User size={Math.round(size * 0.55)} strokeWidth={1.8}/>
            ) : (
                initials
            )}
        </div>
    );
}
