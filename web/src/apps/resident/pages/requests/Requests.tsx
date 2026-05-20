import {requestsApi, type ServiceRequest} from "@/api/requests.api.ts";
// plugins
import {useState, useEffect, useRef} from "react";
import {Plus, X, Pencil, Trash2, ClipboardList, CheckCircle2, Clock4} from "lucide-react";

// api



// styles
import "./Requests.css";

type Tab = "active" | "done";

// Маппинг статусов на русский
function getStatusLabel(status: string) {
    const map: Record<string, string> = {
        New: "Новая",
        InProgress: "В работе",
        Done: "Выполнена",
    };
    return map[status] || status;
}

// Маппинг категорий на русский
function getCategoryLabel(category: string) {
    const map: Record<string, string> = {
        Repair: "Ремонт",
        Cleaning: "Уборка",
        Maintenance: "Обслуживание",
    };
    return map[category] || category;
}

// Страница заявок жителя
// Вкладки: Активные / Выполненные
// Создание, редактирование, удаление заявок
export default function Requests() {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<Tab>("active");

    // Модальное окно — create или edit
    const [modal, setModal] = useState<"create" | "edit" | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Поля формы
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Repair");

    // UI состояния формы
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Подтверждение удаления
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const formRef = useRef<HTMLFormElement | null>(null);

    useEffect(() => {
        void loadRequests();
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            if (modal) {
                closeModal();
                return;
            }
            if (deleteId) setDeleteId(null);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [modal, deleteId]);

    async function loadRequests() {
        setLoading(true);
        try {
            const data = await requestsApi.getMyRequests();
            setRequests(data);
        } finally {
            setLoading(false);
        }
    }

    // Открыть модалку создания
    function openCreate() {
        setTitle("");
        setDescription("");
        setCategory("Repair");
        setError("");
        setSuccess("");
        setEditingId(null);
        setModal("create");
    }

    // Открыть модалку редактирования
    function openEdit(req: ServiceRequest) {
        setTitle(req.title);
        setDescription(req.description);
        setCategory(req.category);
        setError("");
        setSuccess("");
        setEditingId(req.id);
        setModal("edit");
    }

    // Закрыть модалку
    function closeModal() {
        setModal(null);
        setEditingId(null);
        setError("");
        setSuccess("");
    }

    // Создать или сохранить заявку
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormLoading(true);
        setError("");

        try {
            if (modal === "edit" && editingId) {
                // Редактирование
                await requestsApi.updateRequest(editingId, {title, description, category});
                setSuccess("Заявка обновлена!");
            } else {
                // Создание
                await requestsApi.createRequest({title, description, category});
                setSuccess("Заявка создана!");
            }

            await loadRequests();

            setTimeout(() => {
                closeModal();
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка");
        } finally {
            setFormLoading(false);
        }
    }

    // Удалить заявку
    async function handleDelete() {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await requestsApi.deleteRequest(deleteId);
            setRequests(prev => prev.filter(r => r.id !== deleteId));
            setDeleteId(null);
        } catch (err) {
            console.error(err);
        } finally {
            setDeleteLoading(false);
        }
    }

    // Фильтруем по вкладке
    const filtered = requests.filter(r =>
        tab === "active" ? r.status !== "Done" : r.status === "Done"
    );

    const activeCount = requests.filter(r => r.status !== "Done").length;
    const doneCount   = requests.filter(r => r.status === "Done").length;
    const totalCount  = requests.length;

    return (
        <div className="requests">

            {/* Шапка */}
            <div className="requests__header">
                <div>
                    <h1 className="requests__title">Заявки</h1>
                    <p className="requests__subtitle">Управляйте своими обращениями</p>
                </div>
                <button className="requests__create-btn" onClick={openCreate}>
                    <Plus size={18}/>
                    Новая заявка
                </button>
            </div>

            {/* Статистика */}
            <div className="requests__stats">
                <div className="requests__stat-card requests__stat-card--total">
                    <div className="requests__stat-icon">
                        <ClipboardList size={18}/>
                    </div>
                    <div className="requests__stat-body">
                        <span className="requests__stat-value">{totalCount}</span>
                        <span className="requests__stat-label">Всего заявок</span>
                    </div>
                </div>
                <div className="requests__stat-card requests__stat-card--active">
                    <div className="requests__stat-icon">
                        <Clock4 size={18}/>
                    </div>
                    <div className="requests__stat-body">
                        <span className="requests__stat-value">{activeCount}</span>
                        <span className="requests__stat-label">Активных</span>
                    </div>
                </div>
                <div className="requests__stat-card requests__stat-card--done">
                    <div className="requests__stat-icon">
                        <CheckCircle2 size={18}/>
                    </div>
                    <div className="requests__stat-body">
                        <span className="requests__stat-value">{doneCount}</span>
                        <span className="requests__stat-label">Выполнено</span>
                    </div>
                </div>
            </div>

            {/* Вкладки */}
            <div className="requests__tabs">
                <button
                    className={`requests__tab ${tab === "active" ? "requests__tab--active" : ""}`}
                    onClick={() => setTab("active")}
                >
                    Активные
                    {activeCount > 0 && (
                        <span className="requests__tab-badge">{activeCount}</span>
                    )}
                </button>
                <button
                    className={`requests__tab ${tab === "done" ? "requests__tab--active" : ""}`}
                    onClick={() => setTab("done")}
                >
                    Выполненные
                </button>
            </div>

            {/* Состояния загрузки / пусто */}
            {loading && <p className="requests__loading">Загрузка...</p>}

            {!loading && filtered.length === 0 && (
                <div className="requests__empty">
                    <div className="requests__empty-icon">
                        <ClipboardList size={32}/>
                    </div>
                    <p className="requests__empty-title">
                        {tab === "active" ? "Нет активных заявок" : "Нет выполненных заявок"}
                    </p>
                    <p className="requests__empty-text">
                        {tab === "active"
                            ? "Подайте обращение в управляющую компанию — мы рассмотрим его в течение 24 часов"
                            : "Выполненные заявки появятся здесь после того, как УК закроет обращение"
                        }
                    </p>
                    {tab === "active" && (
                        <button className="requests__empty-btn" onClick={openCreate}>
                            Подать заявку
                        </button>
                    )}
                </div>
            )}

            {/* Список заявок */}
            <div className="requests__list">
                {filtered.map(req => (
                    <div key={req.id} className={`requests__item requests__item--${req.status.toLowerCase()}`}>
                        <div className="requests__item-top">
                            <span className="requests__item-category">
                                {getCategoryLabel(req.category)}
                            </span>
                            <div className="requests__item-right">
                                <span className={`requests__item-status requests__item-status--${req.status.toLowerCase()}`}>
                                    {getStatusLabel(req.status)}
                                </span>

                                {/* Кнопки редактирования и удаления — только для активных */}
                                {req.status !== "Done" && (
                                    <div className="requests__item-actions">
                                        <button
                                            className="requests__item-btn requests__item-btn--edit"
                                            onClick={() => openEdit(req)}
                                            title="Редактировать"
                                        >
                                            <Pencil size={14}/>
                                        </button>
                                        <button
                                            className="requests__item-btn requests__item-btn--delete"
                                            onClick={() => setDeleteId(req.id)}
                                            title="Удалить"
                                        >
                                            <Trash2 size={14}/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <h3 className="requests__item-title">{req.title}</h3>
                        <p className="requests__item-desc">{req.description}</p>
                        <span className="requests__item-date">
                            {new Date(req.createdAt).toLocaleDateString("ru-RU")}
                        </span>
                    </div>
                ))}
            </div>

            {/* Модальное окно создания / редактирования */}
            {modal && (
                <div className="requests__modal-overlay" onClick={closeModal}>
                    <div className="requests__modal" onClick={e => e.stopPropagation()}>
                        <div className="requests__modal-header">
                            <h2 className="requests__modal-title">
                                {modal === "edit" ? "Редактировать заявку" : "Новая заявка"}
                            </h2>
                            <button className="requests__modal-close" onClick={closeModal}>
                                <X size={20}/>
                            </button>
                        </div>

                        {error && <p className="requests__modal-error">{error}</p>}
                        {success && <p className="requests__modal-success">{success}</p>}

                        <form ref={formRef} className="requests__modal-form" onSubmit={handleSubmit}>
                            <label className="requests__modal-label">Тема</label>
                            <input
                                className="requests__modal-input"
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Например: Течёт кран"
                                required
                            />

                            <label className="requests__modal-label">Описание</label>
                            <textarea
                                className="requests__modal-textarea"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Опишите проблему подробнее..."
                                onKeyDown={(e) => {
                                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                                        e.preventDefault();
                                        formRef.current?.requestSubmit();
                                    }
                                }}
                                required
                            />

                            <label className="requests__modal-label">Категория</label>
                            <select
                                className="requests__modal-select"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                {/* Добавляй новые категории здесь и в getCategoryLabel */}
                                <option value="Repair">Ремонт</option>
                                <option value="Cleaning">Уборка</option>
                                <option value="Maintenance">Обслуживание</option>
                            </select>

                            <button
                                className="requests__modal-submit"
                                type="submit"
                                disabled={formLoading}
                            >
                                {formLoading
                                    ? "Сохраняем..."
                                    : modal === "edit" ? "Сохранить изменения" : "Отправить заявку"
                                }
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Модальное окно подтверждения удаления */}
            {deleteId && (
                <div className="requests__modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="requests__modal requests__modal--confirm" onClick={e => e.stopPropagation()}>
                        <h2 className="requests__modal-title">Удалить заявку?</h2>
                        <p className="requests__confirm-text">
                            Это действие нельзя отменить. Заявка будет удалена навсегда.
                        </p>
                        <div className="requests__confirm-actions">
                            <button
                                className="requests__confirm-cancel"
                                onClick={() => setDeleteId(null)}
                            >
                                Отмена
                            </button>
                            <button
                                className="requests__confirm-delete"
                                onClick={handleDelete}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? "Удаляем..." : "Удалить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}