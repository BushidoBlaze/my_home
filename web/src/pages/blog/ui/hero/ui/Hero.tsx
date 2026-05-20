import {useNavigate} from "react-router";
import {ArrowRight, Clock} from "lucide-react";
import HeroSphere from "@/shared/ui/heroSphere/HeroSphere.tsx";
import "./Hero.css";

/* Данные избранной статьи — декоративная карточка справа */
const FEATURED_ARTICLE = {
    category: "Кейс",
    title: "Как автоматизация снизила нагрузку на диспетчеров в 3 раза",
    excerpt: "УК «Комфорт» сократила время обработки заявок с 2 часов до 20 минут.",
    readTime: "7 мин",
    date: "12 мая 2026",
    gradient: "linear-gradient(135deg, #1f7a5a 0%, #0d3d28 100%)",
};

const MINI_ARTICLES = [
    {color: "#3b82f6", title: "5 способов сэкономить на ЖКУ", category: "Жители"},
    {color: "#8b5cf6", title: "Тренды цифровизации ЖКХ 2026", category: "Аналитика"},
];

export default function BlogHero() {
    const navigate = useNavigate();

    return (
        <section className="blog-hero">

            {/* Анимированная сфера из точек — правый фон */}
            <HeroSphere/>

            {/* Декоративные карточки статей — абсолютный оверлей справа */}
            <div className="blog-hero__cards-wrap" aria-hidden="true">
                <div className="blog-featured">
                    <div className="blog-featured__cover" style={{background: FEATURED_ARTICLE.gradient}}>
                        <span className="blog-featured__category-badge">{FEATURED_ARTICLE.category}</span>
                        <div className="blog-featured__cover-stat">
                            <span className="blog-featured__cover-num">3×</span>
                            <span className="blog-featured__cover-caption">производительность</span>
                        </div>
                    </div>
                    <div className="blog-featured__body">
                        <h3 className="blog-featured__title">{FEATURED_ARTICLE.title}</h3>
                        <p className="blog-featured__excerpt">{FEATURED_ARTICLE.excerpt}</p>
                        <div className="blog-featured__footer">
                            <div className="blog-featured__meta">
                                <Clock size={13}/>
                                <span>{FEATURED_ARTICLE.readTime}</span>
                                <span className="blog-featured__dot">·</span>
                                <span>{FEATURED_ARTICLE.date}</span>
                            </div>
                            <button
                                className="blog-featured__read-btn"
                                onClick={() => navigate("/blog")}
                                style={{pointerEvents: "none"}}
                            >
                                Читать <ArrowRight size={14}/>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="blog-hero__mini-cards">
                    {MINI_ARTICLES.map((a) => (
                        <div key={a.title} className="blog-mini-card">
                            <div className="blog-mini-card__dot" style={{background: a.color}}/>
                            <div className="blog-mini-card__content">
                                <span className="blog-mini-card__category">{a.category}</span>
                                <span className="blog-mini-card__title">{a.title}</span>
                            </div>
                            <ArrowRight size={14} className="blog-mini-card__arrow"/>
                        </div>
                    ))}
                </div>
            </div>

            {/* Заголовок + описание */}
            <div className="blog-hero__intro" data-reveal>
                <h1 className="blog-hero__title">
                    Полезные материалы<br/>о
                    <span className="blog-hero__title-accent"> цифровом ЖКХ</span>
                </h1>
                <p className="blog-hero__desc">
                    Кейсы УК, инструкции для жителей, аналитика рынка
                    и обновления платформы — раз в неделю.
                </p>
            </div>

            {/* CTA кнопки */}
            <div className="blog-hero__actions" data-reveal>
                <button
                    className="hero__button hero__button--active"
                    onClick={() => navigate("/blog")}
                >
                    Читать блог
                </button>
                <button
                    className="hero__button"
                    onClick={() => navigate("/login")}
                >
                    Попробовать платформу →
                </button>
            </div>
        </section>
    );
}
