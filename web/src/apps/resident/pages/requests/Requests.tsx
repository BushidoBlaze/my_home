//plugins
import {useEffect, useRef, useState, type JSX} from "react";
import {
    Plus, X, Pencil, Trash2, ClipboardList, CheckCircle2, Clock,
    Star, Droplet, Wrench, Brush, Zap, Leaf, Key, Shield, Info,
    Filter, Search, Paperclip, MessageCircle
} from "lucide-react";

//api
import {requestsApi, type ServiceRequest} from "@/api/requests.api.ts";

//hooks
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

//ui and ui-components
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import {Progress} from "@/shared/ui/Progress/Progress.tsx";
import ResidentTopBar from "@/apps/resident/_shared/ResidentTopBar.tsx";

//styles
import "./Requests.css";

type Tab = "active" | "done";

const STATUS_LABEL: Record<string, string> = {
    New: "Новая",
    Assigned: "Назначена",
    InProgress: "В работе",
    Review: "Проверка",
    Done: "Выполнена",
};

const STATUS_TONE: Record<string, string> = {
    New: "warning",
    Assigned: "info",
    InProgress: "info",
    Review: "info",
    Done: "emerald",
};

const CATEGORIES = [
    {value: "Plumbing", label: "Сантехника", icon: Droplet, fg: "#0369a1", bg: "#e0f2fe", sla: "до 24 ч"},
    {value: "Electric", label: "Электрика", icon: Zap, fg: "#b45309", bg: "#fef3c7", sla: "до 24 ч"},
    {value: "Repair", label: "Ремонт", icon: Wrench, fg: "#b45309", bg: "#fef3c7", sla: "до 3 дн."},
    {value: "Cleaning", label: "Уборка", icon: Brush, fg: "#047857", bg: "#d1fae5", sla: "по графику"},
    {value: "Access", label: "Доступ", icon: Key, fg: "#6d28d9", bg: "#ede9fe", sla: "до 48 ч"},
    {value: "Yard", label: "Двор", icon: Leaf, fg: "#047857", bg: "#d1fae5", sla: "до 3 дн."},
    {value: "Security", label: "Безопасность", icon: Shield, fg: "#0f172a", bg: "#f1f5f9", sla: "до 4 ч"},
    {value: "Other", label: "Другое", icon: Info, fg: "#64748b", bg: "#f1f5f9", sla: "до 48 ч"},
] as const;

function getCategoryMeta(value: string) {
    return CATEGORIES.find(c => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
}

function shortId(id: string): string {
    return "Т-" + id.replace(/-/g, "").slice(0, 4).toUpperCase();
}

function getProgress(status: string): number {
    if (status === "Done") return 100;
    if (status === "Review") return 85;
    if (status === "InProgress") return 65;
    if (status === "Assigned") return 40;
    return 15;
}

function getEta(status: string, createdAt: string): string {
    if (status === "Done") return "Выполнена";
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000);
    return status === "InProgress" ? `ETA ~ ${Math.max(1, 3 - days)} дн.` : `ETA до ${Math.max(1, 5 - days)} дн.`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("ru-RU", {day: "numeric", month: "long"}) +
        " · " + new Date(iso).toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"});
}

export default function Requests(): JSX.Element {
    useDocumentTitle('Мои заявки');

    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<Tab>("active");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [modal, setModal] = useState<"create" | "edit" | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Plumbing");
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const formRef = useRef<HTMLFormElement | null>(null);

    useEffect(() => {
        void loadRequests();
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            if (modal) closeModal();
            else if (deleteId) setDeleteId(null);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [modal, deleteId]);

    async function loadRequests() {
        setLoading(true);
        try {
            const data = await requestsApi.getMyRequests();
            setRequests(data);
            if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
        } catch {
            // graceful — пустой список покажет empty state
        } finally {
            setLoading(false);
        }
    }

    function openCreate() {
        setTitle("");
        setDescription("");
        setCategory("Plumbing");
        setError("");
        setEditingId(null);
        setModal("create");
    }

    function openEdit(req: ServiceRequest) {
        setTitle(req.title);
        setDescription(req.description);
        setCategory(req.category);
        setError("");
        setEditingId(req.id);
        setModal("edit");
    }

    function closeModal() {
        setModal(null);
        setEditingId(null);
        setError("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            setError("Заполните заголовок и описание");
            return;
        }
        setFormLoading(true);
        setError("");
        try {
            if (modal === "edit" && editingId) {
                await requestsApi.updateRequest(editingId, {title, description, category});
            } else {
                await requestsApi.createRequest({title, description, category});
            }
            await loadRequests();
            closeModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка");
        } finally {
            setFormLoading(false);
        }
    }

    async function handleDelete() {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await requestsApi.deleteRequest(deleteId);
            setRequests(prev => prev.filter(r => r.id !== deleteId));
            setDeleteId(null);
        } finally {
            setDeleteLoading(false);
        }
    }

    const q = search.trim().toLowerCase();
    const filtered = requests.filter(r => {
        if (tab === "active" && r.status === "Done") return false;
        if (tab === "done" && r.status !== "Done") return false;
        if (q && !r.title.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) return false;
        return true;
    });

    const activeCount = requests.filter(r => r.status !== "Done").length;
    const doneCount = requests.filter(r => r.status === "Done").length;
    const totalCount = requests.length;

    const selected = filtered.find(r => r.id === selectedId) ?? filtered[0] ?? null;
    const selectedMeta = selected ? getCategoryMeta(selected.category) : null;

    return (
        <div className="r-req">
            <ResidentTopBar
                title="Заявки"
                subtitle="Ремонт, уборка, доступ — обращение к вашей УК"
                right={
                    <button className="btn btn--primary" onClick={openCreate}>
                        <Plus size={14}/> Создать новую заявку
                    </button>
                }
            />

            <div className="r-req__content">

                {/* Stats */}
                <div className="r-req__stats">
                    <ReqStat icon={ClipboardList} tone="default" label="Всего" value={totalCount}/>
                    <ReqStat icon={Clock} tone="warning" label="В работе" value={activeCount}
                             sub={activeCount > 0 ? "ждут ответа УК" : "новых нет"}/>
                    <ReqStat icon={CheckCircle2} tone="emerald" label="Закрыто" value={doneCount}
                             sub={doneCount > 0 ? "за год" : "—"}/>
                    <ReqStat icon={Star} tone="violet" label="Оценка" value="4.7" sub="из 5 · 5 отзывов"/>
                </div>

                {/* Tabs + search */}
                <div className="r-req__tabs">
                    <button
                        className={"r-req__tab" + (tab === "active" ? " r-req__tab--active" : "")}
                        onClick={() => setTab("active")}
                    >
                        Активные
                    </button>
                    <button
                        className={"r-req__tab" + (tab === "done" ? " r-req__tab--active" : "")}
                        onClick={() => setTab("done")}
                    >
                        Выполнено
                    </button>
                    <span className="r-req__spacer"/>
                    <div className="r-req__search">
                        <Search size={13} style={{color: "#64748b"}}/>
                        <input
                            type="text"
                            placeholder="Поиск по заявкам"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="btn btn--sm btn--ghost"><Filter size={12}/> Категория</button>
                </div>

                {/* Main grid: list + detail */}
                <div className="r-req__layout">

                    <div className="r-req__list">
                        {loading && <div className="r-req__loading">Загружаем заявки…</div>}

                        {!loading && filtered.length === 0 && (
                            <div className="r-req__empty">
                                <ClipboardList size={36} strokeWidth={1.5}/>
                                <div className="r-req__empty-title">
                                    {tab === "active" ? "Активных заявок нет" : "Закрытых заявок нет"}
                                </div>
                                <div className="r-req__empty-sub">
                                    {tab === "active"
                                        ? "Подайте обращение — мы рассмотрим его в течение 24 часов."
                                        : "Когда вы закроете заявку, она появится здесь."}
                                </div>
                                {tab === "active" && (
                                    <button className="btn btn--primary" onClick={openCreate} style={{marginTop: 12}}>
                                        <Plus size={13}/> Подать заявку
                                    </button>
                                )}
                            </div>
                        )}

                        {!loading && filtered.map(req => (
                            <ReqCard
                                key={req.id}
                                req={req}
                                selected={req.id === selected?.id}
                                onSelect={() => setSelectedId(req.id)}
                                onEdit={() => openEdit(req)}
                                onDelete={() => setDeleteId(req.id)}
                            />
                        ))}
                    </div>

                    {selected && selectedMeta && (
                        <ReqDetail req={selected} meta={selectedMeta} onEdit={() => openEdit(selected)}/>
                    )}
                </div>
            </div>

            {/* Modal create/edit */}
            {modal && (
                <div className="r-req__modal-backdrop" onMouseDown={closeModal}>
                    <div className="r-req__modal" onMouseDown={e => e.stopPropagation()}>
                        <div className="r-req__modal-head">
                            <div className="r-req__modal-title">
                                {modal === "create" ? "Новая заявка" : "Редактировать заявку"}
                            </div>
                            <button className="r-req__modal-close" onClick={closeModal} aria-label="Закрыть">
                                <X size={18}/>
                            </button>
                        </div>

                        <form ref={formRef} className="r-req__form" onSubmit={handleSubmit}>
                            {error && <div className="r-req__form-error">{error}</div>}

                            <div className="r-req__field">
                                <label className="r-req__label">Категория</label>
                                <div className="r-req__cat-grid">
                                    {CATEGORIES.map(c => {
                                        const Icon = c.icon;
                                        const sel = category === c.value;
                                        return (
                                            <button
                                                key={c.value}
                                                type="button"
                                                className={"r-req__cat" + (sel ? " r-req__cat--selected" : "")}
                                                onClick={() => setCategory(c.value)}
                                            >
                                                <Icon size={20} style={{color: sel ? "#047857" : c.fg}}/>
                                                <div className="r-req__cat-label">{c.label}</div>
                                                <div className="r-req__cat-sla">{c.sla}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="r-req__field">
                                <label className="r-req__label">Тема <span className="r-req__req">*</span></label>
                                <input
                                    className="r-req__input"
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Не отключается вода в смесителе кухни"
                                    maxLength={120}
                                />
                            </div>

                            <div className="r-req__field">
                                <label className="r-req__label">
                                    Что произошло <span className="r-req__req">*</span>
                                    <span className="r-req__hint">· чем подробнее, тем точнее назначим мастера</span>
                                </label>
                                <textarea
                                    className="r-req__input r-req__textarea"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Опишите проблему: что не работает, когда началось, есть ли доступ…"
                                    rows={5}
                                    maxLength={1000}
                                />
                                <div className="r-req__counter">{description.length} / 1000</div>
                            </div>

                            <div className="r-req__form-actions">
                                <button type="button" className="btn" onClick={closeModal} disabled={formLoading}>
                                    Отмена
                                </button>
                                <button type="submit" className="btn btn--primary" disabled={formLoading}>
                                    {formLoading
                                        ? "Сохраняем…"
                                        : modal === "create" ? <><Plus size={13}/> Создать</> : "Сохранить"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm delete */}
            {deleteId && (
                <div className="r-req__modal-backdrop" onMouseDown={() => setDeleteId(null)}>
                    <div className="r-req__modal r-req__modal--narrow" onMouseDown={e => e.stopPropagation()}>
                        <div className="r-req__modal-head">
                            <div className="r-req__modal-title">Удалить заявку?</div>
                            <button className="r-req__modal-close" onClick={() => setDeleteId(null)}>
                                <X size={18}/>
                            </button>
                        </div>
                        <div className="r-req__delete-body">
                            Заявку нельзя будет восстановить. УК также не увидит её в своей очереди.
                        </div>
                        <div className="r-req__form-actions">
                            <button className="btn" onClick={() => setDeleteId(null)} disabled={deleteLoading}>
                                Отмена
                            </button>
                            <button
                                className="btn btn--danger"
                                onClick={() => void handleDelete()}
                                disabled={deleteLoading}
                            >
                                <Trash2 size={13}/> {deleteLoading ? "Удаляем…" : "Удалить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ---------- Sub-components ---------- */

interface ReqStatProps {
    icon: typeof Clock;
    tone: "default" | "warning" | "emerald" | "violet";
    label: string;
    value: number | string;
    sub?: string;
}

function ReqStat({icon: Icon, tone, label, value, sub}: ReqStatProps): JSX.Element {
    const colors: Record<ReqStatProps["tone"], string> = {
        default: "#64748b",
        warning: "#b45309",
        emerald: "#047857",
        violet: "#6d28d9",
    };
    const c = colors[tone];
    return (
        <div className="r-req__stat">
            <div className="r-req__stat-icon"
                 style={{background: `color-mix(in srgb, ${c} 12%, transparent)`, color: c}}>
                <Icon size={19}/>
            </div>
            <div className="r-req__stat-body">
                <div className="r-req__stat-label">{label}</div>
                <div className="tnum r-req__stat-value">{value}</div>
                {sub && <div className="r-req__stat-sub">{sub}</div>}
            </div>
        </div>
    );
}

interface ReqCardProps {
    req: ServiceRequest;
    selected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

function ReqCard({req, selected, onSelect, onEdit, onDelete}: ReqCardProps): JSX.Element {
    const meta = getCategoryMeta(req.category);
    const Icon = meta.icon;
    const tone = STATUS_TONE[req.status] ?? "";
    const isDone = req.status === "Done";

    return (
        <div
            className={"r-req__card" + (selected ? " r-req__card--selected" : "")}
            onClick={onSelect}
        >
            <div className="r-req__card-icon" style={{background: meta.bg, color: meta.fg}}>
                <Icon size={20}/>
            </div>

            <div className="r-req__card-body">
                <div className="r-req__card-meta">
                    <span className="mono r-req__card-id">{shortId(req.id)}</span>
                    <span className="chip">{meta.label}</span>
                    <span className="r-req__card-spacer"/>
                    <span className={"chip chip--" + tone}>
                        <span className="chip__dot"/>{STATUS_LABEL[req.status] ?? req.status}
                    </span>
                </div>

                <div className="r-req__card-title">{req.title}</div>
                <div className="r-req__card-desc">{req.description}</div>

                {!isDone && (
                    <div className="r-req__card-progress">
                        <div className="r-req__card-progress-meta">
                            <span>Готовность · {getEta(req.status, req.createdAt)}</span>
                            <span className="tnum">{getProgress(req.status)}%</span>
                        </div>
                        <Progress value={getProgress(req.status)} color="#10b981" h={6}/>
                    </div>
                )}

                <div className="r-req__card-foot">
                    <span className="r-req__card-date">{formatDate(req.createdAt)}</span>
                    <span className="r-req__card-spacer"/>
                    {req.status === "New" && (
                        <>
                            <button
                                className="r-req__card-icon-btn r-req__card-icon-btn--active"
                                onClick={e => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                title="Редактировать"
                            >
                                Изменить содержание заявки
                            </button>
                            <button
                                className="r-req__card-icon-btn r-req__card-icon-btn--danger"
                                onClick={e => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                title="Удалить"
                            >
                                <Trash2 size={13}/>
                                Удалить заявку
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function ReqDetail({req, meta, onEdit}: {
    req: ServiceRequest;
    meta: ReturnType<typeof getCategoryMeta>;
    onEdit: () => void
}): JSX.Element {
    const Icon = meta.icon;
    const isDone = req.status === "Done";

    return (
        <aside className="r-req__detail card">
            <div className="r-req__detail-head">
                <div className="r-req__detail-meta">
                    <span className="mono r-req__detail-id">{shortId(req.id)}</span>
                    <span className="chip">{meta.label}</span>
                    <span className={"chip chip--" + STATUS_TONE[req.status]}>
                        <span className="chip__dot"/>{STATUS_LABEL[req.status] ?? req.status}
                    </span>
                </div>
                <div className="r-req__detail-title">{req.title}</div>
                <div className="r-req__detail-created">Создана {formatDate(req.createdAt)}</div>
            </div>

            <div className="r-req__detail-section">
                <div className="t-eyebrow">Что произошло</div>
                <p className="r-req__detail-desc">{req.description}</p>
            </div>

            {!isDone && (
                <div className="r-req__detail-section">
                    <div className="t-eyebrow">Прогресс</div>
                    <div className="r-req__detail-progress-meta">
                        <span>{getEta(req.status, req.createdAt)}</span>
                        <span className="tnum">{getProgress(req.status)}%</span>
                    </div>
                    <Progress value={getProgress(req.status)} color="#10b981" h={6}/>
                </div>
            )}

            <div className="r-req__detail-section">
                <div className="t-eyebrow">Исполнитель</div>
                <div className="r-req__detail-assignee">
                    <Avatar name={req.resident || "Диспетчер УК"} size={36}/>
                    <div className="r-req__detail-assignee-body">
                        <div className="r-req__detail-assignee-name">
                            {isDone ? "Заявка закрыта" : "Назначается"}
                        </div>
                        <div className="r-req__detail-assignee-sub">
                            <Icon size={11} style={{color: meta.fg}}/> {meta.label}
                        </div>
                    </div>
                </div>
            </div>

            <div className="r-req__detail-actions">
                <button className="btn btn--primary"><MessageCircle size={13}/> Чат с УК</button>
                <button className="btn"><Paperclip size={13}/> Добавить фото</button>
                <span className="r-req__spacer"/>
                {req.status === "New" && (
                    <button className="btn btn--sm" onClick={onEdit}>
                        <Pencil size={12}/> Редактировать
                    </button>
                )}
            </div>
        </aside>
    );
}
