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
        requestJson<string>("/users/password", {
            method: "PUT",
            body: JSON.stringify(data),
        }),
};
