import {CheckCircle} from "lucide-react";
import {RESIDENTS_FEATURES} from "../../model/data.ts";
import CustomButton from "@/shared/ui/customButton/CustomButton.tsx";

export default function RCContent() {
    return (
        <div className="possibilities-audience__content">
            <span className="possibilities-audience__label">Для жильцов</span>
            <h2 className="possibilities-audience__title">
                Мой Дом<br/>в смартфоне
            </h2>
            <p className="possibilities-audience__description">
                Оплата ЖКХ, заявки на ремонт, голосования и маркетплейс услуг —
                без звонков и очередей.
            </p>
            <ul className="possibilities-audience__feature-list">
                {RESIDENTS_FEATURES.map((feature) => (
                    <li key={feature}
                        className="possibilities-audience__feature-item">
                        <CheckCircle className="possibilities-audience__feature-icon" size={15} strokeWidth={1.75}/>
                        {feature}
                    </li>
                ))}
            </ul>

            <CustomButton
                className="possibilities-audience__button possibilities-audience__button--green"
                text="Скачать приложение"
            />
        </div>
    );
}