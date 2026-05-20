/* ============================================================
   FeaturesSection — секция ключевых возможностей /management
   Сетка 3 колонки с иконками, заголовками и описаниями
   ============================================================ */

import MainTitle from "@/shared/ui/mainTitle/MainTitle.tsx";
import {MANAGEMENT_FEATURES} from "../model/data.ts";
import type {Feature} from "../model/types.ts";

import "./FeaturesSection.css";

/* ---- Компонент одной карточки ---- */
function FeatureCard({feature}: { feature: Feature }) {
    const Icon = feature.icon;

    return (
        <div className="management-features__card">
            {/* Иконка с цветным фоном (10% прозрачность от color) */}
            <div
                className="management-features__icon-wrap"
                style={{backgroundColor: `${feature.color}1a`}}
            >
                <Icon size={24} color={feature.color} strokeWidth={1.8}/>
            </div>

            {/* Название функциональности */}
            <h3 className="management-features__card-title">{feature.title}</h3>

            {/* Описание */}
            <p className="management-features__card-desc">{feature.description}</p>
        </div>
    );
}

/* ---- Основной компонент секции ---- */
export default function FeaturesSection() {
    return (
        /* data-reveal — подхватывается хуком useScrollReveal */
        <section className="management-features" data-reveal>
            {/* Заголовок секции */}
            <MainTitle title="Всё что нужно управляющей компании"/>

            {/* Сетка карточек возможностей */}
            <div className="management-features__grid">
                {MANAGEMENT_FEATURES.map((feature) => (
                    <FeatureCard key={feature.title} feature={feature}/>
                ))}
            </div>
        </section>
    );
}
