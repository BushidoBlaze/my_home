import {RussianRuble, CheckCircle2, AlertTriangle, TrendingUp} from "lucide-react";
import type {
    BigStatData,
    BillingHouse,
    StructureItem,
    Debtor,
    Payment,
    MonthDataPoint,
} from "./types.ts";

export const BIG_STATS: BigStatData[] = [
    {label: "НАЧИСЛЕНО", value: "14 244 100 ₽", sub: "9 412 лиц. счетов", tone: "info", icon: RussianRuble},
    {label: "ПОСТУПИЛО", value: "13 023 580 ₽", sub: "8 920 платежей", tone: "emerald", icon: CheckCircle2},
    {label: "ЗАДОЛЖЕННОСТЬ", value: "1 220 520 ₽", sub: "312 должников", tone: "danger", icon: AlertTriangle},
    {label: "СОБИРАЕМОСТЬ", value: "91.4%", sub: "план 92%", tone: "emerald", icon: TrendingUp},
];

export const BILLING_HOUSES: BillingHouse[] = [
    {addr: "Берёзовая, 14", charged: 1248200, collected: 1063880, debt: 184320, debtors: 22, pct: 85.2, tone: "danger"},
    {addr: "Берёзовая, 16", charged: 891400, collected: 878600, debt: 12800, debtors: 3, pct: 98.6, tone: "ok"},
    {addr: "Парковая, 7к1", charged: 1684500, collected: 1684500, debt: 0, debtors: 0, pct: 100, tone: "ok"},
    {addr: "Парковая, 7к2", charged: 1684500, collected: 1660400, debt: 24100, debtors: 5, pct: 98.6, tone: "ok"},
    {addr: "Лесная, 2", charged: 612400, collected: 550000, debt: 62400, debtors: 14, pct: 89.8, tone: "warning"},
    {addr: "Солнечный, 11", charged: 2188900, collected: 2180700, debt: 8200, debtors: 4, pct: 99.6, tone: "ok"},
    {addr: "Зелёная, 3к1", charged: 1742100, collected: 1742100, debt: 0, debtors: 0, pct: 100, tone: "ok"},
];

export const STRUCTURE: StructureItem[] = [
    {color: "#10b981", label: "Содержание", value: "5.42 млн", pct: 38},
    {color: "#0ea5e9", label: "Отопление", value: "3.41 млн", pct: 24},
    {color: "#f59e0b", label: "ХВС / ГВС", value: "2.57 млн", pct: 18},
    {color: "#7c3aed", label: "Эл-во ОДН", value: "1.71 млн", pct: 12},
    {color: "#64748b", label: "Прочее", value: "1.14 млн", pct: 8},
];

export const DEBTORS: Debtor[] = [
    {name: "А. Морозов", addr: "Берёзовая, 14 · кв. 88", debt: "42 800 ₽", months: 4},
    {name: "Семья Петровых", addr: "Берёзовая, 14 · кв. 56", debt: "31 200 ₽", months: 3},
    {name: "В. Захаров", addr: "Лесная, 2 · кв. 22", debt: "28 400 ₽", months: 5},
    {name: "ИП Орлова", addr: "Парковая, 7к2 · нежилое", debt: "24 100 ₽", months: 2},
];

export const PAYMENTS: Payment[] = [
    {time: "11:42", payer: "О. Кузнецова", addr: "Берёзовая, 14 · кв. 56", sum: "4 320 ₽", channel: "СберPay"},
    {time: "11:38", payer: "К. Зайцев", addr: "Лесная, 2 · кв. 12", sum: "3 180 ₽", channel: "Карта"},
    {time: "11:21", payer: "ТСЖ «Б-14»", addr: "Берёзовая, 14", sum: "184 100 ₽", channel: "1С Бух"},
    {time: "11:14", payer: "Е. Соколова", addr: "Берёзовая, 14 · кв. 12", sum: "5 240 ₽", channel: "СБП"},
    {time: "10:58", payer: "С. Власов", addr: "Берёзовая, 14 · кв. 41", sum: "4 980 ₽", channel: "Карта"},
];

export const CHART_DATA: MonthDataPoint[] = [
    {m: "июн", charged: 11.2, paid: 10.5},
    {m: "июл", charged: 10.4, paid: 9.8},
    {m: "авг", charged: 10.6, paid: 10.2},
    {m: "сен", charged: 11.8, paid: 11.1},
    {m: "окт", charged: 12.6, paid: 12.0},
    {m: "ноя", charged: 13.4, paid: 12.5},
    {m: "дек", charged: 14.1, paid: 13.0},
    {m: "янв", charged: 14.6, paid: 13.4},
    {m: "фев", charged: 14.2, paid: 13.4},
    {m: "мар", charged: 13.8, paid: 12.9},
    {m: "апр", charged: 13.6, paid: 13.1},
    {m: "май", charged: 14.2, paid: 13.0},
];

export function formatRub(n: number): string {
    return n.toLocaleString("ru-RU") + " ₽";
}
