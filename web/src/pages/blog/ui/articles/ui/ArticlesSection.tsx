/* ============================================================
   ArticlesSection — секция статей страницы /blog
   Фильтр по категориям (пилюли) + сетка карточек ArticleCard
   При смене категории — фильтрация через useState
   ============================================================ */

import { useState } from "react";

import MainTitle from "@/shared/ui/mainTitle/MainTitle.tsx";
import ArticleCard from "./ArticleCard.tsx";
import { BLOG_ARTICLES, BLOG_CATEGORIES } from "../model/data.ts";

import "./ArticlesSection.css";

export default function ArticlesSection() {
    /* Активная категория фильтра — по умолчанию "Все" */
    const [activeCategory, setActiveCategory] = useState<string>("Все");

    /**
     * Фильтруем массив статей:
     * - "Все" → показываем все статьи
     * - иначе → только статьи с совпадающей категорией
     */
    const filteredArticles =
        activeCategory === "Все"
            ? BLOG_ARTICLES
            : BLOG_ARTICLES.filter((a) => a.category === activeCategory);

    return (
        /* data-reveal — подхватывается хуком useScrollReveal */
        <section className="blog-articles" data-reveal>
            {/* Заголовок секции */}
            <MainTitle title="Все материалы" />

            {/* Фильтр по категориям — кнопки-пилюли */}
            <div className="blog-articles__filters" role="tablist" aria-label="Фильтр категорий">
                {BLOG_CATEGORIES.map((category) => (
                    <button
                        key={category}
                        className={`blog-articles__filter-btn ${
                            activeCategory === category
                                ? "blog-articles__filter-btn--active"
                                : ""
                        }`}
                        onClick={() => setActiveCategory(category)}
                        role="tab"
                        aria-selected={activeCategory === category}
                        type="button"
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Сетка карточек статей */}
            <div className="blog-articles__grid">
                {filteredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>

            {/* Сообщение если фильтр не нашёл статей */}
            {filteredArticles.length === 0 && (
                <p className="blog-articles__empty">
                    Статьи в этой категории скоро появятся
                </p>
            )}
        </section>
    );
}
