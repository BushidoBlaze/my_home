export const WEEKDAY_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] as const;

// "пятница, 23 мая"
export function formatDateRu(date: Date): string {
    return date.toLocaleDateString("ru-RU", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
}

// "23 мая" — короткая форма для списков
export function formatDayMonth(iso: string): string {
    return new Date(iso).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
    });
}

// "23 мая" с полным названием месяца
export function formatLongDayMonth(iso: string): string {
    return new Date(iso).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
    });
}
