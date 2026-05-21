import {useEffect, useRef, useState, type JSX} from "react";
import {X, Plus, Trash2, Vote, Calendar, FileText, Tag} from "lucide-react";
import {pollsApi} from "@/api/polls.api.ts";
import "./CreatePollModal.css";

interface CreatePollModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (pollId: string, notifiedResidents?: number) => void;
}

const CATEGORIES = [
    {value: "improvement", label: "Благоустройство"},
    {value: "tariff", label: "Тариф"},
    {value: "repair", label: "Ремонт"},
    {value: "security", label: "Безопасность"},
    {value: "general", label: "Общий вопрос"},
] as const;

/** По умолчанию — на неделю вперёд в 23:59. */
function defaultEndsAtLocal(): string {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 0, 0);
    // input[type=datetime-local] требует формат "YYYY-MM-DDTHH:MM"
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CreatePollModal({open, onClose, onCreated}: CreatePollModalProps): JSX.Element | null {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<string>(CATEGORIES[0].value);
    const [options, setOptions] = useState<string[]>(["За", "Против", "Воздержался"]);
    const [endsAt, setEndsAt] = useState<string>(defaultEndsAtLocal());

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const titleRef = useRef<HTMLInputElement | null>(null);

    // Сброс формы и автофокус при открытии.
    useEffect(() => {
        if (open) {
            setTitle("");
            setDescription("");
            setCategory(CATEGORIES[0].value);
            setOptions(["За", "Против", "Воздержался"]);
            setEndsAt(defaultEndsAtLocal());
            setError(null);
            setTimeout(() => titleRef.current?.focus(), 50);
        }
    }, [open]);

    // Esc → закрыть.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const updateOption = (i: number, value: string) => {
        setOptions(prev => prev.map((o, idx) => idx === i ? value : o));
    };
    const addOption = () => setOptions(prev => [...prev, ""]);
    const removeOption = (i: number) => setOptions(prev => prev.filter((_, idx) => idx !== i));

    const validate = (): string | null => {
        if (!title.trim()) return "Введите название голосования";
        const cleanOpts = options.map(o => o.trim()).filter(Boolean);
        if (cleanOpts.length < 2) return "Минимум 2 непустых варианта ответа";
        if (new Set(cleanOpts).size !== cleanOpts.length) return "Варианты не должны повторяться";
        if (!endsAt) return "Укажите дату окончания";
        const ends = new Date(endsAt);
        if (isNaN(ends.getTime())) return "Некорректная дата окончания";
        if (ends.getTime() <= Date.now()) return "Дата окончания должна быть в будущем";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const err = validate();
        if (err) { setError(err); return; }

        setError(null);
        setSubmitting(true);
        try {
            const cleanOpts = options.map(o => o.trim()).filter(Boolean);
            // Конвертируем локальное время в ISO UTC для бэка.
            const endsAtIso = new Date(endsAt).toISOString();
            const res = await pollsApi.createPoll({
                title: title.trim(),
                description: description.trim() || undefined,
                category,
                endsAt: endsAtIso,
                options: cleanOpts,
            });
            onCreated(res.id);
            onClose();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Не удалось создать голосование");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="cpm-backdrop" onMouseDown={onClose}>
            <div className="cpm-modal" onMouseDown={e => e.stopPropagation()}>
                <div className="cpm-head">
                    <div className="cpm-head__title">
                        <Vote size={18}/> Создать голосование
                    </div>
                    <button type="button" className="cpm-head__close" onClick={onClose} aria-label="Закрыть">
                        <X size={18}/>
                    </button>
                </div>

                <form className="cpm-form" onSubmit={handleSubmit}>
                    {error && <div className="cpm-error">{error}</div>}

                    <div className="cpm-field">
                        <label className="cpm-label"><FileText size={13}/> Название</label>
                        <input
                            ref={titleRef}
                            className="cpm-input"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Например: Установка шлагбаума во дворе"
                            maxLength={120}
                        />
                    </div>

                    <div className="cpm-field">
                        <label className="cpm-label">Описание</label>
                        <textarea
                            className="cpm-input cpm-textarea"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Расскажите жителям суть вопроса, сметы, сроки…"
                            rows={3}
                            maxLength={500}
                        />
                        <div className="cpm-hint">{description.length} / 500</div>
                    </div>

                    <div className="cpm-row">
                        <div className="cpm-field">
                            <label className="cpm-label"><Tag size={13}/> Категория</label>
                            <select
                                className="cpm-input"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="cpm-field">
                            <label className="cpm-label"><Calendar size={13}/> Завершить</label>
                            <input
                                className="cpm-input"
                                type="datetime-local"
                                value={endsAt}
                                onChange={e => setEndsAt(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="cpm-field">
                        <label className="cpm-label">Варианты ответа</label>
                        <div className="cpm-options">
                            {options.map((opt, i) => (
                                <div key={i} className="cpm-option">
                                    <span className="cpm-option__num">{i + 1}</span>
                                    <input
                                        className="cpm-input"
                                        value={opt}
                                        onChange={e => updateOption(i, e.target.value)}
                                        placeholder={`Вариант ${i + 1}`}
                                        maxLength={80}
                                    />
                                    {options.length > 2 && (
                                        <button
                                            type="button"
                                            className="cpm-option__remove"
                                            onClick={() => removeOption(i)}
                                            aria-label="Удалить вариант"
                                        >
                                            <Trash2 size={14}/>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button type="button" className="cpm-option__add" onClick={addOption}>
                            <Plus size={13}/> Добавить вариант
                        </button>
                    </div>

                    <div className="cpm-notice">
                        После создания голосование автоматически появится в приложении у жильцов
                        и они получат push-уведомление.
                    </div>

                    <div className="cpm-actions">
                        <button type="button" className="cpm-btn cpm-btn--ghost" onClick={onClose} disabled={submitting}>
                            Отмена
                        </button>
                        <button type="submit" className="cpm-btn cpm-btn--primary" disabled={submitting}>
                            <Vote size={14}/> {submitting ? "Создаём…" : "Создать и разослать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
