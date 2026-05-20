import {Droplet, Flame, Zap, ArrowUpDown, Wrench, Brush, Leaf, Shield} from "lucide-react";
import type {TicketType, TicketTypeMeta, KanbanColumn} from "./types.ts";

export const KANBAN_TYPES: Record<TicketType, TicketTypeMeta> = {
    drop: {icon: Droplet, bg: "#e0f2fe", fg: "#0ea5e9", label: "Сантехника"},
    flame: {icon: Flame, bg: "#fef3c7", fg: "#f59e0b", label: "Тепло"},
    bolt: {icon: Zap, bg: "#fef3c7", fg: "#f59e0b", label: "Электрика"},
    elevator: {icon: ArrowUpDown, bg: "#fee2e2", fg: "#ef4444", label: "Лифт"},
    wrench: {icon: Wrench, bg: "#d1fae5", fg: "#047857", label: "Ремонт"},
    broom: {icon: Brush, bg: "#d1fae5", fg: "#047857", label: "Уборка"},
    leaf: {icon: Leaf, bg: "#d1fae5", fg: "#047857", label: "Двор"},
    shield: {icon: Shield, bg: "#ede9fe", fg: "#7c3aed", label: "Безопасность"},
};

export const KANBAN_COLUMNS: KanbanColumn[] = [
    {
        title: "Новые",
        count: 14,
        tone: "#64748b",
        sub: "не назначен исполнитель",
        tickets: [
            {id: "Т-4467", type: "bolt", title: "Не работает домофон 1-го подъезда", addr: "Лесная, 2", sla: "2:50", slaTone: "warning", priority: "med", assignee: null, attachments: 0, comments: 1},
            {id: "Т-4465", type: "bolt", title: "Шум в подвале — гудит насос", addr: "Берёзовая, 14", sla: "3:21", slaTone: "warning", priority: "med", assignee: null, attachments: 2, comments: 0},
            {id: "Т-4454", type: "shield", title: "Замена огнетушителей в подъезде", addr: "Лесная, 2", sla: "12:00", slaTone: "", priority: "low", assignee: null, attachments: 0, comments: 0},
            {id: "Т-4452", type: "leaf", title: "Спилить сухую ветку у входа", addr: "Берёзовая, 16", sla: "1д", slaTone: "", priority: "low", assignee: null, attachments: 1, comments: 0},
            {id: "Т-4449", type: "broom", title: "Грязь после ремонта в подъезде №2", addr: "Парковая, 7к1", sla: "1д", slaTone: "", priority: "low", assignee: null, attachments: 3, comments: 2},
        ],
    },
    {
        title: "Назначены",
        count: 22,
        tone: "#7c3aed",
        tickets: [
            {id: "Т-4470", type: "elevator", title: "Отказ лифта №2", addr: "Парковая, 7к1", sla: "0:42", slaTone: "warning", priority: "high", assignee: "Лифт-СТО", attachments: 0, comments: 3},
            {id: "Т-4459", type: "broom", title: "Уборка после ремонта 4-й этаж", addr: "Берёзовая, 14 · п.1", sla: "завтра", slaTone: "", priority: "low", assignee: "Клин-Сервис", attachments: 2, comments: 1},
            {id: "Т-4455", type: "shield", title: "Проверка пожарного гидранта", addr: "Парковая, 7к1", sla: "4:30", slaTone: "", priority: "med", assignee: "Е. Сидоров", attachments: 0, comments: 0},
            {id: "Т-4451", type: "leaf", title: "Посадка цветов у входа", addr: "Солнечный, 11", sla: "2д", slaTone: "", priority: "low", assignee: "Двор-Сервис", attachments: 1, comments: 0},
        ],
    },
    {
        title: "В работе",
        count: 52,
        tone: "#0ea5e9",
        tickets: [
            {id: "Т-4471", type: "drop", title: "Течь стояка ХВС — авария", addr: "Берёзовая, 14 · кв. 56", sla: "−2:14", slaTone: "danger", priority: "high", assignee: "А. Громов", attachments: 4, comments: 7},
            {id: "Т-4468", type: "flame", title: "Нет ГВС по стояку", addr: "Парковая, 7к1 · п.3", sla: "1:08", slaTone: "warning", priority: "high", assignee: "М. Иванов", attachments: 2, comments: 4},
            {id: "Т-4462", type: "wrench", title: "Замена дверного доводчика", addr: "Лесная, 2", sla: "сегодня", slaTone: "", priority: "low", assignee: "А. Громов", attachments: 0, comments: 1},
            {id: "Т-4445", type: "leaf", title: "Покос газона по фасаду", addr: "Солнечный, 11", sla: "сегодня", slaTone: "", priority: "low", assignee: "Двор-Сервис", attachments: 0, comments: 0},
        ],
    },
    {
        title: "Ждут жильца",
        count: 12,
        tone: "#f59e0b",
        tickets: [
            {id: "Т-4456", type: "drop", title: "Не идёт холодная вода (нужен доступ)", addr: "Берёзовая, 16 · кв. 12", sla: "ждёт 1ч", slaTone: "warning", priority: "med", assignee: "М. Иванов", attachments: 0, comments: 2},
            {id: "Т-4440", type: "wrench", title: "Замер окон под замену", addr: "Лесная, 2 · кв. 31", sla: "ждёт 4ч", slaTone: "", priority: "low", assignee: "Ока-Окна", attachments: 1, comments: 1},
            {id: "Т-4432", type: "bolt", title: "Замена УЗО — нужен доступ в щиток", addr: "Берёзовая, 14 · подъезд 2", sla: "ждёт 2д", slaTone: "danger", priority: "med", assignee: "Е. Сидоров", attachments: 0, comments: 5},
        ],
    },
    {
        title: "Готово сегодня",
        count: 89,
        tone: "#10b981",
        sub: "автозакрытие через 24 ч",
        tickets: [
            {id: "Т-4458", type: "bolt", title: "Заменили светильник в подъезде", addr: "Лесная, 2 · п.1", sla: "✓ 09:42", slaTone: "", priority: "low", assignee: "Е. Сидоров", attachments: 1, comments: 0},
            {id: "Т-4450", type: "drop", title: "Замена смесителя в МОП", addr: "Парковая, 7к1", sla: "✓ 10:30", slaTone: "", priority: "low", assignee: "А. Громов", attachments: 2, comments: 1},
            {id: "Т-4446", type: "broom", title: "Уборка снега у входа", addr: "Солнечный, 11", sla: "✓ 08:15", slaTone: "", priority: "low", assignee: "Двор-Сервис", attachments: 0, comments: 0},
            {id: "Т-4442", type: "elevator", title: "Регулировка дверей лифта", addr: "Парковая, 7к1", sla: "✓ вчера", slaTone: "", priority: "med", assignee: "Лифт-СТО", attachments: 0, comments: 2},
        ],
    },
];

export const FILTER_TABS = [
    {id: "all", label: "Все"},
    {id: "mine", label: "Мои"},
    {id: "alerts", label: "Аварийные"},
    {id: "overdue", label: "Просроченные"},
    {id: "unassigned", label: "Без исполнителя"},
];
