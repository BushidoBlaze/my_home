import React from "react";
import {CircleCheck, CircleMinus} from "lucide-react";
import type {Tariff} from "../model/types.ts";
import {TARIFFS_POSSIBILITIES} from "../model/data.ts";

// Пропсы — нам нужен только выбранный тариф
interface TariffsTablePossibilitiesProps {
    selectedTariff: Tariff;
}

export default function TariffsTablePossibilities({selectedTariff}: TariffsTablePossibilitiesProps) {
    // Получаем уникальные категории
    const categories = Array.from(
        new Set(
            TARIFFS_POSSIBILITIES.map(
                (item) => item.title
            )
        )
    );

    return (
        /*data-reveal - data-атрибут, фича для хранения произвольных данных на элементе,*/
        /*используется в глобальном хуке useScrollReveal.ts для плавного скролла секции*/
        <div className="tariffs-possibilities-tables" data-reveal>
            <table className="tariffs-table">
                <tbody>
                {categories.map((category) => (
                    <React.Fragment key={category}>
                        {/*Заголовок категории*/}
                        <tr>
                            <td colSpan={2} className="tariffs-table__category-title">
                                {category}
                            </td>
                        </tr>

                        {/* Возможности категории */}
                        {TARIFFS_POSSIBILITIES
                            .filter(
                                (item) => item.title === category
                            )
                            .map((item, index) => {

                                // Проверяем доступность
                                const isAvailable = item.available[selectedTariff];

                                return (
                                    <tr key={`${category}-${index}`} className="tariffs-table__row">
                                        <td className="tariffs-table__feature">
                                            {item.possible}
                                        </td>

                                        <td>
                                            {isAvailable ? (
                                                <CircleCheck
                                                    className="tariffs-table__icon tariffs-table__icon--available"/>
                                            ) : (
                                                <CircleMinus
                                                    className="tariffs-table__icon tariffs-table__icon--unavailable"/>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
        </div>
    );
}
