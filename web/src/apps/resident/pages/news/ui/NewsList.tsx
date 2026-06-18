import {
    CalendarDays,
    ChevronRight,
    Loader2,
    MessageCircle,
    Newspaper,
    Pin,
    Image as ImageIcon,
} from "lucide-react";

import type { NewsItem } from "../model/types.ts";

interface Props {
    list: NewsItem[];
    selected: NewsItem | null;
    loading: boolean;
    error: string | null;
    onSelect: (item: NewsItem) => void;
}

// Статика лежит в wwwroot бэкенда по корневым путям, а не под /api — отрезаем /api.
const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "").replace(/\/api\/?$/, "");

/**
 * Возвращает корректный URL для картинки.
 * Для моков с data: URL ничего не добавляем.
 * Для обычных относительных путей префиксуем origin бэкенда.
 */
function resolveAssetUrl(url: string) {
    if (!url) return "";
    if (/^(data:|blob:|https?:\/\/|\/\/)/.test(url)) return url;
    return `${API_ORIGIN}${url}`;
}

// Получаем первое изображение из вложений
function getImage(item: NewsItem): string | null {
    const img = item.attachments?.find((a) =>
        a.mimeType?.startsWith("image/")
    );
    return img ? resolveAssetUrl(img.fileUrl) : null;
}

// Форматируем дату публикации
function formatDate(date: string) {
    return new Date(date).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export function NewsList({
                             list,
                             selected,
                             loading,
                             error,
                             onSelect,
                         }: Props) {
    if (loading) {
        return (
            <div className="news-list__state">
                <Loader2 className="news-list__spinner" size={20} />
                <span>Загрузка новостей...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="news-list__state news-list__state--error">
                {error}
            </div>
        );
    }

    if (list.length === 0) {
        return (
            <div className="news-list__empty-state">
                <div className="news-list__empty-icon">
                    <Newspaper size={30}/>
                </div>
                <p className="news-list__empty-title">Новостей пока нет</p>
                <p className="news-list__empty-text">
                    Здесь появятся объявления и уведомления от управляющей компании
                </p>
            </div>
        );
    }

    return (
        <ul className="news-list">
            {list.map((item) => {
                const image = getImage(item);
                const isActive = selected?.id === item.id;

                return (
                    <li key={item.id} className="news-list__item">
                        <button
                            type="button"
                            className={`news-list__item-button ${
                                isActive
                                    ? "news-list__item-button--active"
                                    : ""
                            }`}
                            onClick={() => onSelect(item)}
                            aria-pressed={isActive}
                        >
                            {/* Обложка новости */}
                            <div className="news-list__thumb">
                                {image ? (
                                    <img
                                        className="news-list__img"
                                        src={image}
                                        alt={item.title}
                                    />
                                ) : (
                                    <div className="news-list__thumb-placeholder">
                                        <ImageIcon size={26} />
                                    </div>
                                )}

                                {item.isPinned && (
                                    <span className="news-list__pin-badge">
                                        <Pin size={12} />
                                        важно
                                    </span>
                                )}
                            </div>

                            <div className="news-list__body">
                                {/* Дата и стрелка */}
                                <div className="news-list__meta">
                                    <span className="news-list__date">
                                        <CalendarDays size={13} />
                                        {formatDate(item.publishedAt)}
                                    </span>

                                    <ChevronRight size={16} className="news-list__chevron" />
                                </div>

                                <h3 className="news-list__title">
                                    {item.title}
                                </h3>

                                {/* Превью текста */}
                                <p className="news-list__preview">
                                    {item.content.slice(0, 110)}
                                    {item.content.length > 110 ? "..." : ""}
                                </p>

                                <div className="news-list__footer">
                                    <span className="news-list__comments">
                                        <MessageCircle size={13} />
                                        {item.commentsCount}
                                    </span>
                                </div>
                            </div>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}