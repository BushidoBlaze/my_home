import type {JSX} from "react";
import {Check} from "lucide-react";
import {TICKET_STEPS} from "../data/ticketSteps.ts";

interface StepperProps {
    // Индекс текущего шага в TICKET_STEPS (0-based). Шаги до него — done, после — upcoming.
    currentStep: number;
}

// Горизонтальный stepper статуса заявки: 5 точек, соединённых линиями.
// Точки имеют 3 состояния: done (зелёная с галкой), current (белая с обводкой и точкой внутри),
// upcoming (серая). Линия между точками подсвечивается если левая точка не upcoming.
export function Stepper({currentStep}: StepperProps): JSX.Element {
    return (
        <div className="resident-home__stepper">
            {TICKET_STEPS.map((step, i) => {
                const done = i < currentStep;
                const current = i === currentStep;

                // Собираем classNames через массив + filter — чище, чем тернарники-в-строке.
                const dotClass = [
                    "resident-home__step-dot",
                    done && "resident-home__step-dot--done",
                    current && "resident-home__step-dot--current",
                ].filter(Boolean).join(" ");

                const labelClass = [
                    "resident-home__step-label",
                    current && "resident-home__step-label--current",
                ].filter(Boolean).join(" ");

                // Линия между шагами активна, если левый шаг done или current —
                // визуально "тянется" зелёная линия до текущего шага включительно.
                const barClass = [
                    "resident-home__step-bar",
                    (done || current) && "resident-home__step-bar--active",
                ].filter(Boolean).join(" ");

                return (
                    <div key={step.key} className="resident-home__step-wrap">
                        <div className="resident-home__step">
                            <div className={dotClass}>
                                {done && <Check size={12} strokeWidth={3}/>}
                                {current && <span className="resident-home__step-dot-inner"/>}
                            </div>
                            <div className={labelClass}>{step.label}</div>
                        </div>
                        {/* Линию после ПОСЛЕДНЕГО шага не рисуем — она бы вела в пустоту */}
                        {i < TICKET_STEPS.length - 1 && <div className={barClass}/>}
                    </div>
                );
            })}
        </div>
    );
}
