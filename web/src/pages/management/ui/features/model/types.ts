// types.ts — типы данных для FeaturesSection (страница /management)

import type {LucideIcon} from "lucide-react";

/** Одна возможность/фича платформы для управляющей компании */
export interface Feature {
    /** Иконка из lucide-react */
    icon: LucideIcon;
    /** Краткое название функциональности */
    title: string;
    /** Развёрнутое описание */
    description: string;
    /** Цвет иконки (hex) — используется для фона иконки с прозрачностью */
    color: string;
}
