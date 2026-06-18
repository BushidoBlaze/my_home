// CTABanner — призыв к действию в конце страницы /management — Градиентный фон, две кнопки: основная и ghost (тарифы)

import {useNavigate} from "react-router";

import CustomTitle from "@/shared/ui/customTitle/CustomTitle.tsx";
import CustomDescription from "@/shared/ui/customText/CustomDescription.tsx";
import CustomButton from "@/shared/ui/customButton/CustomButton.tsx";

import "./CTABanner.css";

export default function ManagementCtaBanner() {
    const navigate = useNavigate();

    return (
        /* data-reveal — подхватывается хуком useScrollReveal */
        <section className="management-cta" data-reveal>
            <div className="management-cta__inner">

                {/* Заголовок */}
                <CustomTitle
                    title="Подключите ваш ЖК сегодня"
                    className="management-cta__title"
                />

                {/* Описание */}
                <CustomDescription
                    description="Начните с бесплатного периода. Никаких рисков — только результат."
                    className="management-cta__description"
                />

                {/* Группа CTA кнопок */}
                <div className="management-cta__actions">
                    {/* Первичная кнопка — белый фон, зелёный текст */}
                    <CustomButton
                        text="Попробовать бесплатно"
                        className="management-cta__btn management-cta__btn--primary"
                        onClick={() => navigate("/login")}
                    />

                    {/* Ghost кнопка — прозрачный фон, белая обводка */}
                    <CustomButton
                        text="Посмотреть тарифы"
                        className="management-cta__btn management-cta__btn--ghost"
                        onClick={() => navigate("/tariffs")}
                    />
                </div>
            </div>
        </section>
    );
}
