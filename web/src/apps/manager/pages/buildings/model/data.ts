import {AlertTriangle, ArrowUpDown} from "lucide-react";
import type {House, HouseTab, HouseAlert, HouseStatusSegment, CouncilMember, PassportRow} from "./types.ts";

export const HOUSES: House[] = [
    {id: "b1", addr: "Берёзовая, 14", year: 1998, apts: 184, area: "12 480 м²", debt: "184 320 ₽", open: 12, tone: "danger", selected: true, flags: ["авария"]},
    {id: "b2", addr: "Берёзовая, 16", year: 2002, apts: 142, area: "9 720 м²", debt: "12 800 ₽", open: 4, tone: "ok", flags: []},
    {id: "b3", addr: "Парковая, 7к1", year: 2014, apts: 220, area: "15 240 м²", debt: "0 ₽", open: 8, tone: "warning", flags: ["лифт"]},
    {id: "b4", addr: "Парковая, 7к2", year: 2014, apts: 220, area: "15 240 м²", debt: "24 100 ₽", open: 3, tone: "ok", flags: []},
    {id: "b5", addr: "Лесная, 2", year: 1983, apts: 96, area: "6 540 м²", debt: "62 400 ₽", open: 6, tone: "warning", flags: ["кап.ремонт"]},
    {id: "b6", addr: "Солнечный, 11", year: 2019, apts: 312, area: "21 800 м²", debt: "8 200 ₽", open: 5, tone: "ok", flags: []},
    {id: "b7", addr: "Зелёная, 3к1", year: 2021, apts: 248, area: "17 200 м²", debt: "0 ₽", open: 2, tone: "ok", flags: ["новый"]},
];

export const SELECTED_STATS = [
    {k: "Этажей", v: "17"},
    {k: "Подъездов", v: "4"},
    {k: "Лифтов", v: "8"},
    {k: "Квартир", v: "184"},
];

export const HOUSE_TABS: HouseTab[] = [
    {label: "Сводка", active: true},
    {label: "Заявки", count: 12},
    {label: "Жильцы"},
    {label: "Финансы"},
    {label: "ОДН"},
    {label: "Документы"},
];

export const HOUSE_ALERTS: HouseAlert[] = [
    {
        title: "Авария на стояке ХВС",
        sub: "Подъезд 4 · вода перекрыта · ETA 14:00",
        icon: AlertTriangle,
        bg: "#ef4444",
        fg: "#ffffff",
    },
    {
        title: "Плановое ТО лифта №4",
        sub: "20 мая · 09:00 – 13:00",
        icon: ArrowUpDown,
        bg: "#fef3c7",
        fg: "#f59e0b",
    },
];

export const HOUSE_FINANCE = [
    {label: "Начислено", value: "1 248 200 ₽"},
    {label: "Собрано", value: "1 063 880 ₽", color: "#047857"},
    {label: "Задолженность", value: "184 320 ₽", color: "#ef4444", highlight: true},
    {label: "Собираемость", value: "85.2%"},
];

export const HOUSE_STATUS: HouseStatusSegment[] = [
    {color: "#10b981", label: "Нет задолженности", count: 114, pct: 62},
    {color: "#f59e0b", label: "Долг < 3 месяцев", count: 39, pct: 21},
    {color: "#ef4444", label: "Долг > 3 месяцев", count: 22, pct: 12},
    {color: "#64748b", label: "Незаселено", count: 9, pct: 5},
];

export const COUNCIL: CouncilMember[] = [
    {name: "С. Власов", role: "Председатель совета", apt: "кв. 41"},
    {name: "Е. Соколова", role: "Совет", apt: "кв. 12"},
    {name: "К. Зайцев", role: "Совет", apt: "кв. 78"},
];

export const PASSPORT: PassportRow[] = [
    {k: "Серия / тип", v: "П-44Т, монолит-кирпич"},
    {k: "Кадастр", v: "77:01:000123:4567"},
    {k: "Кап. ремонт", v: "Фасад: запланирован 2027"},
    {k: "ИТП", v: "Индивидуальный тепловой пункт"},
    {k: "Лифты", v: "8 шт. · KONE · 2014"},
    {k: "Видеонабл.", v: "32 камеры · Hikvision"},
];
