import type {
    UserSettings,
    DeviceSession,
    BlacklistEntry
} from "./types";
import {requestJson} from "@/api/httpClient.ts";

const API_URL = import.meta.env.VITE_API_URL ?? "";
const BASE = `${API_URL}/settings`;

async function request<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const path = url.replace(API_URL, "");
    return requestJson<T>(path, options);
}

// ─── Settings CRUD ──────────────────────────────────────────────
export const settingsApi = {
    /** Загрузить все настройки пользователя */
    getAll: () => request<UserSettings>(BASE),

    /** Обновить секцию настроек */
    updateSection: <K extends keyof UserSettings>(
        section: K,
        data: UserSettings[K]
    ) => {
        if (section === "language") {
            return settingsApi.setLanguage(data as string).then(() => settingsApi.getAll());
        }
        return request<UserSettings>(`${BASE}/${section}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    /** Смена языка */
    setLanguage: (lang: string) =>
        request<void>(`${BASE}/language`, {
            method: "PUT",
            body: JSON.stringify({ language: lang }),
        }),
};

// ─── Devices / Sessions ─────────────────────────────────────────
export const devicesApi = {
    getSessions: () => request<DeviceSession[]>(`${BASE}/devices`),

    revokeSession: (sessionId: string) =>
        request<void>(`${BASE}/devices/${sessionId}`, { method: "DELETE" }),

    revokeAllOthers: () =>
        request<void>(`${BASE}/devices/revoke-all`, { method: "DELETE" }),
};

// ─── Privacy helpers ────────────────────────────────────────────
export const privacyApi = {
    enable2FA: () =>
        request<{ qrCodeUrl: string; secret: string; otpAuthUri: string }>(`${BASE}/privacy/2fa`, {
            method: "POST",
        }),

    disable2FA: (code: string) =>
        request<void>(`${BASE}/privacy/2fa`, {
            method: "DELETE",
            body: JSON.stringify({ code }),
        }),
};

// ─── Blacklist ───────────────────────────────────────────────────
export const blacklistApi = {
    getAll: () => request<BlacklistEntry[]>(`${BASE}/chats/blacklist`),

    remove: (userId: string) =>
        request<void>(`${BASE}/chats/blacklist/${userId}`, { method: "DELETE" }),
};

// ─── Account ────────────────────────────────────────────────────
export const accountApi = {
    clearCache: () =>
        request<void>(`${BASE}/cache`, { method: "DELETE" }),

    exportData: () =>
        fetch(`${BASE}/export`, {
            method: "POST",
            headers: {
                ...(localStorage.getItem("token")
                    ? {Authorization: `Bearer ${localStorage.getItem("token")}`}
                    : {})
            }
        }).then((r) => r.blob()),

    deleteAccount: (password: string) =>
        request<void>(`${BASE}/account`, {
            method: "DELETE",
            body: JSON.stringify({ password }),
        }),
};