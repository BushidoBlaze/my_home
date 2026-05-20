import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {Check} from "lucide-react";
import HeroSphere from "@/shared/ui/heroSphere/HeroSphere.tsx";
import "./Hero.css";


const PLANS = [
    {
        name: "Базовый",
        price: "30 000 ₽",
        period: "/ мес",
        features: ["До 50 квартир", "Заявки и чат", "Мобильное приложение"],
        highlight: false,
    },
    {
        name: "Продвинутый",
        price: "70 000 ₽",
        period: "/ мес",
        features: ["До 200 квартир", "Аналитика расходов", "Интеграция API", "Приоритетная поддержка"],
        highlight: true,
    },
    {
        name: "Бизнес Плюс",
        price: "100 000 ₽",
        period: "/ мес",
        features: ["Без ограничений", "SLA 99.9%", "Выделенный менеджер", "Кастомный брендинг"],
        highlight: false,
    },
];

const CYCLE_MS = 2800; // интервал переключения карточек

export default function TariffsHero() {
    const navigate = useNavigate();
    const [activeIdx, setActiveIdx] = useState(0);

    /* Автоматическое переключение карточек по кругу */
    useEffect(() => {
        const id = setInterval(() => {
            setActiveIdx(prev => (prev + 1) % PLANS.length);
        }, CYCLE_MS);
        return () => clearInterval(id);
    }, []);

    return (
        <section className="tariffs-hero">

            {/* Анимированная сфера из точек — правый фон */}
            <HeroSphere/>

            {/* ── Левая колонка: заголовок + кнопки ── */}
            <div className="tariffs-hero__left" data-reveal>
                <h1 className="tariffs-hero__title">
                    Тарифы, которые <br/>
                    <span className="tariffs-hero__title-accent">доступны</span> каждому
                </h1>

                <p className="tariffs-hero__desc">
                    Выберите план под размер вашего ЖК. Начните бесплатно —
                    переходите на следующий уровень когда будете готовы.
                </p>

                <div className="tariffs-hero__actions">
                    <button
                        className="hero__button hero__button--active"
                        onClick={() => navigate("/login")}
                    >
                        Начать бесплатно
                    </button>
                    <button
                        className="hero__button"
                        onClick={() => {
                            document.getElementById("tariffs-section")
                                ?.scrollIntoView({behavior: "smooth"});
                        }}
                    >
                        Сравнить тарифы ↓
                    </button>
                </div>
            </div>

            {/* ── Правая колонка: анимированный стек карточек ── */}
            <div className="tariffs-hero__preview" aria-hidden="true">

                <div className="tc-stack">
                    {PLANS.map((plan, i) => {
                        const isActive = i === activeIdx;
                        return (
                            <div
                                key={plan.name}
                                className={[
                                    "tc-card",
                                    isActive ? "tc-card--active" : "",
                                    plan.highlight ? "tc-card--highlight" : "",
                                ].join(" ")}
                            >
                                {/* Шапка — всегда видна */}
                                <div className="tc-card__head">
                                    <div className="tc-card__name-row">
                                        <span className="tc-card__name">{plan.name}</span>
                                        {plan.highlight && (
                                            <span className="tc-card__badge">Популярный</span>
                                        )}
                                    </div>
                                    <div className="tc-card__price-row">
                                        <span className="tc-card__price">{plan.price}</span>
                                        <span className="tc-card__period">{plan.period}</span>
                                    </div>
                                </div>

                                {/* Тело — раскрывается при активации */}
                                <div className={`tc-card__body ${isActive ? "tc-card__body--open" : ""}`}>
                                    <ul className="tc-card__features">
                                        {plan.features.map(f => (
                                            <li key={f}>
                                                <Check size={12} strokeWidth={2.5}/>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Индикатор прогресса */}
                <div className="tc-progress">
                    {PLANS.map((_, i) => (
                        <div
                            key={i}
                            className={`tc-progress__dot ${i === activeIdx ? "tc-progress__dot--active" : ""}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
