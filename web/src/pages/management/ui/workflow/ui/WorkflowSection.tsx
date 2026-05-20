/* ============================================================
   WorkflowSection — секция "Как это работает" /management
   Горизонтальный timeline на десктопе, вертикальный на мобильном
   Нумерованные шаги с соединительными линиями между ними
   ============================================================ */

import MainTitle from "@/shared/ui/mainTitle/MainTitle.tsx";
import { WORKFLOW_STEPS } from "../model/data.ts";

import "./WorkflowSection.css";

export default function WorkflowSection() {
    return (
        /* data-reveal — подхватывается хуком useScrollReveal */
        <section className="management-workflow" data-reveal>
            {/* Заголовок секции */}
            <MainTitle title="Как работает система заявок" />

            {/* Timeline шагов */}
            <div className="management-workflow__timeline">
                {WORKFLOW_STEPS.map((step, index) => (
                    <div key={step.step} className="management-workflow__item">
                        {/* Блок с номером шага */}
                        <div className="management-workflow__step-head">
                            <div className="management-workflow__step-num">{step.step}</div>

                            {/* Соединительная линия после шага (не рисуем после последнего) */}
                            {index < WORKFLOW_STEPS.length - 1 && (
                                <div className="management-workflow__connector" />
                            )}
                        </div>

                        {/* Текстовый блок шага */}
                        <div className="management-workflow__step-body">
                            <h3 className="management-workflow__step-title">{step.title}</h3>
                            <p className="management-workflow__step-desc">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
