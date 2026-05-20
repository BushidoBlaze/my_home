import {
    Home,
    ClipboardList,
    Wallet,
    MessageCircle,
    ShoppingCart,
    Newspaper,
    Settings,
    User,
    HelpCircle,
    LogOut,
    Vote,
    Inbox,
    Gauge,
    Building2,
    Users,
    CreditCard,
    FileText,
} from "lucide-react";
import type {SidebarItem, ManagerMenuGroup} from "./types.ts";

export const RESIDENT_MENU: SidebarItem[] = [
    {icon: Home, path: "/app/home", label: "Главная"},
    {icon: ClipboardList, path: "/app/requests", label: "Заявки"},
    {icon: Wallet, path: "/app/expenses", label: "Расходы"},
    {icon: MessageCircle, path: "/app/chats", label: "Чаты"},
    {icon: Vote, path: "/app/voting", label: "Голосования"},
    {icon: ShoppingCart, path: "/app/marketplace", label: "Маркетплейс"},
    {icon: Newspaper, path: "/app/news", label: "Новости"},
    {icon: Settings, path: "/app/settings", label: "Настройки"},
    {icon: User, path: "/app/account", label: "Аккаунт"},
    {icon: HelpCircle, path: "/app/help", label: "Помощь"},
    {icon: LogOut, path: "/login", label: "Выход"},
];

export const MANAGER_MENU_GROUPS: ManagerMenuGroup[] = [
    {
        title: "Операции",
        items: [
            {id: "home", label: "Дашборд", icon: Home, path: "/manager/home"},
            {id: "tickets", label: "Заявки", icon: Inbox, path: "/manager/tickets", badge: 14},
            {id: "chat", label: "Чат и обращения", icon: MessageCircle, path: "/manager/chat", badge: 3},
            {id: "meter", label: "Показания", icon: Gauge, path: "/manager/meter"},
        ],
    },
    {
        title: "Объекты",
        items: [
            {id: "buildings", label: "Дома и квартиры", icon: Building2, path: "/manager/buildings"},
            {id: "users", label: "Жильцы", icon: Users, path: "/manager/users"},
            {id: "billing", label: "Начисления", icon: CreditCard, path: "/manager/billing"},
        ],
    },
    {
        title: "Сообщество",
        items: [
            {id: "vote", label: "Голосования", icon: Vote, path: "/manager/vote", badge: "new"},
            {id: "report", label: "Отчёты", icon: FileText, path: "/manager/report"},
        ],
    },
];

export const MANAGER_BRAND = {
    name: "Мой Дом",
    subtitle: "УК «Зелёный квартал»",
};

export const MANAGER_USER = {
    name: "Атласов Раян",
    role: "Главный диспетчер",
};
