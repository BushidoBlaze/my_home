// CTABanner — призыв к действию в конце страницы /tariffs — Градиентный фон, заголовок и кнопка с белым стилем

import { useNavigate } from "react-router";

import CustomTitle from "@/shared/ui/customTitle/CustomTitle.tsx";
import CustomDescription from "@/shared/ui/customText/CustomDescription.tsx";
import CustomButton from "@/shared/ui/customButton/CustomButton.tsx";

import "./CTABanner.css";

export default function TariffsCtaBanner() {
    const navigate = useNavigate();

    return (
        /* data-reveal — подхватывается хуком useScrollReveal для анимации появления */
        <section className="tariffs-cta" data-reveal>
            <div className="tariffs-cta__inner">

                {/* Заголовок баннера */}
                <CustomTitle
                    title="Готовы начать?"
                    className="tariffs-cta__title"
                />

                {/* Описание */}
                <CustomDescription
                    description="Подключите ваш ЖК к платформе за 15 минут. Первые 14 дней — бесплатно."
                    className="tariffs-cta__description"
                />

                {/* Кнопка — белый фон, зелёный текст */}
                <CustomButton
                    text="Начать бесплатно"
                    className="tariffs-cta__btn"
                    onClick={() => navigate("/login")}
                />
            </div>
        </section>
    );
}
