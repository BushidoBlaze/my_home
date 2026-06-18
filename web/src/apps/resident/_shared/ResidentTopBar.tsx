import type {JSX, ReactNode} from "react";
import {Link} from "react-router-dom";
import {Bell} from "lucide-react";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import {NotificationsPopover} from "./NotificationsPopover.tsx";
import {useNotifications} from "./hooks/useNotifications.ts";
import {useResidentMe} from "./hooks/useResidentMe.ts";
import {resolveAvatarUrl} from "./lib/resolveAvatarUrl.ts";
import "./ResidentTopBar.css";

interface ResidentTopBarProps {
    title: string;
    subtitle?: string;
    right?: ReactNode;
}

// Общий топбар для всех страниц кабинета жителя:
// заголовок + подзаголовок, опциональные действия справа, колокольчик с поповером
// уведомлений и аватар (фото из профиля либо инициалы).
export default function ResidentTopBar({title, subtitle, right}: ResidentTopBarProps): JSX.Element {
    const me = useResidentMe();
    const notifications = useNotifications();

    // Имя для инициалов: если профиль ещё не загрузился — берём из localStorage,
    // чтобы не моргать заглушкой "Житель" на первом рендере.
    const displayName = me?.fullName || localStorage.getItem("fullName") || "Житель";
    const avatarSrc = resolveAvatarUrl(me?.avatarUrl);

    // Показываем максимум 99+, чтобы не разъезжалась вёрстка бейджа при сотнях уведомлений.
    const badge = notifications.unreadCount > 99 ? "99+" : String(notifications.unreadCount);

    return (
        <header className="r-topbar">
            <div className="r-topbar__title-wrap">
                <h1 className="r-topbar__title">{title}</h1>
                {subtitle && <p className="r-topbar__subtitle">{subtitle}</p>}
            </div>

            {right && <div className="r-topbar__actions">{right}</div>}

            {/* data-notifications-trigger нужен поповеру, чтобы не закрываться от клика по этой же кнопке */}
            <button
                type="button"
                className="r-topbar__bell"
                aria-label="Уведомления"
                onClick={notifications.toggleOpen}
                data-notifications-trigger
            >
                <Bell size={18}/>
                {notifications.unreadCount > 0 && (
                    <span className="r-topbar__bell-badge" aria-hidden="true">{badge}</span>
                )}
            </button>

            <Link to="/resident/account">
                <Avatar name={displayName} src={avatarSrc} size={42} fallback="icon"/>
            </Link>


            <NotificationsPopover
                items={notifications.items}
                unreadCount={notifications.unreadCount}
                loading={notifications.loading}
                error={notifications.error}
                open={notifications.open}
                onClose={notifications.close}
                onToggleRead={notifications.toggleRead}
                onMarkAllRead={notifications.markAllRead}
            />
        </header>
    );
}
