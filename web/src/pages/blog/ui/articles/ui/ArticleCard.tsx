// ArticleCard — карточка одной статьи блога — Превью-градиент, бейдж категории, заголовок, excerpt, footer

import type { Article } from "../model/types.ts";
import "./ArticleCard.css";

interface ArticleCardProps {
    article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
    return (
        <article className="blog-article-card">

            {/* Превью — градиентный прямоугольник с бейджем категории */}
            <div
                className="blog-article-card__preview"
                style={{ background: article.imageGradient }}
            >
                <span className="blog-article-card__category">{article.category}</span>
            </div>

            {/* Основное содержимое карточки */}
            <div className="blog-article-card__body">

                {/* Заголовок статьи */}
                <h3 className="blog-article-card__title">{article.title}</h3>

                {/* Краткое описание — ограничено двумя строками через CSS */}
                <p className="blog-article-card__excerpt">{article.excerpt}</p>
            </div>

            {/* Нижняя строка: дата, время чтения, ссылка */}
            <div className="blog-article-card__footer">
                <div className="blog-article-card__meta">
                    <span className="blog-article-card__date">{article.date}</span>
                    <span className="blog-article-card__dot" aria-hidden="true">·</span>
                    <span className="blog-article-card__read-time">{article.readTime}</span>
                </div>

                {/* Кнопка-ссылка "Читать →" */}
                <button className="blog-article-card__read-btn" type="button">
                    Читать →
                </button>
            </div>
        </article>
    );
}
