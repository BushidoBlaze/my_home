import {requestJson} from "@/api/httpClient.ts";

export interface AuthResponse {
    token: string;
    role: string;
    fullName: string;
}

export const authApi = {
    register: (data: {
        email: string;
        password: string;
        fullName: string;
        role?: string;
        phone?: string;
    }) =>
        requestJson<AuthResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    login: (data: { email: string; password: string }) =>
        requestJson<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
        }),
};
