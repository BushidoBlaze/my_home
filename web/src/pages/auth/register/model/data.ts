import {Zap, CreditCard, ClipboardList, ListChecks, BarChart3, Wallet, Building2} from "lucide-react";
import type {RegisterFeature} from "./types.ts";

// Преимущества для жителя (ЖК) — показываются на брендовой панели
export const RESIDENT_FEATURES: RegisterFeature[] = [
    {
        id: 1,
        icon: Zap,
        title: "Передача показаний",
        subtitle: "Одним движением — фото счётчика или ручной ввод",
    },
    {
        id: 2,
        icon: CreditCard,
        title: "Оплата без комиссии",
        subtitle: "Картой, СБП, через Госуслуги — все начисления в одном чеке",
    },
    {
        id: 3,
        icon: ClipboardList,
        title: "Заявки 24 / 7",
        subtitle: "Сантехник, электрик, уборка — статус в реальном времени",
    },
    {
        id: 4,
        icon: ListChecks,
        title: "Голосования и опросы",
        subtitle: "Юридически значимые решения собрания собственников",
    },
];

// Преимущества для управляющей компании (УК) — показываются на графитовой панели
export const MANAGER_FEATURES: RegisterFeature[] = [
    {
        id: 1,
        icon: ClipboardList,
        title: "Диспетчерская",
        subtitle: "SLA, маршрутизация по бригадам, фото-отчёты от мастеров",
    },
    {
        id: 2,
        icon: BarChart3,
        title: "Аналитика и KPI",
        subtitle: "Дашборды по домам, расходам, оплачиваемости — в реальном времени",
    },
    {
        id: 3,
        icon: Wallet,
        title: "Биллинг и взыскания",
        subtitle: "Импорт начислений, эквайринг и автоматизация задолженностей",
    },
    {
        id: 4,
        icon: Building2,
        title: "Несколько домов",
        subtitle: "Один портал на весь фонд — без переключения учёток",
    },
];
