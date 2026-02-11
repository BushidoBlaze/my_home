import CustomButton from "@/ui/customButton/CustomButton.tsx";
import CustomTitle from "@/ui/customTitle/CustomTitle.tsx";
import CustomDescription from "@/ui/customText/CustomDescription.tsx";
// import CustomIcons from "@/ui/customIcons/CustomIcons.tsx";
import "./HeroSection.css";

import {STATS_CONTENT} from "./hero-section.data.ts";

export default function HeroSection() {
    return (
        <div className="hero-section">

            <div className="hero__intro">
                <CustomTitle
                    title="Экосистема сервисов для ЖКХ"
                    className="hero__title"
                />

                <CustomDescription
                    description="Все, что нужно УК и ТСЖ — в одном месте."
                    className="hero__description"
                />
            </div>

            <div className="hero-buttons">
                <CustomButton text="Попробовать бесплатно" className="hero__button hero__button--active "/>
                <CustomButton text="Тарифы" className="hero__button"/>
            </div>

            {/*<CustomIcons/>*/}

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