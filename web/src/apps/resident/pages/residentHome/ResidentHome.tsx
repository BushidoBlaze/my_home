import {useCallback, useEffect, useRef, useState} from "react";
import {
    AlertCircle,
    Ban,
    Bell,
    CheckCircle,
    ChevronRight,
    Clock,
    Eye,
    MessageCircle,
    Wrench,
    Wallet,
    CreditCard,
    X,
} from "lucide-react";
import {Link} from "react-router-dom";
import "./ResidentHome.css";
import {quickServices} from "./data/quickServices.ts";
import {useResidentHome} from "./hooks/useResidentHome.ts";
import {getCategoryLabel, getEta, getGreeting, getProgress, getStatusLabel} from "./model/helpers.ts";

function QuickServiceIcon({name}: { name: string }) {
    if (name === "wrench") return <Wrench size={18}/>;
    if (name === "chat") return <MessageCircle size={18}/>;
    if (name === "wallet") return <Wallet size={18}/>;
    return <CreditCard size={18}/>;
}

export default function ResidentHome() {
    const fullName = localStorage.getItem("fullName") || "Житель";
    const greeting = getGreeting();
    const {
        notifications,
        loading,
        error,
        actionLoadingId,
        actionError,
        notificationOpen,
        active,
        done,
        unreadCount,
        loadData,
        toggleNotifications,
        markNotificationRead,
        markAllRead,
        cancelRequest,
    } = useResidentHome();
    const [isDrawerClosing, setIsDrawerClosing] = useState(false);
    const closeTimerRef = useRef<number | null>(null);

    const openNotifications = useCallback(() => {
        if (closeTimerRef.current) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
        setIsDrawerClosing(false);
        if (!notificationOpen) {
            toggleNotifications();
        }
    }, [notificationOpen, toggleNotifications]);

    const closeNotifications = useCallback(() => {
        if (!notificationOpen || isDrawerClosing) return;
        setIsDrawerClosing(true);
        closeTimerRef.current = window.setTimeout(() => {
            toggleNotifications();
            setIsDrawerClosing(false);
            closeTimerRef.current = null;
        }, 220);
    }, [isDrawerClosing, notificationOpen, toggleNotifications]);

    useEffect(() => {
        if (!notificationOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeNotifications();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [notificationOpen, closeNotifications]);

    useEffect(() => {
        return () => {
            if (closeTimerRef.current) {
                window.clearTimeout(closeTimerRef.current);
            }
        };
    }, []);

    const unreadNotifications = notifications.filter(n => !n.isRead);
    const readNotifications = notifications.filter(n => n.isRead);

    function formatNotificationDate(value: string) {
        const date = new Date(value);
        return date.toLocaleString("ru-RU", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return (
        <div className="res-home">
            {/* Шапка */}
            <div className="res-home__header">
                <div className="res-home__header-left">
                    <h1 className="res-home__greeting">{greeting}, {fullName.split(" ")[1]}!</h1>
                    <p className="res-home__date">
                        {new Date().toLocaleDateString("ru-RU", {
                            weekday: "long", day: "numeric", month: "long"
                        })}
                    </p>
                </div>
                <button
                    className="res-home__bell"
                    aria-label="Уведомления"
                    onClick={notificationOpen ? closeNotifications : openNotifications}
                >
                    <Bell size={20}/>
                    {unreadCount > 0 && (
                        <span className="res-home__bell-badge">{unreadCount}</span>
                    )}
                </button>
            </div>

            {notificationOpen && (
                <div
                    className={`res-home__notice-drawer-overlay ${isDrawerClosing ? "res-home__notice-drawer-overlay--closing" : ""}`}
                    onClick={closeNotifications}
                >
                    <aside
                        className={`res-home__notice-drawer ${isDrawerClosing ? "res-home__notice-drawer--closing" : ""}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="res-home__notice-panel-head">
                            <div>
                                <h3>Уведомления</h3>
                                <p className="res-home__notice-subtitle">
                                    {unreadCount > 0 ? `Новых: ${unreadCount}` : "Все уведомления прочитаны"}
                                </p>
                            </div>
                            <div className="res-home__notice-panel-actions">
                                <button
                                    className="res-home__link-btn"
                                    onClick={() => void markAllRead()}
                                    disabled={unreadCount === 0}
                                >
                                    Прочитать все
                                </button>
                                <button className="res-home__drawer-close" onClick={closeNotifications} aria-label="Закрыть уведомления">
                                    <X size={18}/>
                                </button>
                            </div>
                        </div>
                        {notifications.length === 0 ? (
                            <div className="res-home__notice-empty">
                                <Bell size={22}/>
                                <p className="res-home__notice-empty-text">Пока нет уведомлений. Как только появятся новости, мы сразу сообщим.</p>
                            </div>
                        ) : (
                            <>
                                {unreadNotifications.length > 0 && (
                                    <div className="res-home__notice-group">
                                        <p className="res-home__notice-group-title">Новые</p>
                                        <div className="res-home__notifications">
                                            {unreadNotifications.map(note => (
                                                <button
                                                    key={note.id}
                                                    className={`res-home__notice res-home__notice--${String(note.type).toLowerCase()}`}
                                                    onClick={() => void markNotificationRead(note.id)}
                                                >
                                                    <div className="res-home__notice-top">
                                                        <strong>{note.title}</strong>
                                                        <span className="res-home__notice-time">{formatNotificationDate(note.createdAt)}</span>
                                                    </div>
                                                    <span>{note.message}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {readNotifications.length > 0 && (
                                    <div className="res-home__notice-group">
                                        <p className="res-home__notice-group-title">Прочитанные</p>
                                        <div className="res-home__notifications">
                                            {readNotifications.map(note => (
                                                <button
                                                    key={note.id}
                                                    className={`res-home__notice res-home__notice--${String(note.type).toLowerCase()} res-home__notice--read`}
                                                    onClick={() => void markNotificationRead(note.id)}
                                                >
                                                    <div className="res-home__notice-top">
                                                        <strong>{note.title}</strong>
                                                        <span className="res-home__notice-time">{formatNotificationDate(note.createdAt)}</span>
                                                    </div>
                                                    <span>{note.message}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </aside>
                </div>
            )}

            {/* Статистика */}
            <div className="res-home__stats">
                <div className="res-home__stat res-home__stat--active">
                    <Clock className="res-home__stat-icon" size={24}/>
                    <div className="res-home__stat-info">
                        <span className="res-home__stat-value">{active.length}</span>
                        <span className="res-home__stat-label">Активных заявок</span>
                    </div>
                </div>

                <div className="res-home__stat res-home__stat--done">
                    <CheckCircle className="res-home__stat-icon" size={24}/>
                    <div className="res-home__stat-info">
                        <span className="res-home__stat-value">{done.length}</span>
                        <span className="res-home__stat-label">Выполнено</span>
                    </div>
                </div>

                <div className="res-home__stat res-home__stat--alert">
                    <AlertCircle className="res-home__stat-icon" size={24}/>
                    <div className="res-home__stat-info">
                        <span className="res-home__stat-value">{unreadCount}</span>
                        <span className="res-home__stat-label">Уведомлений</span>
                    </div>
                </div>
            </div>

            <div className="res-home__section">
                <div className="res-home__section-header">
                    <h2 className="res-home__section-title">Быстрые сервисы</h2>
                </div>
                <div className="res-home__quick-grid">
                    {quickServices.map(item => (
                        <Link key={item.id} to={item.to} className="res-home__quick-item">
                            <QuickServiceIcon name={item.icon}/>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Активные заявки */}
            <div className="res-home__section">
                <div className="res-home__section-header">
                    <h2 className="res-home__section-title">Активные заявки</h2>
                    <Link to="/app/requests" className="res-home__section-link">
                        Все заявки <ChevronRight size={16}/>
                    </Link>
                </div>

                {loading && <p className="res-home__empty">Загрузка...</p>}
                {!loading && error && (
                    <div className="res-home__error-block">
                        <p>{error}</p>
                        <button className="res-home__action-btn res-home__action-btn--primary" onClick={() => void loadData()}>
                            Повторить
                        </button>
                    </div>
                )}

                {!loading && !error && active.length === 0 && (
                    <div className="res-home__empty-block">
                        <CheckCircle size={40} className="res-home__empty-icon"/>
                        <p>Активных заявок нет</p>
                        <Link to="/app/requests" className="res-home__action-btn res-home__action-btn--primary">
                            Создать заявку
                        </Link>
                    </div>
                )}

                {actionError && <p className="res-home__error-inline">{actionError}</p>}

                <div className="res-home__cards">
                    {active.map(req => (
                        <div key={req.id} className="res-home__card">
                            <div className="res-home__card-top">
                                <span className="res-home__card-category">
                                    {getCategoryLabel(req.category)}
                                </span>
                                <span
                                    className={`res-home__card-status res-home__card-status--${req.status.toLowerCase()}`}>
                                    {getStatusLabel(req.status)}
                                </span>
                            </div>
                            <h3 className="res-home__card-title">{req.title}</h3>
                            <p className="res-home__card-desc">{req.description}</p>
                            <div className="res-home__card-progress-wrap">
                                <div className="res-home__card-progress-meta">
                                    <span>Прогресс: {getProgress(req.status)}%</span>
                                    <span>{getEta(req.createdAt, req.status)}</span>
                                </div>
                                <div className="res-home__card-progress">
                                    <div
                                        className="res-home__card-progress-bar"
                                        style={{width: `${getProgress(req.status)}%`}}
                                    />
                                </div>
                            </div>
                            <span className="res-home__card-date">
                                {new Date(req.createdAt).toLocaleDateString("ru-RU")}
                            </span>
                            <div className="res-home__card-actions">
                                <Link to="/app/requests" className="res-home__action-btn">
                                    <Eye size={14}/>
                                    Открыть
                                </Link>
                                <Link to="/app/chats" className="res-home__action-btn">
                                    <MessageCircle size={14}/>
                                    Чат
                                </Link>
                                {req.status === "New" && (
                                    <button
                                        className="res-home__action-btn res-home__action-btn--danger"
                                        onClick={() => void cancelRequest(req.id)}
                                        disabled={actionLoadingId === req.id}
                                    >
                                        <Ban size={14}/>
                                        {actionLoadingId === req.id ? "Отмена..." : "Отменить"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Выполненные заявки */}
            {!loading && !error && done.length > 0 && (
                <div className="res-home__section">
                    <div className="res-home__section-header">
                        <h2 className="res-home__section-title">Выполненные заявки</h2>
                    </div>
                    <div className="res-home__done-list">
                        {done.map(req => (
                            <div key={req.id} className="res-home__done-item">
                                <CheckCircle size={16} className="res-home__done-icon"/>
                                <div className="res-home__done-info">
                                    <span className="res-home__done-title">{req.title}</span>
                                    <span className="res-home__done-date">
                                        {new Date(req.createdAt).toLocaleDateString("ru-RU")}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}