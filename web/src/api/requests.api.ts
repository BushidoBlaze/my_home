import {requestJson} from "@/api/httpClient.ts";

/** Заявка глазами жителя — то, что возвращает GET /requests/my. */
export interface ServiceRequest {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    createdAt: string;
    /** Может быть строкой (старый формат /requests/my) — оставляем для обратной совместимости. */
    resident?: string;
}

/** Краткий профиль автора заявки — то, что возвращает /requests/all. */
export interface ManagerRequestResident {
    id: string;
    fullName: string;
    street?: string | null;
    house?: string | null;
    building?: string | null;
    entrance?: string | null;
    apartmentNumber?: string | null;
}

/** Краткий профиль исполнителя в /requests/all. */
export interface ManagerRequestAssignee {
    id: string;
    fullName: string;
}

/** Заявка глазами УК — то, что возвращает GET /requests/all. */
export interface ManagerServiceRequest {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt?: string | null;
    resident: ManagerRequestResident;
    assignee: ManagerRequestAssignee | null;
}

/** Детальное представление заявки для /manager/tickets/:id. */
export interface ManagerRequestDetail extends ManagerServiceRequest {
    resident: ManagerRequestResident & {
        phone?: string | null;
        email?: string | null;
        avatarUrl?: string | null;
        floor?: string | null;
    };
    assignee: (ManagerRequestAssignee & {
        avatarUrl?: string | null;
        phone?: string | null;
    }) | null;
}

export interface CreateRequestDto {
    title: string;
    description: string;
    category: string;
}

export const requestsApi = {
    getMyRequests: () =>
        requestJson<ServiceRequest[]>("/requests/my"),

    createRequest: (data: CreateRequestDto) =>
        requestJson<ServiceRequest>("/requests", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getAllRequests: () =>
        requestJson<ManagerServiceRequest[]>("/requests/all"),

    getRequestById: (id: string) =>
        requestJson<ManagerRequestDetail>(`/requests/${id}`),

    updateStatus: (id: string, status: string) =>
        requestJson<{ id: string; status: string }>(`/requests/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({status}),
        }),

    updateRequest: (id: string, data: CreateRequestDto) =>
        requestJson<ServiceRequest>(`/requests/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    deleteRequest: (id: string) =>
        requestJson<{ ok: boolean }>(`/requests/${id}`, {
            method: "DELETE",
        }),
};
