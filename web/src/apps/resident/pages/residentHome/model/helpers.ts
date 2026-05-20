export function getStatusLabel(status: string) {
    const map: Record<string, string> = {
        New: "Новая",
        InProgress: "В работе",
        Done: "Выполнена",
    };
    return map[status] || status;
}

export function getCategoryLabel(category: string) {
    const map: Record<string, string> = {
        Repair: "Ремонт",
        Cleaning: "Уборка",
        Maintenance: "Обслуживание",
    };
    return map[category] || category;
}

export function getProgress(status: string) {
    if (status === "Done") return 100;
    if (status === "InProgress") return 65;
    return 25;
}

export function getEta(createdAt: string, status: string) {
    if (status === "Done") return "Выполнена";
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const passedDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    if (status === "InProgress") {
        const etaDays = Math.max(1, 3 - passedDays);
        return `Ориентир: ${etaDays} дн.`;
    }
    const etaDays = Math.max(1, 5 - passedDays);
    return `Ориентир: до ${etaDays} дн.`;
}

export function getGreeting() {
    const hour = new Date().getHours();
    return hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
}
