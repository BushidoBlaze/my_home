// Приветствие по локальному времени пользователя.
// 0–5 — ночь, 5–12 — утро, 12–18 — день, 18–24 — вечер.
export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 6) return "Доброй ночи";
    if (hour < 12) return "Доброе утро";
    if (hour < 18) return "Добрый день";
    return "Добрый вечер";
}
