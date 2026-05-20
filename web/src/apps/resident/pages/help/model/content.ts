import type {HelpContentResponse} from "./types.ts";

export const fallbackHelpContent: HelpContentResponse = {
    contacts: {
        operatorChatTitle: "Чат с оператором",
        operatorChatDescription: "Операторы помогают по заявкам, оплатам и техническим вопросам.",
        operatorChatHours: "Ежедневно с 08:00 до 22:00",
        supportEmail: "support@myhome.app",
        hotlinePhone: "+7 (800) 555-12-34",
    },
    features: [
        {id: "requests", title: "Заявки в УК", description: "Создавайте обращения и отслеживайте этапы их выполнения в реальном времени."},
        {id: "chats", title: "Чаты дома", description: "Общайтесь с соседями, старшими по дому и управляющей компанией в одном месте."},
        {id: "expenses", title: "Расходы и квитанции", description: "Контролируйте начисления, историю платежей и важные финансовые напоминания."},
        {id: "market", title: "Маркетплейс услуг", description: "Заказывайте проверенные услуги для квартиры прямо из приложения."},
        {id: "news", title: "Новости ЖК", description: "Получайте объявления о работах, собраниях и событиях вашего дома."},
        {id: "settings", title: "Гибкие настройки", description: "Настраивайте уведомления, приватность и интерфейс под свои предпочтения."},
    ],
    about: {
        title: "О платформе Мой Дом",
        description: "Мой Дом объединяет жителей и управляющую компанию в едином цифровом пространстве.",
        mission: "Наша цель - сделать управление домом прозрачным, удобным и быстрым для каждого жителя.",
        version: "Web v1.0",
    },
};
