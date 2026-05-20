import {Wrench, AlertTriangle, Check, Phone, Users} from "lucide-react";
import type {TimelineEvent, RelatedTicket, SopItem} from "./types.ts";

export const TICKET_INFO = {
    id: "Т-4471",
    title: "Течь стояка ХВС — авария",
    description: "Жилец сообщил, что в санузле капает с потолка. Соседи сверху — Морозовы — пока не открывают. Под потолком в коридоре вздулась штукатурка. Просят перекрыть стояк по подъезду до выяснения.",
    slaBreach: "SLA нарушен на 2 часа 14 минут",
    slaNote: "Аварийная заявка должна закрываться за 4 часа. Уведомление эскалировано руководителю.",
    photos: 4,
};

export const TIMELINE_EVENTS: TimelineEvent[] = [
    {
        time: "11:42",
        actor: "А. Громов",
        icon: Wrench,
        iconBg: "#e0f2fe",
        iconFg: "#0ea5e9",
        title: "Бригада прибыла на объект",
        body: "Перекрыли стояк ХВС в подъезде 4. Снимаю фото места течи.",
    },
    {
        time: "11:15",
        actor: "Система",
        icon: AlertTriangle,
        iconBg: "#fee2e2",
        iconFg: "#ef4444",
        title: "SLA нарушен",
        body: "Эскалация → Ирина Петрова (главный диспетчер).",
    },
    {
        time: "10:58",
        actor: "И. Петрова",
        icon: Check,
        iconBg: "#f1f5f9",
        iconFg: "#334155",
        title: "Заявка обновлена",
        body: "Статус: «Назначена» → «В работе». Исполнитель: А. Громов.",
    },
    {
        time: "10:12",
        actor: "А. Громов",
        icon: Phone,
        iconBg: "#d1fae5",
        iconFg: "#047857",
        title: "Позвонил жильцу",
        body: "Подтвердил доступ в квартиру и подъезд. Соседей сверху нет дома.",
    },
    {
        time: "09:48",
        actor: "И. Петрова",
        icon: Users,
        iconBg: "#f1f5f9",
        iconFg: "#334155",
        title: "Назначен исполнитель",
        body: "А. Громов (Сантехник). SLA 4 часа.",
    },
    {
        time: "09:34",
        actor: "О. Кузнецова",
        icon: Phone,
        iconBg: "#f1f5f9",
        iconFg: "#334155",
        title: "Создана заявка по звонку",
        body: "Капает с потолка в санузле, у соседей сверху никого. Просят перекрыть стояк.",
    },
];

export const RELATED_TICKETS: RelatedTicket[] = [
    {id: "Т-4438", title: "Течь под раковиной (тот же стояк)", date: "2 дня назад"},
    {id: "Т-3920", title: "Замена врезки ХВС", date: "март"},
];

export const SOP_CHECKLIST: SopItem[] = [
    {text: "Перекрыть стояк по подъезду", done: true},
    {text: "Уведомить соседей сверху", done: true},
    {text: "Сфотографировать место течи", done: true},
    {text: "Заменить аварийный участок", done: false},
    {text: "Запустить стояк и проверить", done: false},
    {text: "Подписать акт у жильца", done: false},
];

export const PROPERTIES = {
    category: "Сантехника",
    channel: "Звонок",
    created: "18 мая · 09:34",
    deadline: "18 мая · 13:34",
    sopId: "SOP-WTR-001",
};

export const ADDRESS_INFO = {
    addr: "ул. Берёзовая, 14",
    sub: "Подъезд 4 · 12-й этаж · квартира 56",
};

export const RESIDENT_INFO = {
    name: "Ольга Кузнецова",
    role: "Собственник · 6 лет",
    debt: "Долг 0 ₽",
    ticketsPerYear: "Заявок за год: 4",
    nps: "NPS 9",
};

export const ASSIGNEE_INFO = {
    name: "А. Громов",
    fullName: "Алексей Громов",
    role: "Сантехник · в работе с 11:08",
    loadCurrent: 3,
    loadMax: 5,
    avgTime: "средн. 1:24",
};
