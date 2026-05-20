import type {
    BugReportPayload,
    HelpContentResponse,
    SupportRequestPayload,
} from "./types.ts";

const API_URL = import.meta.env.VITE_API_URL ?? "";

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
            ...(options.headers ?? {}),
        },
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `HTTP ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export const helpApi = {
    getContent: () => request<HelpContentResponse>("/help/content"),
    sendSupportRequest: (payload: SupportRequestPayload) =>
        request<{ id: string; status: string; createdAt: string }>("/help/support-requests", {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    sendBugReport: (payload: BugReportPayload) =>
        request<{ id: string; status: string; createdAt: string }>("/help/bug-reports", {
            method: "POST",
            body: JSON.stringify(payload),
        }),
};
