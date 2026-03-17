import type {DonutSegment, BarItem, ProgressBar} from "./types.ts";

// Преимущества для блока УК
export const UK_FEATURES: string[] = [
    "Автоназначение исполнителей",
    "Дашборды и аналитика",
    "Контроль долгов в реальном времени"
];

// Преимущества для блока ЖК
export const RESIDENTS_FEATURES: string[] = [
    "Оплата ЖКХ без комиссии",
    "Заявка за 30 секунд",
    "Голосования по благоустройству",
    "Маркетплейс услуг"
];

// Данные для donut-диаграммы заявок в блоке УК
export const DONUT_DATA: DonutSegment[] = [
    {
        name: "Открыто",
        value: 24,
        color: "#e8301f"
    },
    {
        name: "В работе",
        value: 48,
        color: "#4EBA4E"
    },
    {
        name: "Закрыто",
        value: 31,
        color: "rgba(245,245,245,0.3)"
    }
];

// Данные для bar-чарта расходов ЖКХ в блоке жильцов
export const BAR_DATA: BarItem[] = [
    {
        month: "Янв",
        value: 3200
    },
    {
        month: "Фев",
        value: 2800
    },
    {
        month: "Мар",
        value: 4100
    },
    {
        month: "Апр",
        value: 3700
    },
    {
        month: "Май",
        value: 4800
    },
    {
        month: "Июн",
        value: 4300
    }
];

// Данные для прогресс-баров в блоке жильцов
export const PROGRESS_BARS: ProgressBar[] = [
    {
        label: "Заявки выполнены",
        value: 94
    },
    {
        label: "Оплата в срок",
        value: 87
    },
    {
        label: "Удовлетворённость",
        value: 98
    }
];