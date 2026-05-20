import {Droplet} from "lucide-react";
import type {Conversation, ProfileRow, OpenTicket, HistoryItem} from "./types.ts";

export const CONVERSATIONS: Conversation[] = [
    {
        id: "c1",
        name: "Ольга Кузнецова",
        addr: "Берёзовая, 14 · кв. 56",
        last: "Спасибо! Бригада уже работает.",
        time: "11:42",
        unread: 0,
        selected: true,
        tag: {label: "Т-4471", tone: "danger"},
        status: "live",
    },
    {
        id: "c2",
        name: "Аноним из 88-й",
        addr: "Берёзовая, 14 · кв. 88",
        last: "У меня ничего не капает, отстаньте",
        time: "11:31",
        unread: 2,
        tag: {label: "Долг 4 мес", tone: "warning"},
        status: "live",
    },
    {
        id: "c3",
        name: "Сергей Власов",
        addr: "Берёзовая, 14 · совет",
        last: "Когда подключим домофон?",
        time: "10:58",
        unread: 1,
        status: "live",
    },
    {
        id: "c4",
        name: "Е. Соколова",
        addr: "Берёзовая, 14 · кв. 12",
        last: "Получила, спасибо!",
        time: "10:42",
        unread: 0,
        status: "live",
    },
    {
        id: "c5",
        name: "Чат «Парковая, 7к1»",
        addr: "групповой · 18 человек",
        last: "А. Громов: лифт перезапустили, проверьте",
        time: "10:14",
        unread: 8,
        group: true,
        status: "live",
    },
    {
        id: "c6",
        name: "К. Зайцев",
        addr: "Лесная, 2 · кв. 78",
        last: "Окно когда замерят?",
        time: "вчера",
        unread: 0,
        tag: {label: "Т-4440", tone: "info"},
        status: "live",
    },
    {
        id: "c7",
        name: "Анна Лебедева",
        addr: "Берёзовая, 16 · кв. 12",
        last: "Перезвоните после 19:00",
        time: "вчера",
        unread: 0,
        status: "waiting",
    },
    {
        id: "c8",
        name: "В. Захаров",
        addr: "Лесная, 2 · кв. 22",
        last: "Платёж задержу",
        time: "вт",
        unread: 0,
        tag: {label: "Долг 5 мес", tone: "danger"},
        status: "live",
    },
];

export const ACTIVE_CONTACT = {
    name: "Ольга Кузнецова",
    addr: "Берёзовая, 14 · кв. 56",
};

export const PROFILE_ROWS: ProfileRow[] = [
    {k: "Лиц. счёт", v: "07-14-056-3"},
    {k: "Тип", v: "Собственник"},
    {k: "Площадь", v: "62.4 м² · 2 чел."},
    {k: "В доме с", v: "июня 2019"},
    {k: "Долг", v: "0 ₽", tone: "ok"},
    {k: "NPS", v: "9 / 10"},
];

export const OPEN_TICKETS: OpenTicket[] = [
    {
        id: "Т-4471",
        title: "Т-4471 · Течь стояка ХВС",
        assignee: "А. Громов · в работе",
        icon: Droplet,
        iconBg: "#e0f2fe",
        iconFg: "#0ea5e9",
    },
];

export const HISTORY: HistoryItem[] = [
    {id: "Т-4002", title: "Замена смесителя в ванной", date: "март", tone: "#047857"},
    {id: "Т-3920", title: "Прорыв шланга стиральной", date: "март", tone: "#047857"},
    {id: "Т-3411", title: "Подтекает сифон", date: "янв", tone: "#047857"},
];
