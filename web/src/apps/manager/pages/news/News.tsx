// plugins
import {useCallback, useEffect, useMemo, useState, type JSX} from "react";
import {Plus, Megaphone, Pin, Pencil, Trash2, AlertTriangle} from "lucide-react";
import {toast} from "sonner";

// api
import {newsApi, type NewsItem} from "@/api/news.api.ts";

// hooks


// ui
import TopBar from "@/widgets/topBar/ui/TopBar.tsx";
import {DataError, DataLoading} from "@/apps/manager/pages/home/ui/DataState.tsx";
import NewsEditorModal from "./ui/NewsEditorModal.tsx";

// styles
import "./News.css";

const IMPORTANCE_STYLE: Record<string, {bg: string; fg: string; label: string}> = {
    High: {bg: "#fee2e2", fg: "#b91c1c", label: "Срочно"},
    Normal: {bg: "#e0f2fe", fg: "#0369a1", label: "Обычная"},
    Low: {bg: "#f1f5f9", fg: "#64748b", label: "Низкая"},
};

const CATEGORY_LABEL: Record<string, string> = {
    Announcement: "Объявление",
    Event: "Мероприятие",
    Maintenance: "Работы / отключения",
    Emergency: "Авария",
    Document: "Документ",
};

function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", {day: "numeric", month: "long", year: "numeric"}) +
        " · " + d.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"});
}

export default function News(): JSX.Element {
    const [items, setItems] = useState<NewsItem[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const [editorOpen, setEditorOpen] = useState(false);
    const [editing, setEditing] = useState<NewsItem | null>(null);

    const fetchNews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await newsApi.list({pageSize: 50});
            setItems(res.items);
        } catch (e) {
            setError(e instanceof Error ? e : new Error(String(e)));
            setItems(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void fetchNews(); }, [fetchNews]);

    const pinned = useMemo(() => items?.filter(i => i.isPinned) ?? [], [items]);
    const regular = useMemo(() => items?.filter(i => !i.isPinned) ?? [], [items]);

    const openCreate = () => { setEditing(null); setEditorOpen(true); };
    const openEdit = (item: NewsItem) => { setEditing(item); setEditorOpen(true); };

    const handleSaved = (_id: string, isNew: boolean) => {
        toast.success(isNew ? "Объявление опубликовано" : "Изменения сохранены", {
            description: isNew ? "Жильцы получили push-уведомление" : undefined,
        });
        void fetchNews();
    };

    const handleDelete = async (item: NewsItem) => {
        if (!confirm(`Удалить объявление «${item.title}»?`)) return;
        try {
            await newsApi.delete(item.id);
            toast.success("Объявление удалено");
            void fetchNews();
        } catch (e) {
            toast.error("Не удалось удалить", {
                description: e instanceof Error ? e.message : undefined,
            });
        }
    };

    const handleTogglePin = async (item: NewsItem) => {
        try {
            await newsApi.update(item.id, {isPinned: !item.isPinned});
            void fetchNews();
        } catch (e) {
            toast.error("Не удалось изменить", {
                description: e instanceof Error ? e.message : undefined,
            });
        }
    };

    const subtitle = loading
        ? "загрузка…"
        : error
            ? "ошибка загрузки"
            : `${items?.length ?? 0} объявлений · ${pinned.length} закреплено`;

    const renderCard = (item: NewsItem) => {
        const imp = IMPORTANCE_STYLE[item.importance] ?? IMPORTANCE_STYLE.Normal;
        return (
            <article key={item.id} className={"news-card" + (item.isPinned ? " news-card--pinned" : "")}>
                <div className="news-card__head">
                    <div className="news-card__head-left">
                        {item.isPinned && (
                            <span className="news-card__pin"><Pin size={11}/> Закреплено</span>
                        )}
                        <span
                            className="news-card__importance"
                            style={{background: imp.bg, color: imp.fg}}
                        >
                            {item.importance === "High" && <AlertTriangle size={11}/>}
                            {imp.label}
                        </span>
                        <span className="news-card__category">
                            {CATEGORY_LABEL[item.category] ?? item.category}
                        </span>
                    </div>

                    <div className="news-card__actions">
                        <button
                            type="button"
                            className="news-card__icon-btn"
                            onClick={() => handleTogglePin(item)}
                            title={item.isPinned ? "Открепить" : "Закрепить"}
                        >
                            <Pin size={14} style={{transform: item.isPinned ? "rotate(45deg)" : undefined}}/>
                        </button>
                        <button
                            type="button"
                            className="news-card__icon-btn"
                            onClick={() => openEdit(item)}
                            title="Редактировать"
                        >
                            <Pencil size={14}/>
                        </button>
                        <button
                            type="button"
                            className="news-card__icon-btn news-card__icon-btn--danger"
                            onClick={() => handleDelete(item)}
                            title="Удалить"
                        >
                            <Trash2 size={14}/>
                        </button>
                    </div>
                </div>

                <h3 className="news-card__title">{item.title}</h3>
                <p className="news-card__content">{item.content}</p>

                <div className="news-card__foot">
                    <span className="news-card__author">{item.author.fullName}</span>
                    <span className="news-card__date">{formatDate(item.publishedAt)}</span>
                    {item.commentsCount > 0 && (
                        <span className="news-card__comments">· {item.commentsCount} комм.</span>
                    )}
                </div>
            </article>
        );
    };

    return (
        <>
            <TopBar
                title="Новости и объявления"
                subtitle={subtitle}
                action={
                    <button className="btn btn--primary" onClick={openCreate}>
                        <Plus size={13}/> Новое объявление
                    </button>
                }
            />


            <div className="news-page">
                {loading && <DataLoading label="Загружаем объявления…"/>}

                {!loading && error && (
                    <DataError
                        title="Не удалось загрузить новости"
                        message="Бэкенд недоступен. Проверьте подключение и попробуйте снова."
                        onRetry={fetchNews}
                    />
                )}

                {!loading && !error && items && items.length === 0 && (
                    <div className="news-empty">
                        <Megaphone size={36} strokeWidth={1.5}/>
                        <div className="news-empty__title">Объявлений пока нет</div>
                        <div className="news-empty__sub">
                            Опубликуйте первое объявление — оно появится у жильцов и они получат push.
                        </div>
                        <button className="btn btn--primary" onClick={openCreate} style={{marginTop: 12}}>
                            <Plus size={13}/> Создать объявление
                        </button>
                    </div>
                )}

                {!loading && !error && items && items.length > 0 && (
                    <>
                        {pinned.length > 0 && (
                            <section className="news-section">
                                <div className="news-section__title">
                                    <Pin size={13}/> Закреплённые
                                </div>
                                <div className="news-list">
                                    {pinned.map(renderCard)}
                                </div>
                            </section>
                        )}

                        {regular.length > 0 && (
                            <section className="news-section">
                                <div className="news-section__title">Все объявления</div>
                                <div className="news-list">
                                    {regular.map(renderCard)}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>

            <NewsEditorModal
                open={editorOpen}
                initial={editing}
                onClose={() => setEditorOpen(false)}
                onSaved={handleSaved}
            />
        </>
    );
}
