import {useEffect, useRef, useState, type JSX} from "react";
import {X, Megaphone, Pin, AlertTriangle, FileText, Tag} from "lucide-react";
import {newsApi, type NewsItem} from "@/api/news.api.ts";
import "./NewsEditorModal.css";

interface NewsEditorModalProps {
    open: boolean;
    /** Передать существующую новость для редактирования, или undefined — для создания. */
    initial?: NewsItem | null;
    onClose: () => void;
    onSaved: (id: string, isNew: boolean) => void;
}

const CATEGORIES = [
    {value: "Announcement", label: "Объявление"},
    {value: "Event", label: "Мероприятие"},
    {value: "Maintenance", label: "Работы / отключения"},
    {value: "Emergency", label: "Аварийная ситуация"},
    {value: "Document", label: "Документ"},
] as const;

const IMPORTANCE_OPTIONS = [
    {value: "Low", label: "Низкая"},
    {value: "Normal", label: "Обычная"},
    {value: "High", label: "Высокая"},
] as const;

export default function NewsEditorModal({open, initial, onClose, onSaved}: NewsEditorModalProps): JSX.Element | null {
    const isEdit = !!initial;
    const titleRef = useRef<HTMLInputElement | null>(null);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState<string>(CATEGORIES[0].value);
    const [importance, setImportance] = useState<string>("Normal");
    const [isPinned, setIsPinned] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setTitle(initial?.title ?? "");
            setContent(initial?.content ?? "");
            setCategory(initial?.category ?? CATEGORIES[0].value);
            setImportance(initial?.importance ?? "Normal");
            setIsPinned(initial?.isPinned ?? false);
            setError(null);
            setTimeout(() => titleRef.current?.focus(), 50);
        }
    }, [open, initial]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { setError("Введите заголовок"); return; }
        if (!content.trim()) { setError("Введите текст объявления"); return; }

        setError(null);
        setSubmitting(true);
        try {
            if (isEdit && initial) {
                await newsApi.update(initial.id, {
                    title: title.trim(),
                    content: content.trim(),
                    category,
                    importance,
                    isPinned,
                });
                onSaved(initial.id, false);
            } else {
                const res = await newsApi.create({
                    title: title.trim(),
                    content: content.trim(),
                    category,
                    importance,
                    sourceType: "ManagementCompany",
                    isPinned,
                });
                onSaved(res.id, true);
            }
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось сохранить");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="news-modal__backdrop" onMouseDown={onClose}>
            <div className="news-modal" onMouseDown={e => e.stopPropagation()}>
                <div className="news-modal__head">
                    <div className="news-modal__head-title">
                        <Megaphone size={18}/> {isEdit ? "Редактировать объявление" : "Новое объявление"}
                    </div>
                    <button type="button" className="news-modal__close" onClick={onClose} aria-label="Закрыть">
                        <X size={18}/>
                    </button>
                </div>

                <form className="news-modal__form" onSubmit={handleSubmit}>
                    {error && <div className="news-modal__error">{error}</div>}

                    <div className="news-modal__field">
                        <label className="news-modal__label"><FileText size={13}/> Заголовок</label>
                        <input
                            ref={titleRef}
                            className="news-modal__input"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Например: Плановое отключение горячей воды 24 мая"
                            maxLength={140}
                        />
                    </div>

                    <div className="news-modal__field">
                        <label className="news-modal__label">Текст объявления</label>
                        <textarea
                            className="news-modal__input news-modal__textarea"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Подробности, время, контакты ответственных…"
                            rows={6}
                            maxLength={2000}
                        />
                        <div className="news-modal__hint">{content.length} / 2000</div>
                    </div>

                    <div className="news-modal__row">
                        <div className="news-modal__field">
                            <label className="news-modal__label"><Tag size={13}/> Категория</label>
                            <select
                                className="news-modal__input"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="news-modal__field">
                            <label className="news-modal__label"><AlertTriangle size={13}/> Важность</label>
                            <select
                                className="news-modal__input"
                                value={importance}
                                onChange={e => setImportance(e.target.value)}
                            >
                                {IMPORTANCE_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <label className="news-modal__pin">
                        <input
                            type="checkbox"
                            checked={isPinned}
                            onChange={e => setIsPinned(e.target.checked)}
                        />
                        <span className="news-modal__pin-track">
                            <span className="news-modal__pin-knob"/>
                        </span>
                        <span className="news-modal__pin-label">
                            <Pin size={13}/> Закрепить вверху ленты
                        </span>
                    </label>

                    <div className="news-modal__notice">
                        Объявление сразу появится у всех жильцов в приложении и они получат push-уведомление.
                    </div>

                    <div className="news-modal__actions">
                        <button type="button" className="news-modal__btn news-modal__btn--ghost" onClick={onClose} disabled={submitting}>
                            Отмена
                        </button>
                        <button type="submit" className="news-modal__btn news-modal__btn--primary" disabled={submitting}>
                            <Megaphone size={14}/>
                            {submitting ? "Сохраняем…" : (isEdit ? "Сохранить" : "Опубликовать")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
