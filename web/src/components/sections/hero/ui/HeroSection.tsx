import {STATS_CONTENT} from "../model/data.ts";
import CustomButton from "@/shared/ui/customButton/CustomButton.tsx";
import CustomTitle from "@/shared/ui/customTitle/CustomTitle.tsx";
import CustomDescription from "@/shared/ui/customText/CustomDescription.tsx";
import "./HeroSection.css";

export default function HeroSection() {
    return (
        <div className="hero-section">
            <div className="hero__intro">
                <CustomTitle
                    title="Центр управления вашим домом"
                    className="hero__title"
                />

                <CustomDescription
                    description="Ваш личный помощник в сервисах ЖКХ онлайн"
                    className="hero__description"
                />
            </div>

            <div className="hero-buttons">
                <CustomButton text="Попробовать бесплатно" className="hero__button hero__button--active"/>
                <CustomButton text="Тарифы" className="hero__button"/>
            </div>

            <div className="hero-stats">
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