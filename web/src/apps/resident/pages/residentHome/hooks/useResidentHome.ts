import {requestsApi} from "@/api/requests.api.ts";
import {notificationsApi} from "@/api/notifications.api.ts";
import {useCallback, useEffect, useMemo, useState} from "react";

import type {ResidentNotification, ResidentRequest} from "../model/types.ts";

export function useResidentHome() {
    const [requests, setRequests] = useState<ResidentRequest[]>([]);
    const [notifications, setNotifications] = useState<ResidentNotification[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState("");
    const [notificationOpen, setNotificationOpen] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [reqRes, noteRes] = await Promise.allSettled([
                requestsApi.getMyRequests(),
                notificationsApi.getMyNotifications({take: 30}),
            ]);

            if (reqRes.status === "fulfilled") {
                setRequests(reqRes.value);
            } else {
                throw reqRes.reason;
            }

            if (noteRes.status === "fulfilled") {
                setNotifications(noteRes.value.items);
            } else {
                setNotifications([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось загрузить заявки");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const active = useMemo(() => requests.filter(r => r.status !== "Done"), [requests]);
    const done = useMemo(
        () => requests.filter(r => r.status === "Done").slice(0, 5),
        [requests]
    );
    const unreadCount = useMemo(
        () => notifications.filter(n => !n.isRead).length,
        [notifications]
    );

    const toggleNotifications = useCallback(() => {
        setNotificationOpen(prev => !prev);
    }, []);

    const markNotificationRead = useCallback(async (id: string) => {
        const target = notifications.find(n => n.id === id);
        if (!target) return;

        try {
            if (target.isRead) {
                await notificationsApi.markNotificationUnread(id);
                setNotifications(prev => prev.map(n => (n.id === id ? {...n, isRead: false, readAt: null} : n)));
            } else {
                await notificationsApi.markNotificationRead(id);
                setNotifications(prev => prev.map(n => (n.id === id ? {...n, isRead: true, readAt: new Date().toISOString()} : n)));
            }
        } catch {
            setActionError("Не удалось обновить статус уведомления");
        }
    }, [notifications]);

    const markAllRead = useCallback(async () => {
        try {
            await notificationsApi.markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({...n, isRead: true, readAt: n.readAt ?? new Date().toISOString()})));
        } catch {
            setActionError("Не удалось пометить уведомления как прочитанные");
        }
    }, []);

    const cancelRequest = useCallback(async (id: string) => {
        setActionError("");
        setActionLoadingId(id);
        try {
            await requestsApi.deleteRequest(id);
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Не удалось отменить заявку");
        } finally {
            setActionLoadingId(null);
        }
    }, []);

    return {
        requests,
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
    };
}
