// CTABanner — призыв к действию в конце страницы /residents — Зелёный градиент, одна кнопка — зарегистрироваться

import { useNavigate } from "react-router";

import CustomTitle from "@/shared/ui/customTitle/CustomTitle.tsx";
import CustomDescription from "@/shared/ui/customText/CustomDescription.tsx";
import CustomButton from "@/shared/ui/customButton/CustomButton.tsx";

import "./CTABanner.css";

export default function ResidentsCtaBanner() {
    const navigate = useNavigate();

    return (
        /* data-reveal — подхватывается хуком useScrollReveal */
        <section className="residents-cta" data-reveal>
            <div className="residents-cta__inner">

                {/* Заголовок */}
                <CustomTitle
                    title="Присоединяйтесь — это бесплатно"
                    className="residents-cta__title"
                />

                {/* Описание */}
                <CustomDescription
                    description="Базовый тариф для жителей — 0 ₽. Просто зарегистрируйтесь."
                    className="residents-cta__description"
                />

                {/* Кнопка регистрации */}
                <CustomButton
                    text="Зарегистрироваться"
                    className="residents-cta__btn"
                    onClick={() => navigate("/register")}
                />
            </div>
        </section>
    );
}
