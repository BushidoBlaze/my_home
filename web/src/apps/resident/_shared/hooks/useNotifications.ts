import {useCallback, useEffect, useMemo, useState} from "react";
import {notificationsApi, type NotificationItem} from "@/api/notifications.api.ts";

// Управляет состоянием уведомлений в топбаре: список, счётчик непрочитанных,
// открытие/закрытие поповера, операции "прочитать" / "прочитать все".
// При закрытом поповере периодически опрашиваем сервер — счётчик в углу должен расти,
// даже если жилец не открывал список.
const REFRESH_INTERVAL_MS = 60_000;

export function useNotifications() {
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);

    // Загрузка списка. Берём 30 последних — больше на поповере и не помещается.
    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await notificationsApi.getMyNotifications({take: 30});
            setItems(res.items);
            setUnreadCount(res.unreadCount);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось загрузить уведомления");
        } finally {
            setLoading(false);
        }
    }, []);

    // Первичная загрузка + фоновое обновление счётчика.
    useEffect(() => {
        void load();
        const id = window.setInterval(() => void load(), REFRESH_INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [load]);

    const toggleOpen = useCallback(() => setOpen(prev => !prev), []);
    const close = useCallback(() => setOpen(false), []);

    // Тоггл прочитанности по клику на конкретное уведомление.
    // Локально обновляем сразу, чтобы UI ощущался мгновенным; на ошибке откатываем.
    const toggleRead = useCallback(async (id: string) => {
        const target = items.find(n => n.id === id);
        if (!target) return;

        const wasRead = target.isRead;
        // Оптимистичный апдейт
        setItems(prev => prev.map(n => n.id === id
            ? {...n, isRead: !wasRead, readAt: wasRead ? null : new Date().toISOString()}
            : n));
        setUnreadCount(prev => prev + (wasRead ? 1 : -1));

        try {
            if (wasRead) {
                await notificationsApi.markNotificationUnread(id);
            } else {
                await notificationsApi.markNotificationRead(id);
            }
        } catch {
            // Откат при ошибке
            setItems(prev => prev.map(n => n.id === id
                ? {...n, isRead: wasRead, readAt: target.readAt}
                : n));
            setUnreadCount(prev => prev + (wasRead ? -1 : 1));
        }
    }, [items]);

    // Помечает всё прочитанным одним запросом. Локально проставляем флаги,
    // сохраняя оригинальный readAt у тех, кто уже был прочитан.
    const markAllRead = useCallback(async () => {
        if (unreadCount === 0) return;

        const snapshot = items;
        const snapshotUnread = unreadCount;
        const now = new Date().toISOString();

        setItems(prev => prev.map(n => ({
            ...n,
            isRead: true,
            readAt: n.readAt ?? now,
        })));
        setUnreadCount(0);

        try {
            await notificationsApi.markAllNotificationsRead();
        } catch {
            setItems(snapshot);
            setUnreadCount(snapshotUnread);
        }
    }, [items, unreadCount]);

    // Возвращаем уже отсортированный список: непрочитанные сверху, затем по дате убыв.
    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
            return +new Date(b.createdAt) - +new Date(a.createdAt);
        });
    }, [items]);

    return {
        items: sortedItems,
        unreadCount,
        loading,
        error,
        open,
        toggleOpen,
        close,
        toggleRead,
        markAllRead,
        reload: load,
    };
}
