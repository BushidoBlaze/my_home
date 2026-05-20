/* ============================================================
   types.ts — типы данных для BenefitsSection (страница /residents)
   ============================================================ */

import type { LucideIcon } from "lucide-react";

/** Одно преимущество платформы для жителя */
export interface Benefit {
    /** Иконка из lucide-react */
    icon: LucideIcon;
    /** Краткое название преимущества */
    title: string;
    /** Развёрнутое описание */
    description: string;
    /**
     * Текст бейджа (например "Бесплатно", "Новое").
     * null — бейдж не отображается
     */
    badge: string | null;
}
