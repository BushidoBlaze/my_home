/* ============================================================
   data.ts — данные для FeaturesSection (страница /management)
   Список ключевых возможностей платформы для УК
   ============================================================ */

import type {Feature} from "./types.ts";
import {
    ClipboardList,
    BarChart2,
    MessageCircle,
    Bell,
    Shield,
    Settings,
} from "lucide-react";

/** Массив фич платформы для управляющих компаний */
export const MANAGEMENT_FEATURES: Feature[] = [
    {
        icon: ClipboardList,
        title: "Единый журнал заявок",
        description:
            "Все заявки жильцов в одном месте. Статусы, исполнители, сроки — без Excel и мессенджеров.",
        color: "#3b82f6",
    },
    {
        icon: BarChart2,
        title: "Аналитика и отчёты",
        description:
            "Расходы, динамика заявок, эффективность сотрудников. Экспорт в PDF одной кнопкой.",
        color: "#f59e0b",
    },
    {
        icon: MessageCircle,
        title: "Чаты с жильцами",
        description:
            "Групповые чаты по подъездам, личные сообщения. Жильцы всегда на связи.",
        color: "#1f7a5a",
    },
    {
        icon: Bell,
        title: "Push-уведомления",
        description:
            "Мгновенные оповещения о новых заявках, просроченных задачах и важных событиях.",
        color: "#8b5cf6",
    },
    {
        icon: Shield,
        title: "Контроль безопасности",
        description:
            "Журнал доступа, уведомления о нештатных ситуациях, интеграция с видеонаблюдением.",
        color: "#ef4444",
    },
    {
        icon: Settings,
        title: "Гибкая настройка",
        description:
            "Настройте роли, права доступа и рабочие процессы под специфику вашего ЖК.",
        color: "#10b981",
    },
];
