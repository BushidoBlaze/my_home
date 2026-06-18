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
    Megaphone,
} from "lucide-react";
import type {SidebarItem, ManagerMenuGroup} from "./types.ts";

export const RESIDENT_MENU: SidebarItem[] = [
    {icon: Home, path: "/resident/home", label: "Главная"},
    {icon: Wallet, path: "/resident/expenses", label: "Расходы"},
    {icon: ClipboardList, path: "/resident/requests", label: "Заявки"},
    {icon: MessageCircle, path: "/resident/chats", label: "Чаты"},
    {icon: Vote, path: "/resident/voting", label: "Голосования"},
    {icon: ShoppingCart, path: "/resident/marketplace", label: "Маркетплейс"},
    {icon: Newspaper, path: "/resident/news", label: "Новости УК", badge: "new"},
];

/** Нижний блок резидент-сайдбара: профиль, помощь, выход. */
export const RESIDENT_MENU_BOTTOM: SidebarItem[] = [
    {icon: User, path: "/resident/account", label: "Профиль"},
    {icon: Settings, path: "/resident/settings", label: "Настройки"},
    {icon: HelpCircle, path: "/resident/help", label: "Помощь"},
    {icon: LogOut, path: "/login", label: "Выход"},
];

export const MANAGER_MENU_GROUPS: ManagerMenuGroup[] = [
    {
        title: "Операции",
        items: [
            {id: "home", label: "Дашборд", icon: Home, path: "/manager/home"},
            {id: "tickets", label: "Заявки", icon: Inbox, path: "/manager/tickets"},
            {id: "chat", label: "Чат и обращения", icon: MessageCircle, path: "/manager/chat"},
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
            {id: "vote", label: "Голосования", icon: Vote, path: "/manager/vote"},
            {id: "news", label: "Новости", icon: Megaphone, path: "/manager/news"},
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
