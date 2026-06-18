import {requestJson, uploadFileJson} from "@/api/httpClient.ts";

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    phone?: string;
    birthDate?: string;
    avatarUrl?: string;

    country?: string;
    city?: string;
    street?: string;
    house?: string;
    building?: string;
    entrance?: string;
    floor?: string;
    apartmentNumber?: string;

    residents?: number;
    area?: number;
    rooms?: number;
    apartmentRole?: string;

    /** Лицевой счёт в УК (формат 740-XXXX-XXXX). */
    accountNumber?: string;

    /** УК пользователя (для менеджера — его организация). */
    organizationId?: string | null;
    organizationName?: string | null;
}

export interface UpdateMeDto {
    fullName: string;
    phone?: string;
    birthDate?: string;

    country?: string;
    city?: string;
    street?: string;
    house?: string;
    building?: string;
    entrance?: string;
    floor?: string;
    apartmentNumber?: string;

    residents?: number;
    area?: number;
    rooms?: number;
    apartmentRole?: string;
}

export const usersApi = {
    getMe: () =>
        requestJson<User>("/users/me"),

    updateMe: (data: UpdateMeDto) =>
        requestJson<User>("/users/me", {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    uploadAvatar: (file: File) =>
        uploadFileJson<{ url: string }>("/users/avatar", file),

    changePassword: (data: { oldPassword: string; newPassword: string }) =>
        requestJson<{ message: string }>("/users/password", {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    changeEmail: (data: { newEmail: string; password: string }) =>
        requestJson<{ email: string }>("/users/email", {
            method: "PUT",
            body: JSON.stringify(data),
        }),
};
