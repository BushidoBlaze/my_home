import {CheckCircle} from "lucide-react";
import {UK_FEATURES} from "../../model/data.ts";
import MCGraph from "./MCGraph.tsx";
import MCCounters from "./MCCounters.tsx";
import {useInView} from "../../hooks/useInView.ts";
import {useCounter} from "../../hooks/useCounter.ts";
import CustomButton from "@/shared/ui/customButton/CustomButton.tsx";

export default function AudienceMC() {
    // inView становится true когда блок входит в viewport — запускает анимации
    const [ref, inView] = useInView<HTMLDivElement>();

    // Счётчики запускаются когда блок входит в viewport
    const economy = useCounter(166800, 1600, inView);
    const satisfaction = useCounter(98, 1200, inView);

    return (
        <div className="possibilities-audience__block" ref={ref}>
            <div className="possibilities-audience__content">
                <span className="possibilities-audience__label">
                    Для управляющих компаний
                </span>

                <h2 className="possibilities-audience__title">
                    Автоматизируйте<br/>рутину
                </h2>
                <p className="possibilities-audience__description">
                    Единый портал диспетчера. Все заявки, финансы и жильцы в одном окне.
                </p>

                <ul className="possibilities-audience__feature-list">
                    {UK_FEATURES.map((feature) => (
                        <li key={feature} className="possibilities-audience__feature-item">
                            <CheckCircle className="possibilities-audience__feature-icon" size={15} strokeWidth={1.75}/>
                            {feature}
                        </li>
                    ))}
                </ul>

                <CustomButton
                    className="possibilities-audience__button possibilities-audience__button--outline"
                    text="Подключить УК"
                />
            </div>

            <div className="audience-mc-dashboard">
                {/* inView пробрасывается в граф для запуска анимации Pie */}
                <MCGraph inView={inView}/>

                {/* Значения считаются в AudienceMC и передаются вниз */}
                <MCCounters economy={economy} satisfaction={satisfaction}/>
            </div>

        </div>
    );
}