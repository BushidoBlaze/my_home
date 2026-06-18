import {useEffect, useRef, type JSX} from "react";
import {AlertTriangle, BellRing, CheckCheck, Info} from "lucide-react";
import type {NotificationItem} from "@/api/notifications.api.ts";
import "./NotificationsPopover.css";

interface NotificationsPopoverProps {
    items: NotificationItem[];
    unreadCount: number;
    loading: boolean;
    error: string;
    open: boolean;
    onClose: () => void;
    onToggleRead: (id: string) => void;
    onMarkAllRead: () => void;
}

// Иконка слева от уведомления зависит от типа. Если тип неизвестен — fallback на Info.
function NotificationIcon({type}: { type: string }) {
    if (type === "Warning") return <AlertTriangle size={16}/>;
    if (type === "Success") return <CheckCheck size={16}/>;
    return <Info size={16}/>;
}

// Форматирование даты в человеческом виде: "сейчас", "5 мин назад", "вчера", "23 мая".
function formatRelative(iso: string): string {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "сейчас";
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86_400) return `${Math.floor(diff / 3600)} ч назад`;
    if (diff < 172_800) return "вчера";
    return new Date(iso).toLocaleDateString("ru-RU", {day: "numeric", month: "short"});
}

// Боковая панель с уведомлениями. Открывается по клику на колокольчик,
// закрывается по клику снаружи, по Escape или по кнопке закрытия.
export function NotificationsPopover({
                                         items,
                                         unreadCount,
                                         loading,
                                         error,
                                         open,
                                         onClose,
                                         onToggleRead,
                                         onMarkAllRead,
                                     }: NotificationsPopoverProps): JSX.Element | null {
    const ref = useRef<HTMLDivElement>(null);

    // Outside-click и Escape — обязательная гигиена для поповера, иначе он будет висеть.
    useEffect(() => {
        if (!open) return;

        function onDocClick(e: MouseEvent) {
            // Игнорируем клики по самой панели и по триггеру (колокольчику).
            const target = e.target as HTMLElement;
            if (ref.current?.contains(target)) return;
            if (target.closest("[data-notifications-trigger]")) return;
            onClose();
        }

        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }

        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="notifications-popover" ref={ref} role="dialog" aria-label="Уведомления">
            <header className="notifications-popover__head">
                <div className="notifications-popover__title-wrap">
                    <h3 className="notifications-popover__title">Уведомления</h3>
                    {unreadCount > 0 && (
                        <span className="notifications-popover__counter">{unreadCount}</span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        type="button"
                        className="notifications-popover__mark-all"
                        onClick={onMarkAllRead}
                    >
                        <CheckCheck size={14}/> Прочитать все
                    </button>
                )}
            </header>

            <div className="notifications-popover__body">
                {loading && items.length === 0 && (
                    <div className="notifications-popover__state">Загружаем уведомления…</div>
                )}

                {error && (
                    <div className="notifications-popover__state notifications-popover__state--error">{error}</div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="notifications-popover__empty">
                        <BellRing size={32} strokeWidth={1.5}/>
                        <span>Пока тихо. Здесь будут новости от УК, статусы заявок и напоминания.</span>
                    </div>
                )}

                <ul className="notifications-popover__list">
                    {items.map(n => {
                        const itemClass = [
                            "notifications-popover__item",
                            !n.isRead && "notifications-popover__item--unread",
                            "notifications-popover__item--" + (n.type || "Info").toLowerCase(),
                        ].filter(Boolean).join(" ");

                        return (
                            <li key={n.id}>
                                {/* Весь элемент — кнопка, клик переключает read/unread.
                                    Чтобы интерактивность была явной для скринридеров. */}
                                <button
                                    type="button"
                                    className={itemClass}
                                    onClick={() => onToggleRead(n.id)}
                                    aria-label={n.isRead ? "Пометить как непрочитанное" : "Пометить как прочитанное"}
                                >
                                    <div className="notifications-popover__icon">
                                        <NotificationIcon type={n.type}/>
                                    </div>
                                    <div className="notifications-popover__content">
                                        <div className="notifications-popover__row">
                                            <span className="notifications-popover__item-title">{n.title}</span>
                                            <span
                                                className="notifications-popover__time">{formatRelative(n.createdAt)}</span>
                                        </div>
                                        <div className="notifications-popover__message">{n.message}</div>
                                    </div>
                                    {/* Зелёная точка-индикатор непрочитанного */}
                                    {!n.isRead && <span className="notifications-popover__dot" aria-hidden="true"/>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
