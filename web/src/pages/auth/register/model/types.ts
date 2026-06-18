import type {LucideIcon} from "lucide-react";

// Режим экрана регистрации — выбирается переключателем ролей наверху формы
export type RegisterMode = "resident" | "manager";

// Карточка преимущества на брендовой панели (одинаковая структура для жителя и УК)
export interface RegisterFeature {
    id: number;
    icon: LucideIcon;
    title: string;
    subtitle: string;
}
