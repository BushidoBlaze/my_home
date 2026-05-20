import type {LucideIcon} from "lucide-react";

// Категория маркетплейса
export interface MarketplaceCategory {
    id: string;
    label: string;
    icon: LucideIcon;
}

// Услуга в списке
export interface MarketplaceService {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    imageUrl?: string;
    rating: number;
    reviewsCount: number;
    provider: {
        id: string;
        fullName: string;
        avatarUrl?: string;
    };
}

// Детали услуги с отзывами
export interface ServiceDetail extends MarketplaceService {
    provider: {
        id: string;
        fullName: string;
        avatarUrl?: string;
        phone?: string;
    };
    reviews: ServiceReview[];
}

// Отзыв на услугу
export interface ServiceReview {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    resident: {
        fullName: string;
        avatarUrl?: string;
    };
}

// Заказ услуги
export interface ServiceOrder {
    id: string;
    status: string;
    comment?: string;
    scheduledAt: string;
    createdAt: string;
    service: {
        id: string;
        title: string;
        category: string;
        price: number;
        imageUrl?: string;
        provider: { fullName: string };
    };
}

// Фильтры и сортировка
export type SortOption = "rating" | "price_asc" | "price_desc" | "new";