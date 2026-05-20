export function formatTime(date: string) {
    return new Date(date).toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"});
}

export function formatDate(date: string) {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Сегодня";
    if (d.toDateString() === yesterday.toDateString()) return "Вчера";
    return d.toLocaleDateString("ru-RU", {day: "numeric", month: "long"});
}