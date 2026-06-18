import {Check} from "lucide-react";

interface Props {
    steps: string[];
    current: number;
}

// Визуальный индикатор прогресса мульти-степ формы.
// current — индекс активного шага (с 0), пройденные шаги рисуются с галочкой.
export default function StepIndicator({steps, current}: Props) {
    return (
        <div className="register__steps">
            {steps.map((step, i) => {
                const isDone = i < current;
                const isActive = i === current;
                const numberModifier = isDone ? " register__step-number--done"
                    : isActive ? " register__step-number--active" : "";

                return (
                    <div key={i} className="register__step-item">
                        <div className={`register__step-number${numberModifier}`}>
                            {isDone ? <Check size={11} strokeWidth={2.4}/> : i + 1}
                        </div>
                        <span className={`register__step-label${isActive ? " register__step-label--active" : ""}`}>
                            {step}
                        </span>
                        {i < steps.length - 1 && <span className="register__step-bar"/>}
                    </div>
                );
            })}
        </div>
    );
}
