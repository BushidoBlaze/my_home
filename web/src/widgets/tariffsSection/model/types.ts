export type Tariff = "base" | "medium" | "ultra";

export interface TariffsPlansProps {
    tariffName: string;
    tariffType: Tariff; // Тип тарифа (ключ)
    tariffPrice: number;
}

export interface TariffsPlansStateProps {
    title: string; // Категория
    possible: string; // Описание возможности
    available: Record<Tariff, boolean>; // Тарифы включающие possible в зависимости от true | false
}