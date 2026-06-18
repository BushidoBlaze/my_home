// Адаптер: превращает ManagerServiceRequest из API в локальную модель Ticket
// и группирует список по статусам в колонки канбана.

import type {ManagerServiceRequest} from "@/api/requests.api.ts";
import type {ChipTone} from "@/apps/manager/pages/home/model/types.ts";
import type {KanbanColumn, Ticket, TicketPriority, TicketType} from "./types.ts";

/** Каноничный порядок и параметры колонок канбана — совпадает со статусами на бэке. */
const COLUMN_DEFS: Array<{status: string; title: string; tone: string; sub?: string}> = [
    {status: "New",        title: "Новые",      tone: "#64748b"},
    {status: "InProgress", title: "В работе",   tone: "#0ea5e9"},
    {status: "Review",     title: "На проверке", tone: "#f59e0b"},
    {status: "Done",       title: "Выполнено сегодня", tone: "#10b981", sub: "автозакрытие через 24 ч"},
];

/** Статус «Assigned» больше не используется (назначение исполнителя убрано) —
 * легаси-заявки в этом статусе показываем как «Новые». */
function normalizeStatus(status: string): string {
    return status === "Assigned" ? "New" : status;
}

/** Категория с бэка → визуальный тип карточки (определяет иконку и цвет). */
function mapCategoryToType(category: string): TicketType {
    const c = (category ?? "").toLowerCase();
    if (c.includes("plumb") || c.includes("сантех") || c.includes("вод")) return "drop";
    if (c.includes("heat")  || c.includes("тепл") || c.includes("отопл")) return "flame";
    if (c.includes("elec")  || c.includes("электр")) return "bolt";
    if (c.includes("lift")  || c.includes("лифт")) return "elevator";
    if (c.includes("clean") || c.includes("уборк")) return "broom";
    if (c.includes("yard")  || c.includes("двор") || c.includes("газон")) return "leaf";
    if (c.includes("secur") || c.includes("безоп") || c.includes("домофон")) return "shield";
    return "wrench";
}

function mapPriority(p: string): TicketPriority {
    const v = (p ?? "").toLowerCase();
    if (v === "high") return "high";
    if (v === "low")  return "low";
    return "med";
}

/** Адрес одной строкой; пропускает пустые сегменты. */
function formatAddress(r: ManagerServiceRequest["resident"]): string {
    const street = r.street?.trim();
    const house = r.house?.trim();
    const apt = r.apartmentNumber?.trim();
    if (!street && !house && !apt) return "Адрес не указан";
    const head = [street, house].filter(Boolean).join(", ");
    return apt ? `${head} · кв. ${apt}` : head;
}

/** Длительность от createdAt до сейчас → короткая метка SLA. */
function formatSla(createdAtIso: string, status: string): {sla: string; tone: ChipTone} {
    if (status === "Done") return {sla: "", tone: ""};

    const ageMs = Date.now() - new Date(createdAtIso).getTime();
    const hours = Math.floor(ageMs / 3_600_000);
    const minutes = Math.floor((ageMs % 3_600_000) / 60_000);
    const days = Math.floor(ageMs / 86_400_000);

    if (days >= 1) {
        return {sla: `${days}д`, tone: days >= 3 ? "danger" : "warning"};
    }
    const text = `${hours}:${minutes.toString().padStart(2, "0")}`;
    if (hours >= 4)  return {sla: text, tone: "warning"};
    return {sla: text, tone: ""};
}

/** Короткий ID для отображения: «Т-XXXX» из первых 4 символов uuid. */
function shortId(id: string): string {
    return `Т-${id.slice(0, 4).toUpperCase()}`;
}

export function adaptRequest(r: ManagerServiceRequest): Ticket {
    const sla = formatSla(r.createdAt, r.status);
    return {
        realId: r.id,
        id: shortId(r.id),
        type: mapCategoryToType(r.category),
        title: r.title,
        addr: formatAddress(r.resident),
        sla: sla.sla,
        slaTone: sla.tone,
        priority: mapPriority(r.priority),
    };
}

/**
 * Фильтрует заявки по выбранному табу. Предикаты опираются только на поля,
 * которые реально приходят с бэка (status, priority, assignee, createdAt).
 */
const OVERDUE_MS = 3 * 86_400_000; // заявка «просрочена», если висит ≥ 3 суток и не закрыта

export function filterRequests(requests: ManagerServiceRequest[], tab: string): ManagerServiceRequest[] {
    switch (tab) {
        case "alerts":
            return requests.filter(r => r.status !== "Done" && (r.priority ?? "").toLowerCase() === "high");
        case "overdue":
            return requests.filter(r => r.status !== "Done" && Date.now() - new Date(r.createdAt).getTime() >= OVERDUE_MS);
        default:
            return requests;
    }
}

/** Группирует все заявки в 5 колонок канбана. */
export function buildKanban(requests: ManagerServiceRequest[]): KanbanColumn[] {
    const byStatus = new Map<string, Ticket[]>();
    for (const def of COLUMN_DEFS) byStatus.set(def.status, []);

    for (const r of requests) {
        const list = byStatus.get(normalizeStatus(r.status));
        if (!list) continue; // незнакомый статус — пропускаем
        list.push(adaptRequest(r));
    }

    return COLUMN_DEFS.map(def => ({
        title: def.title,
        tone: def.tone,
        sub: def.sub,
        count: byStatus.get(def.status)!.length,
        tickets: byStatus.get(def.status)!,
    }));
}

/** Краткая статистика для подзаголовка топбара: «N в работе · M аварий». */
export function buildSubtitle(requests: ManagerServiceRequest[]): string {
    const inProgress = requests.filter(r => r.status === "InProgress").length;
    const emergencies = requests.filter(r => r.status !== "Done" && r.priority === "High").length;
    return `${inProgress} в работе · ${emergencies} аварий`;
}
