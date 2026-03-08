import {useState, useMemo} from "react";
import MainTitle from "@/shared/ui/mainTitle/MainTitle.tsx";
import PricingPlans from "./PricingPlans.tsx";
import TariffsTablePossibilities from "./TariffsTablePossibilities.tsx";
import type {Tariff} from "../model/types.ts";
import {TARIFFS_PLANS_CONTENT} from "../model/data.ts";

export default function TariffsSection() {
    // Состояние выбранного тарифа - используем единый тип Tariff
    const [selectedTariff, setSelectedTariff] = useState<Tariff>("base");

    // Находим цену выбранного тарифа
    const currentPrice = useMemo(() => {
        return (
            TARIFFS_PLANS_CONTENT.find(
                (plan) => plan.tariffType === selectedTariff
            )?.tariffPrice ?? 0
        );
    }, [selectedTariff]);

    // Находим объект выбранного тарифа по его типу и получаем его название
    const selectedTariffName =
        TARIFFS_PLANS_CONTENT.find(
            (plan) => plan.tariffType === selectedTariff
        )?.tariffName ?? "";

    return (
        /*data-reveal - data-атрибут, фича для хранения произвольных данных на элементе,*/
        /*используется в глобальном хуке useScrollReveal.ts для плавного скролла секции*/
        <div className="tariffs-section" data-reveal>
            <MainTitle title="Тарифы"/>

            <PricingPlans
                selectedTariff={selectedTariff}
                setSelectedTariff={setSelectedTariff}
                currentPrice={currentPrice}
            />

            <MainTitle title={
                <>
                    Возможности тарифа: <span style={{color: "#4EBA4E"}}>{selectedTariffName}</span>
                </>
            }/>

            <TariffsTablePossibilities selectedTariff={selectedTariff}/>
        </div>
    );
}
