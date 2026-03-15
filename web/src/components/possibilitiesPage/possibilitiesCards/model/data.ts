import {
    ClipboardList, BarChart2, Vote, ShoppingBag, LineChart, Zap,
    MessageSquare, FileText, Calendar, Star, Users, Wrench
} from "lucide-react";
import type {PossibilityCardProps} from "./type.ts";

//Карточки возможностей
export const POSSIBILITIES_CARDS: PossibilityCardProps[] = [
    {
        icon: ClipboardList,
        title: "Подача заявок онлайн",
        description: "Ремонт, уборка, обслуживание — заявка за 30 секунд. Статус обновляется в реальном времени.",
        tag: "Жильцы"
    },
    {
        icon: BarChart2,
        title: "Прозрачные расходы",
        description: "Все платежи и сборы в виде понятных диаграмм. Ничего скрытого — только факты.",
        tag: "Жильцы"
    },
    {
        icon: Vote,
        title: "Голосования и опросы",
        description: "Решения по благоустройству без собраний. Проголосовал — увидел результат.",
        tag: "Жильцы"
    },
    {
        icon: ShoppingBag,
        title: "Маркетплейс услуг",
        description: "Клининг, доставка, мелкий ремонт от проверенных подрядчиков вашего дома.",
        tag: "Жильцы"
    },
    {
        icon: LineChart,
        title: "Аналитика и дашборды",
        description: "Полная картина по заявкам, долгам и расходам. Grafana-интеграция из коробки.",
        tag: "УК"
    },
    {
        icon: Zap,
        title: "Автоматизация процессов",
        description: "Автоназначение исполнителей, напоминания, шаблоны — рутина исчезает сама.",
        tag: "УК"
    },
    {
        icon: MessageSquare,
        title: "Чат с управляющей компанией",
        description: "Задайте вопрос диспетчеру прямо из приложения. Ответ приходит в уведомлении.",
        tag: "Жильцы"
    },
    {
        icon: FileText,
        title: "Квитанции и акты онлайн",
        description: "Все документы в одном месте. Скачать, распечатать или отправить — за секунду.",
        tag: "Жильцы"
    },
    {
        icon: Calendar,
        title: "Плановые работы",
        description: "Расписание отключений воды, лифта, уборки подъездов. Всё заранее и в приложении.",
        tag: "Жильцы"
    },
    {
        icon: Star,
        title: "Оценка исполнителей",
        description: "После закрытия заявки оцените мастера. Рейтинг влияет на приоритет назначений.",
        tag: "Жильцы"
    },

    {
        icon: Users,
        title: "Управление жильцами",
        description: "Полная база с историей заявок, задолженностями и контактами. Поиск за секунду.",
        tag: "УК"
    },
    {
        icon: Wrench,
        title: "Диспетчеризация заявок",
        description: "Назначайте исполнителей вручную или автоматически по правилам и загруженности.",
        tag: "УК"
    }
];