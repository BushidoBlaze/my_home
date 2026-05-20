import type {Poll, ArchivedPoll, VoterEntry, PollResultRow} from "./types.ts";

export const POLLS: Poll[] = [
    {
        id: "p1",
        title: "Установка шлагбаума во дворе",
        house: "Берёзовая, 14",
        type: "Общее собрание",
        status: "идёт",
        statusTone: "emerald",
        quorum: 67,
        quorumGoal: 50,
        votes: {for: 128, against: 9, abstain: 5, total: 212},
        endsIn: "3 дня",
        cover: "emerald",
        selected: true,
    },
    {
        id: "p2",
        title: "Замена входных групп в подъездах",
        house: "Парковая, 7к1 и 7к2",
        type: "Опрос",
        status: "идёт",
        statusTone: "warning",
        quorum: 38,
        quorumGoal: 50,
        votes: {for: 64, against: 12, abstain: 5, total: 212},
        endsIn: "6 дней",
        cover: "warning",
    },
    {
        id: "p3",
        title: "Тариф на содержание жилья с 1 июля",
        house: "Все дома ЖК",
        type: "Общее собрание",
        status: "не наберёт кворум",
        statusTone: "danger",
        quorum: 22,
        quorumGoal: 50,
        votes: {for: 24, against: 21, abstain: 2, total: 212},
        endsIn: "1 день",
        cover: "danger",
    },
];

export const ARCHIVED_POLLS: ArchivedPoll[] = [
    {title: "Кронирование тополей у входа", date: "4 мая", result: "Принято", tone: "emerald", q: 64},
    {title: "Бюджет ремонта подъезда №3", date: "28 апр", result: "Принято", tone: "emerald", q: 71},
    {title: "Велопарковка во дворе", date: "21 апр", result: "Не принято", tone: "danger", q: 38},
];

export const POLL_DETAIL = {
    title: "Установка шлагбаума во дворе",
    description: "Предлагается установить шлагбаум на въезде во двор с управлением через мобильное приложение жильцов. Подрядчик — «ГРАД-Сервис». Стоимость 218 400 ₽, оплата из резервного фонда дома.",
    author: "Ирина Петрова",
    createdAt: "14 мая",
    quorumNow: 67,
    quorumGoal: 50,
    votedCount: 142,
    totalCount: 212,
    metaCards: [
        {label: "ТИП", value: "Общее собрание"},
        {label: "ДОМ", value: "Берёзовая, 14"},
        {label: "ОТКРЫТО", value: "14 мая 18:00"},
        {label: "ДО", value: "21 мая 23:59"},
    ],
};

export const POLL_RESULTS: PollResultRow[] = [
    {label: "За", n: 128, total: 142, color: "#10b981"},
    {label: "Против", n: 9, total: 142, color: "#ef4444"},
    {label: "Воздержались", n: 5, total: 142, color: "#f59e0b"},
];

export const NON_VOTERS: VoterEntry[] = [
    {name: "А. Морозов", apt: "кв. 88", last: "не входил 5 дней"},
    {name: "Г. Степнова", apt: "кв. 64", last: "ждёт уведомления"},
    {name: "ИП Орлова", apt: "нежилое 1-А", last: "—"},
    {name: "В. Захаров", apt: "кв. 22", last: "напомнить"},
    {name: "К. Лебедев", apt: "кв. 17", last: "напомнить"},
];

export const COVER_COLORS: Record<string, { bg1: string; bg2: string }> = {
    emerald: {bg1: "#10b981", bg2: "#065f46"},
    warning: {bg1: "#f59e0b", bg2: "#b45309"},
    danger: {bg1: "#ef4444", bg2: "#7f1d1d"},
};
