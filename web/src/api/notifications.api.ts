import {requestJson} from "@/api/httpClient.ts";

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: "Info" | "Success" | "Warning" | string;
    isRead: boolean;
    createdAt: string;
    readAt?: string | null;
    relatedRequestId?: string | null;
}

export const notificationsApi = {
    getMyNotifications: (params?: { unreadOnly?: boolean; take?: number }) => {
        const query = new URLSearchParams();
        if (params?.unreadOnly) query.set("unreadOnly", "true");
        if (params?.take) query.set("take", String(params.take));
        const suffix = query.toString();
        return requestJson<{ items: NotificationItem[]; unreadCount: number }>(
            `/notifications/my${suffix ? `?${suffix}` : ""}`
        );
    },

    markNotificationRead: (id: string) =>
        requestJson<{ ok: boolean }>(`/notifications/${id}/read`, {
            method: "PATCH",
        }),

    markNotificationUnread: (id: string) =>
        requestJson<{ ok: boolean }>(`/notifications/${id}/unread`, {
            method: "PATCH",
        }),

    markAllNotificationsRead: () =>
        requestJson<{ updated: number }>("/notifications/read-all", {
            method: "POST",
        }),
};
