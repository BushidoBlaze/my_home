import { useState, type FormEvent } from "react";
import {
    CalendarDays,
    Clock3,
    ExternalLink,
    FileText,
    Loader2,
    MessageCircle,
    Newspaper,
    Paperclip,
    Pin,
    Send,
} from "lucide-react";

import type { NewsComment, NewsItem } from "../model/types.ts";

interface Props {
    selected: NewsItem | null;
    comments: NewsComment[];
    loading: boolean;
    submitting: boolean;
    onAddComment: (content: string) => Promise<void>;
}

// Статика (аватары, изображения, документы) лежит в wwwroot бэкенда по корневым
// путям (/avatars, /news-files), а не под /api — поэтому отрезаем хвост /api.
const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "").replace(/\/api\/?$/, "");

/**
 * Возвращает корректный URL для картинки или документа.
 * Для data:/blob:/http(s) ссылок ничего не дополняем.
 */
function resolveAssetUrl(url: string) {
    if (!url) return "";
    if (/^(data:|blob:|https?:\/\/|\/\/)/.test(url)) return url;
    return `${API_ORIGIN}${url}`;
}

// Аккуратно достаём имя файла для документа
function getFileName(fileUrl: string, fallback?: string) {
    if (fallback) return fallback;

    try {
        const clean = fileUrl.split("?")[0].split("#")[0];
        const lastPart = clean.split("/").pop();
        return decodeURIComponent(lastPart || "Документ");
    } catch {
        return "Документ";
    }
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Получаем инициалы для аватара комментатора
function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
}

export function NewsDetail({ selected, comments, loading, submitting, onAddComment }: Props) {
    const [commentText, setCommentText] = useState("");

    async function handleSubmitComment(e: FormEvent) {
        e.preventDefault();
        const text = commentText.trim();
        if (!text || submitting) return;
        try {
            await onAddComment(text);
            setCommentText("");
        } catch {
            // Ошибку показывать не критично — оставляем текст, чтобы можно было повторить.
        }
    }

    if (!selected) {
        return (
            <div className="news-detail__empty">
                <div className="news-detail__empty-icon">
                    <Newspaper size={44} />
                </div>
                <p className="news-detail__empty-title">
                    Выберите новость из списка
                </p>
                <p className="news-detail__empty-text">
                    Здесь откроется полная версия объявления, вложения и комментарии.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="news-detail__loading">
                <Loader2 className="news-list__spinner" size={24} />
                <span>Загрузка новости...</span>
            </div>
        );
    }

    // Фильтруем вложения — изображения и документы
    const images =
        selected.attachments?.filter((a) =>
            a.mimeType?.startsWith("image/")
        ) ?? [];

    const docs =
        selected.attachments?.filter(
            (a) => !a.mimeType?.startsWith("image/")
        ) ?? [];

    return (
        <article className="news-detail">
            {/* Шапка */}
            <header className="news-detail__header">
                <div className="news-detail__header-meta">
                    <span className="news-detail__date">
                        <CalendarDays size={14} />
                        {formatDate(selected.publishedAt)}
                    </span>

                    {selected.isPinned && (
                        <span className="news-detail__pin">
                            <Pin size={13} />
                            Важное объявление
                        </span>
                    )}
                </div>

                <h1 className="news-detail__title">{selected.title}</h1>
            </header>

            {/* Изображения */}
            {images.length > 0 && (
                <section className="news-detail__gallery">
                    {images.map((img, i) => (
                        <figure key={i} className="news-detail__figure">
                            <img
                                className="news-detail__image"
                                src={resolveAssetUrl(img.fileUrl)}
                                alt={selected.title}
                            />
                        </figure>
                    ))}
                </section>
            )}

            {/* Текст новости */}
            <section className="news-detail__content">
                {selected.content.split("\n").map((line, i) => {
                    if (!line.trim()) return <div key={i} className="news-detail__spacer" />;
                    return <p key={i}>{line}</p>;
                })}
            </section>

            {/* Документы */}
            {docs.length > 0 && (
                <section className="news-detail__docs">
                    <div className="news-detail__section-title">
                        <Paperclip size={16} />
                        <h2>Вложения</h2>
                    </div>

                    <div className="news-detail__doc-list">
                        {docs.map((doc, i) => (
                            <a
                                key={i}
                                href={resolveAssetUrl(doc.fileUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="news-detail__doc-card"
                            >
                                <div className="news-detail__doc-icon">
                                    <FileText size={18} />
                                </div>

                                <div className="news-detail__doc-body">
                                    <span className="news-detail__doc-name">
                                        {getFileName(doc.fileUrl, doc.fileName ?? doc.name)}
                                    </span>
                                    <span className="news-detail__doc-meta">
                                        Открыть документ
                                    </span>
                                </div>

                                <ExternalLink size={16} className="news-detail__doc-arrow" />
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {/* Комментарии */}
            <section className="news-detail__comments">
                <h2 className="news-detail__comments-title">
                    <MessageCircle size={18} />
                    Комментарии ({comments.length})
                </h2>

                {/* Форма добавления комментария */}
                <form className="news-detail__comment-form" onSubmit={handleSubmitComment}>
                    <textarea
                        className="news-detail__comment-input"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Напишите комментарий…"
                        rows={3}
                    />
                    <div className="news-detail__comment-form-actions">
                        <button
                            type="submit"
                            className="news-detail__comment-submit"
                            disabled={submitting || !commentText.trim()}
                        >
                            {submitting
                                ? <Loader2 size={15} className="news-list__spinner" />
                                : <Send size={15} />}
                            {submitting ? "Отправка…" : "Отправить"}
                        </button>
                    </div>
                </form>

                {comments.length === 0 ? (
                    <div className="news-detail__no-comments">
                        <Clock3 size={18} />
                        <span>Комментариев пока нет</span>
                    </div>
                ) : (
                    <ul className="news-detail__comment-list">
                        {comments.map((c) => (
                            <li key={c.id} className="news-detail__comment">
                                {/* Аватар */}
                                <div className="news-detail__comment-avatar">
                                    {c.user.avatarUrl ? (
                                        <img
                                            src={resolveAssetUrl(c.user.avatarUrl)}
                                            alt={c.user.fullName}
                                        />
                                    ) : (
                                        <span>{getInitials(c.user.fullName)}</span>
                                    )}
                                </div>

                                <div className="news-detail__comment-body">
                                    <div className="news-detail__comment-header">
                                        <span className="news-detail__comment-name">
                                            {c.user.fullName}
                                        </span>
                                        <span className="news-detail__comment-date">
                                            {formatDate(c.createdAt)}
                                        </span>
                                    </div>

                                    <p className="news-detail__comment-text">
                                        {c.content}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </article>
    );
}