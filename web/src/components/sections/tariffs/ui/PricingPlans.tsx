import {Star, Landmark} from "lucide-react";
import type {Tariff} from "../model/types.ts";
import {TARIFFS_PLANS_CONTENT} from "../model/data.ts";
import "./Tariffs.css";

interface PricingPlansProps {
    selectedTariff: Tariff; // текущий выбранный тариф
    setSelectedTariff: (tariff: Tariff) => void; // функция изменения
    currentPrice: number; // текущая цена
}
export default function PricingPlans({selectedTariff, setSelectedTariff, currentPrice}: PricingPlansProps) {
    return (
        /*data-reveal - data-атрибут, фича для хранения произвольных данных на элементе,*/
        /*используется в глобальном хуке useScrollReveal.ts для плавного скролла секции*/
        <div className="plans-and-pricing-section" data-reveal>
            <div className="plans-section">
                <p className="designation-text">
                    Тариф
                    <Star strokeWidth={1.25}/>
                </p>

                {/*КНОПКИ ТАРИФОВ*/}
                {TARIFFS_PLANS_CONTENT.map((plan) => (
                    <button
                        key={plan.tariffType}

                        //Активный класс если тариф выбран
                        className={`plans-button ${selectedTariff === plan.tariffType ? "plans-button--active" : ""}`}

                        //При клике меняем состояние
                        onClick={() => setSelectedTariff(plan.tariffType)}
                    >
                        {plan.tariffName}
                    </button>
                ))}
            </div>

            {/*ОТОБРАЖЕНИЕ ЦЕНЫ*/}
            <div className="pricing-section">
                <p className="designation-text">
                    Цена
                    <Landmark strokeWidth={1.25} />
                </p>
                <span className="price">{currentPrice} ₽</span>
            </div>
        </div>
    );
}