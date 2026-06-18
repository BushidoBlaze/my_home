import type {MarketplaceCategory} from "./types.ts";
import {
    Bubbles,
    Wrench,
    Package,
    Home as HomeIcon,
    Flower,
    BookOpen,
    Sparkles,
    Shapes,
} from "lucide-react";


// Категории маркетплейса
// Добавляй новые здесь — они автоматически появятся в фильтре и в форме создания.
// «Прочее» всегда держим последним — это запасная категория для услуг,
// которым не подошла ни одна из специализированных.
export const CATEGORIES: MarketplaceCategory[] = [
    {id: "Cleaning", label: "Клининг", icon: Bubbles},
    {id: "Repair", label: "Мелкий ремонт", icon: Wrench},
    {id: "Delivery", label: "Доставка", icon: Package},
    {id: "Appliances", label: "Бытовые услуги", icon: HomeIcon},
    {id: "Home", label: "Дом и участок", icon: Flower},
    {id: "Beauty", label: "Красота", icon: Sparkles},
    {id: "Education", label: "Обучение и дети", icon: BookOpen},
    {id: "Other", label: "Прочее", icon: Shapes},
];

// Запасная категория — на неё опирается форма создания услуги по умолчанию.
export const FALLBACK_CATEGORY = "Other";

// Варианты сортировки
export const SORT_OPTIONS = [
    {value: "rating", label: "По рейтингу"},
    {value: "price_asc", label: "Сначала дешевле"},
    {value: "price_desc", label: "Сначала дороже"},
    {value: "new", label: "Новые"}
] as const;

// Статусы заказов
export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
    Pending: {label: "Ожидает", color: "pending"},
    Confirmed: {label: "Подтверждён", color: "confirmed"},
    InProgress: {label: "Выполняется", color: "progress"},
    Done: {label: "Выполнен", color: "done"},
    Cancelled: {label: "Отменён", color: "cancelled"},
};