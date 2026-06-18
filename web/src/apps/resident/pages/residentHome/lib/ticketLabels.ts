// Русские подписи статусов и категорий заявок, плюс мок-прогресс для UI.
// При появлении реального процента выполнения от бэка getProgress можно убрать.

const STATUS_LABEL: Record<string, string> = {
    New: "Новая",
    Assigned: "Назначена",
    InProgress: "В работе",
    Review: "Проверка",
    Done: "Выполнена",
};

const CATEGORY_LABEL: Record<string, string> = {
    Repair: "Ремонт",
    Cleaning: "Уборка",
    Maintenance: "Обслуживание",
};

export function getStatusLabel(status: string): string {
    return STATUS_LABEL[status] || status;
}

export function getCategoryLabel(category: string): string {
    return CATEGORY_LABEL[category] || category;
}

export function getProgress(status: string): number {
    if (status === "Done") return 100;
    if (status === "Review") return 85;
    if (status === "InProgress") return 65;
    if (status === "Assigned") return 40;
    return 15;
}
