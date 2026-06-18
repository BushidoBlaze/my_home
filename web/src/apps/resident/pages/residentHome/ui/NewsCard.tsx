import {useMemo, type JSX} from "react";
import {Link} from "react-router-dom";
import {AlertTriangle, ChevronRight, Pin} from "lucide-react";
import {formatLongDayMonth} from "../lib/formatDate.ts";
import type {NewsItem} from "@/api/news.api.ts";

interface NewsCardProps {
    // Превью последних объявлений УК. Полный список — на /resident/news.
    news: NewsItem[];
}

// Карточка "Объявления УК" — список из 2–3 последних объявлений с подписями важности.
// При пустом списке показываем empty state.
export function NewsCard({news}: NewsCardProps): JSX.Element {
    // Бэк возвращает новости в порядке публикации. Pinned должны быть НАВЕРХУ независимо
    // от даты — это закреп. Внутри каждой группы (pinned/обычные) сортируем по publishedAt убыв.
    const ordered = useMemo(() => {
        return [...news].sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return +new Date(b.publishedAt) - +new Date(a.publishedAt);
        });
    }, [news]);

    return (
        <div className="card resident-home__news">
            <div className="resident-home__section-head">
                <div>
                    <div className="t-h3">Объявления УК</div>
                    <div className="resident-home__section-sub">
                        {news.length > 0 ? `последние ${news.length}` : "новых сообщений нет"}
                    </div>
                </div>
                <Link to="/resident/news" className="btn btn--sm btn--ghost">
                    Все <ChevronRight size={12}/>
                </Link>
            </div>

            {news.length === 0 ? (
                <div className="resident-home__empty">
                    <AlertTriangle size={28} strokeWidth={1.5}/>
                    <div className="resident-home__empty-text">Объявлений нет</div>
                </div>
            ) : (
                <ul className="resident-home__news-list">
                    {ordered.map(n => {
                        // High → красный "Срочно", остальное → синий "Объявление".
                        // Полная палитра тонов есть в глобальных .chip--{tone}.
                        const tone = n.importance === "High" ? "danger" : "info";
                        return (
                            <li key={n.id} className="resident-home__news-item">
                                {/* Pinned — красная булавка. У не-pinned оставляем плейсхолдер
                                    той же ширины, чтобы заголовки в списке выравнивались по вертикали. */}
                                {n.isPinned
                                    ? <Pin size={14} className="resident-home__news-pin"/>
                                    : <span className="resident-home__news-pin-stub"/>}
                                <div className="resident-home__news-content">
                                    <div className="resident-home__news-meta">
                                        <span className={"chip chip--" + tone}>
                                            {n.importance === "High" ? "Срочно" : "Объявление"}
                                        </span>
                                        <span className="resident-home__news-time">
                                            · {formatLongDayMonth(n.publishedAt)}
                                        </span>
                                    </div>
                                    <div className="resident-home__news-title">{n.title}</div>
                                    {/* Текст обрезается до 2 строк через -webkit-line-clamp в CSS */}
                                    <div className="resident-home__news-text">{n.content}</div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
