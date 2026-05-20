/* ============================================================
   BenefitsSection — секция преимуществ страницы /residents
   Сетка 3 колонки, карточки с иконкой (зелёный градиент),
   заголовком, описанием и опциональным бейджем
   ============================================================ */

import MainTitle from "@/shared/ui/mainTitle/MainTitle.tsx";
import { RESIDENT_BENEFITS } from "../model/data.ts";
import type { Benefit } from "../model/types.ts";

import "./BenefitsSection.css";

/* ---- Компонент одной карточки преимущества ---- */
function BenefitCard({ benefit }: { benefit: Benefit }) {
    const Icon = benefit.icon;

    /**
     * Определяем CSS-модификатор бейджа по его тексту:
     * "Бесплатно" → зелёный, "Новое" → фиолетовый
     */
    function getBadgeModifier(badge: string): string {
        if (badge === "Бесплатно") return "residents-benefits__badge--green";
        if (badge === "Новое") return "residents-benefits__badge--purple";
        return "residents-benefits__badge--green";
    }

    return (
        <div className="residents-benefits__card">
            {/* Обёртка иконки — зелёный градиентный фон */}
            <div className="residents-benefits__icon-wrap">
                <Icon size={24} color="#ffffff" strokeWidth={1.8} />
            </div>

            {/* Шапка карточки: заголовок + опциональный бейдж */}
            <div className="residents-benefits__card-head">
                <h3 className="residents-benefits__card-title">{benefit.title}</h3>

                {/* Бейдж отображается только если badge !== null */}
                {benefit.badge && (
                    <span
                        className={`residents-benefits__badge ${getBadgeModifier(benefit.badge)}`}
                    >
                        {benefit.badge}
                    </span>
                )}
            </div>

            {/* Описание преимущества */}
            <p className="residents-benefits__card-desc">{benefit.description}</p>
        </div>
    );
}

/* ---- Основной компонент секции ---- */
export default function BenefitsSection() {
    return (
        /*
         * id="residents-benefits" — используется для плавного скролла
         * с кнопки "Узнать больше" в Hero компоненте
         * data-reveal — подхватывается хуком useScrollReveal
         */
        <section className="residents-benefits" id="residents-benefits" data-reveal>
            {/* Заголовок секции */}
            <MainTitle title="Всё для комфортной жизни в ЖК" />

            {/* Сетка карточек */}
            <div className="residents-benefits__grid">
                {RESIDENT_BENEFITS.map((benefit) => (
                    <BenefitCard key={benefit.title} benefit={benefit} />
                ))}
            </div>
        </section>
    );
}
