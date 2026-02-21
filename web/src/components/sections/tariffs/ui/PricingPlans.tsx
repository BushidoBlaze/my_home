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
        <div className="plans-and-pricing-section">
            <div className="plans-section">
                <p className="designation-text">Тариф</p>

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
                <p className="designation-text">Цена</p>
                <span className="price">{currentPrice} ₽</span>
            </div>
        </div>
    );
}