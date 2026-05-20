import {useState, useMemo, useCallback} from "react";
import type {Tariff, TariffsPlansStateProps} from "../model/types.ts";
import {TARIFFS_PLANS_CONTENT} from "../model/data.ts";

export default function useTariffSelection() {
    // Состояние выбранного тарифа
    const [selectedTariff, setSelectedTariff] = useState<Tariff>("base");

    // Вычисляем цену выбранного тарифа
    const currentPrice = useMemo(() => {
        return (
            TARIFFS_PLANS_CONTENT.find(
                (plan) => plan.tariffType === selectedTariff
            )?.tariffPrice ?? 0
        );
    }, [selectedTariff]);

    // Проверка доступности функции
    const isAvailable = useCallback(
        (feature: TariffsPlansStateProps) => {
            return feature.available[selectedTariff];
        },
        [selectedTariff]
    );

    // Возвращаем API хука
    return {
        selectedTariff,
        setSelectedTariff,
        currentPrice,
        isAvailable
    } as const;
}