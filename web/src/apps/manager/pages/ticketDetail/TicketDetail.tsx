// plugins
import {useCallback, useEffect, useState, type JSX} from "react";
import {Link, useParams, useNavigate} from "react-router-dom";
import {
    ChevronRight, Check, AlertTriangle, Phone, MessageCircle, Map, Building2,
    Pencil, Paperclip, Sparkles, Send, Wrench,
} from "lucide-react";
import {toast} from "sonner";

// api
import {requestsApi, type ManagerRequestDetail} from "@/api/requests.api.ts";

// ui
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import {BuildingSwatch} from "@/shared/ui/BuildingSwatch/BuildingSwatch.tsx";
import {DataError, DataLoading} from "@/apps/manager/pages/home/ui/DataState.tsx";

// styles
import "./TicketDetail.css";

// ──────────────────────────────────────────────────────────────────────────────
// Маппинги отображения статуса/приоритета на лейблы и цвета.
const STATUS_LABEL: Record<string, string> = {
    New: "Новая",
    // Легаси-статус «Assigned» больше не используется (назначение исполнителя убрано) —
    // показываем такие заявки как «Новая».
    Assigned: "Новая",
    InProgress: "В работе",
    Review: "На проверке",
    Done: "Выполнена",
};

const STATUS_CHIP: Record<string, string> = {
    New: "chip",
    Assigned: "chip",
    InProgress: "chip chip--info",
    Review: "chip chip--warning",
    Done: "chip chip--emerald",
};

const PRIORITY_LABEL: Record<string, string> = {
    High: "Аварийный",
    Med: "Срочный",
    Low: "Плановый",
};

const PRIORITY_CHIP: Record<string, string> = {
    High: "chip chip--danger",
    Med: "chip chip--warning",
    Low: "chip",
};

// Категории заявок хранятся английскими кодами (см. форму жителя) — переводим на русский.
const CATEGORY_LABEL: Record<string, string> = {
    Plumbing: "Сантехника",
    Electric: "Электрика",
    Repair: "Ремонт",
    Cleaning: "Уборка",
    Access: "Доступ",
    Yard: "Двор",
    Security: "Безопасность",
    Heating: "Отопление",
    Lift: "Лифт",
    Other: "Другое",
};

/** Возможные следующие статусы (для смены статуса вручную). */
const NEXT_STATUSES = ["InProgress", "Review", "Done"] as const;

function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", {day: "numeric", month: "long"}) +
        " · " + d.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"});
}

function formatAddress(r: ManagerRequestDetail["resident"]): {addr: string; sub: string} {
    const street = r.street?.trim();
    const house = r.house?.trim();
    const apt = r.apartmentNumber?.trim();
    const entrance = r.entrance?.trim();
    const floor = r.floor?.trim();
    const head = [street, house].filter(Boolean).join(", ") || "Адрес не указан";
    const subParts = [
        entrance ? `подъезд ${entrance}` : null,
        floor ? `${floor}-й этаж` : null,
        apt ? `квартира ${apt}` : null,
    ].filter(Boolean);
    return {addr: head, sub: subParts.join(" · ")};
}

/** Рассчитывает SLA-индикатор. */
function computeSla(priority: string, createdAt: string, status: string): {
    deadline: string;
    breached: boolean;
    note: string;
} | null {
    if (status === "Done") return null;
    const slaHours = priority === "High" ? 4 : priority === "Low" ? 72 : 24;
    const deadline = new Date(new Date(createdAt).getTime() + slaHours * 3_600_000);
    const breached = Date.now() > deadline.getTime();
    return {
        deadline: formatDateTime(deadline.toISOString()),
        breached,
        note: breached
            ? `${priority === "High" ? "Аварийная" : priority === "Low" ? "Плановая" : "Срочная"} заявка должна закрываться за ${slaHours} ч.`
            : `Срок исполнения по SLA: ${slaHours} ч.`,
    };
}

export default function TicketDetail(): JSX.Element {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();

    const [request, setRequest] = useState<ManagerRequestDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [statusChanging, setStatusChanging] = useState(false);

    const fetchRequest = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await requestsApi.getRequestById(id);
            setRequest(data);
        } catch (e) {
            setError(e instanceof Error ? e : new Error(String(e)));
            setRequest(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { void fetchRequest(); }, [fetchRequest]);

    async function handleStatusChange(nextStatus: string) {
        if (!request || nextStatus === request.status) return;
        setStatusChanging(true);
        try {
            await requestsApi.updateStatus(request.id, nextStatus);
            toast.success(`Статус изменён: «${STATUS_LABEL[nextStatus] ?? nextStatus}»`);
            await fetchRequest();
        } catch (e) {
            toast.error("Не удалось изменить статус", {
                description: e instanceof Error ? e.message : undefined,
            });
        } finally {
            setStatusChanging(false);
        }
    }

    async function handleClose() {
        if (!request) return;
        await handleStatusChange("Done");
    }

    function handleSubmitComment(e: React.FormEvent) {
        e.preventDefault();
        // Бэкенд не хранит внутренние комментарии к заявкам; показываем тост,
        // оставляем форму для будущей интеграции.
        if (!comment.trim()) return;
        setSubmitting(true);
        toast("Комментарии к заявкам пока не сохраняются", {
            description: "Бэкенд-эндпоинт будет добавлен отдельно.",
        });
        setComment("");
        setSubmitting(false);
    }

    if (loading) {
        return <div style={{padding: 24}}><DataLoading label="Загружаем заявку…"/></div>;
    }

    if (error || !request) {
        return (
            <div style={{padding: 24}}>
                <DataError
                    title="Не удалось загрузить заявку"
                    message={error?.message ?? "Заявка не найдена."}
                    onRetry={fetchRequest}
                />
                <button
                    type="button"
                    className="btn btn--sm"
                    style={{marginTop: 16}}
                    onClick={() => navigate("/manager/tickets")}
                >
                    Вернуться к списку
                </button>
            </div>
        );
    }

    const shortCode = `Т-${request.id.slice(0, 4).toUpperCase()}`;
    const sla = computeSla(request.priority, request.createdAt, request.status);
    const address = formatAddress(request.resident);

    return (
        <>
            <header className="td-header">
                <div className="td-header__title-wrap">
                    <div className="td-header__breadcrumb">
                        <Link to="/manager/tickets" style={{color: "inherit"}}>Заявки</Link>
                        <ChevronRight size={11}/>
                        <span className="mono">{shortCode}</span>
                    </div>
                    <div className="td-header__title-row">
                        <span className="td-header__title">{request.title}</span>
                        {request.priority === "High" && (
                            <span className={PRIORITY_CHIP[request.priority]}>
                                <span className="chip__dot"/>{PRIORITY_LABEL[request.priority].toUpperCase()}
                            </span>
                        )}
                        <span className={STATUS_CHIP[request.status] ?? "chip"}>
                            <span className="chip__dot"/>{STATUS_LABEL[request.status] ?? request.status}
                        </span>
                    </div>
                </div>

                <div className="td-header__actions">
                    <div className="td-header__divider"/>
                    <select
                        className="btn btn--sm"
                        value={request.status}
                        disabled={statusChanging}
                        onChange={e => void handleStatusChange(e.target.value)}
                        title="Сменить статус"
                    >
                        {NEXT_STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className="btn btn--sm btn--primary"
                        disabled={statusChanging || request.status === "Done"}
                        onClick={() => void handleClose()}
                    >
                        <Check size={13}/>Закрыть
                    </button>
                </div>
            </header>

            <div className="td-grid">
                <div className="td-main">
                    {sla && (
                        <div className="td-sla" style={!sla.breached ? {background: "#f1f5f9"} : undefined}>
                            <div className="td-sla__icon">
                                <AlertTriangle size={18}/>
                            </div>
                            <div className="td-sla__text">
                                <div className="td-sla__title">
                                    {sla.breached ? `SLA нарушен. Дедлайн был ${sla.deadline}` : `Дедлайн: ${sla.deadline}`}
                                </div>
                                <div className="td-sla__sub">{sla.note}</div>
                            </div>
                        </div>
                    )}

                    <section>
                        <div className="td-section__head">
                            <div className="t-eyebrow">Описание</div>
                            <button type="button" className="btn btn--sm btn--ghost btn--icon" disabled>
                                <Pencil size={12}/>
                            </button>
                        </div>
                        <div className="td-description">{request.description || "—"}</div>
                    </section>

                    <section>
                        <div className="t-eyebrow td-tl__heading">Журнал</div>
                        <div className="td-tl">
                            <div className="td-tl__rail"/>
                            {request.updatedAt && request.updatedAt !== request.createdAt && (
                                <div className="td-tl__item">
                                    <div className="td-tl__icon" style={{background: "#f1f5f9", color: "#334155"}}>
                                        <Wrench size={13}/>
                                    </div>
                                    <div className="td-tl__head">
                                        <span className="td-tl__actor">Система</span>
                                        <span className="td-tl__title">Заявка обновлена</span>
                                        <span className="tnum td-tl__time">{formatDateTime(request.updatedAt)}</span>
                                    </div>
                                    <div className="td-tl__body">
                                        Текущий статус: «{STATUS_LABEL[request.status] ?? request.status}».
                                    </div>
                                </div>
                            )}
                            <div className="td-tl__item">
                                <div className="td-tl__icon" style={{background: "#f1f5f9", color: "#334155"}}>
                                    <Phone size={13}/>
                                </div>
                                <div className="td-tl__head">
                                    <span className="td-tl__actor">{request.resident.fullName}</span>
                                    <span className="td-tl__title">Создана заявка</span>
                                    <span className="tnum td-tl__time">{formatDateTime(request.createdAt)}</span>
                                </div>
                                <div className="td-tl__body">{request.description}</div>
                            </div>
                        </div>
                    </section>

                    <form className="td-reply" onSubmit={handleSubmitComment}>
                        <div className="td-reply__tabs">
                            <button type="button" className="btn btn--sm td-reply__tab--active">Внутренний комментарий</button>
                        </div>
                        <textarea
                            className="td-reply__textarea"
                            placeholder="Напишите комментарий по заявке…"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                        <div className="td-reply__foot">
                            <div className="td-reply__tools">
                                <button type="button" className="btn btn--icon btn--sm btn--ghost" disabled>
                                    <Paperclip size={14}/>
                                </button>
                                <button type="button" className="btn btn--icon btn--sm btn--ghost" disabled>
                                    <Sparkles size={14}/>
                                </button>
                            </div>
                            <button type="submit" className="btn btn--primary btn--sm" disabled={submitting || !comment.trim()}>
                                <Send size={13}/>Отправить
                            </button>
                        </div>
                    </form>
                </div>

                <aside className="td-side">
                    <div>
                        <div className="t-eyebrow">Свойства</div>
                        <div className="td-props">
                            <div className="td-prop">
                                <div className="td-prop__label">Категория</div>
                                <div className="td-prop__value">{CATEGORY_LABEL[request.category] ?? request.category}</div>
                            </div>
                            <div className="td-prop">
                                <div className="td-prop__label">Приоритет</div>
                                <div className="td-prop__value">
                                    <span className={PRIORITY_CHIP[request.priority] ?? "chip"}>
                                        <span className="chip__dot"/>{PRIORITY_LABEL[request.priority] ?? request.priority}
                                    </span>
                                </div>
                            </div>
                            <div className="td-prop">
                                <div className="td-prop__label">Создана</div>
                                <div className="td-prop__value">{formatDateTime(request.createdAt)}</div>
                            </div>
                            {request.updatedAt && (
                                <div className="td-prop">
                                    <div className="td-prop__label">Обновлена</div>
                                    <div className="td-prop__value">{formatDateTime(request.updatedAt)}</div>
                                </div>
                            )}
                            {sla && (
                                <div className="td-prop">
                                    <div className="td-prop__label">Дедлайн SLA</div>
                                    <div className="td-prop__value">
                                        <span className="tnum" style={{color: sla.breached ? "#ef4444" : "inherit"}}>
                                            {sla.deadline}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="td-prop">
                                <div className="td-prop__label">ID</div>
                                <div className="td-prop__value">
                                    <span className="mono" style={{color: "#64748b"}}>{request.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="t-eyebrow">Адрес</div>
                        <div className="td-card">
                            <BuildingSwatch size={36} color={request.priority === "High" ? "#ef4444" : "#0ea5e9"} label="A"/>
                            <div className="td-card__main">
                                <div className="td-card__title">{address.addr}</div>
                                <div className="td-card__sub">{address.sub || "Детали не указаны"}</div>
                                <div className="td-card__actions">
                                    <button type="button" className="btn btn--sm btn--ghost" disabled>
                                        <Map size={12}/>На карте
                                    </button>
                                    <button type="button" className="btn btn--sm btn--ghost" disabled>
                                        <Building2 size={12}/>Карточка дома
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="t-eyebrow">Жилец</div>
                        <div className="td-card td-card--row">
                            <Avatar name={request.resident.fullName} size={36}/>
                            <div className="td-card__main">
                                <div className="td-card__title">{request.resident.fullName}</div>
                                <div className="td-card__sub">
                                    {request.resident.email ?? "—"}
                                </div>
                            </div>
                            {request.resident.phone && (
                                <a href={`tel:${request.resident.phone}`} className="btn btn--icon btn--sm" title={request.resident.phone}>
                                    <Phone size={13}/>
                                </a>
                            )}
                            <button type="button" className="btn btn--icon btn--sm" disabled>
                                <MessageCircle size={13}/>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
}
