// Бэк возвращает относительные пути вида "/avatars/<guid>.jpg",
// которые лежат в wwwroot ASP.NET API, а не во фронте. Дополняем их до полного URL.
// Если avatarUrl уже абсолютный (http/https) — отдаём как есть.

const API_URL = import.meta.env.VITE_API_URL ?? "";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function resolveAvatarUrl(avatarUrl?: string | null): string | undefined {
    if (!avatarUrl) return undefined;
    if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;
    return `${API_ORIGIN}${avatarUrl}`;
}
