import {STATS_CONTENT} from "../model/data.ts";
import CustomButton from "@/shared/ui/customButton/CustomButton.tsx";
import CustomTitle from "@/shared/ui/customTitle/CustomTitle.tsx";
import CustomDescription from "@/shared/ui/customText/CustomDescription.tsx";
import "./Hero.css";

export default function Hero() {
    return (
        <div className="hero-section">
            {/*data-reveal - data-атрибут, фича для хранения произвольных данных на элементе,*/}
            {/*используется в глобальном хуке useScrollReveal.ts для плавного скролла секции*/}
            <div className="hero__intro" data-reveal>
                <CustomTitle
                    title="Центр управления вашим домом"
                    className="hero__title"
                />

                <CustomDescription
                    description="Единая платформа для жильцов и управляющих компаний онлайн"
                    className="hero__description"
                />
            </div>

            <div className="hero-buttons" data-reveal>
                <CustomButton text="Попробовать бесплатно" className="hero__button hero__button--active"/>
                <CustomButton text="Тарифы" className="hero__button"/>
            </div>

            <div className="hero-stats" data-reveal>
                {STATS_CONTENT.map((stat, index) => (
                    <div key={index} className="stat-item">
                        <CustomTitle
                            title={stat.title}
                            className="intro-text__title"
                        />
                        <CustomDescription
                            description={stat.description}
                            className="intro-text__description"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}