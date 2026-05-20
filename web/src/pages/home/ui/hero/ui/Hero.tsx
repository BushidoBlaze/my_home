import {useNavigate} from "react-router";

import CustomButton from "@/shared/ui/customButton/CustomButton.tsx";
import CustomTitle from "@/shared/ui/customTitle/CustomTitle.tsx";
import CustomDescription from "@/shared/ui/customText/CustomDescription.tsx";
import HeroSphere from "@/shared/ui/heroSphere/HeroSphere.tsx";

import "./Hero.css";

export default function Hero() {
    const navigate = useNavigate(); // для кнопки попробовать бесплатно для перехода к входу

    return (
        <div className="hero-section">

            <HeroSphere/>

            {/*data-reveal - data-атрибут, фича для хранения произвольных данных на элементе,*/}
            {/*используется в глобальном хуке useScrollReveal.ts для плавного скролла секции*/}
            <div className="hero__intro" data-reveal>
                <CustomTitle
                    title={
                        <>Центр управления<br/>вашим домом</>
                    }
                    className="hero__title"
                />

                <CustomDescription
                    description={
                        <>
                            Единая цифровая платформа для жильцов и УК <br/>
                            Онлайн-передача показаний, оплата ЖКУ без комиссии, заявки 24/7
                        </>
                    }
                    className="hero__description"
                />
            </div>

            <div className="hero-buttons" data-reveal>
                <CustomButton
                    text="Попробовать бесплатно"
                    className="hero__button hero__button--active"
                    onClick={() => navigate("/login")}
                />
                <CustomButton text="Тарифы" className="hero__button"/>
            </div>
        </div>
    )
}