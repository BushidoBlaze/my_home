/* ============================================================
   HowItWorksSection — секция "Как начать" страницы /residents
   3 карточки в ряд с большими стилизованными цифрами,
   заголовками и описаниями. Между карточками — стрелки.
   ============================================================ */

import MainTitle from "@/shared/ui/mainTitle/MainTitle.tsx";
import { HOW_IT_WORKS_STEPS } from "../model/data.ts";
import type { HowItWorksStep } from "../model/data.ts";

import "./HowItWorksSection.css";

/* ---- Компонент одного шага ---- */
function StepCard({ step }: { step: HowItWorksStep }) {
    return (
        <div className="residents-how__card">
            {/* Большая стилизованная цифра */}
            <span className="residents-how__num">{step.number}</span>

            {/* Заголовок шага */}
            <h3 className="residents-how__card-title">{step.title}</h3>

            {/* Описание */}
            <p className="residents-how__card-desc">{step.description}</p>
        </div>
    );
}

/* ---- Основной компонент секции ---- */
export default function HowItWorksSection() {
    return (
        /* data-reveal — подхватывается хуком useScrollReveal */
        <section className="residents-how" data-reveal>
            {/* Заголовок секции */}
            <MainTitle title="Начать — проще простого" />

            {/* Контейнер с карточками и стрелками между ними */}
            <div className="residents-how__steps">
                {HOW_IT_WORKS_STEPS.map((step, index) => (
                    <div key={step.number} className="residents-how__step-wrap">
                        {/* Карточка шага */}
                        <StepCard step={step} />

                        {/* Стрелка между шагами (не рисуем после последнего) */}
                        {index < HOW_IT_WORKS_STEPS.length - 1 && (
                            <span className="residents-how__arrow" aria-hidden="true">
                                →
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
