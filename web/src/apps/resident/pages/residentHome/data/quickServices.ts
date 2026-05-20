import type {QuickService} from "../model/types.ts";

export const quickServices: QuickService[] = [
    {id: "new-request", label: "Новая заявка", to: "/app/requests", icon: "wrench"},
    {id: "chat", label: "Чат с УК", to: "/app/chats", icon: "chat"},
    {id: "expenses", label: "Оплата ЖКУ", to: "/app/expenses", icon: "wallet"},
    {id: "marketplace", label: "Услуги и мастера", to: "/app/marketplace", icon: "marketplace"},
];
