import {requestJson} from "@/api/httpClient.ts";

export interface ServiceRequest {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    createdAt: string;
    resident?: string;
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
        requestJson<ServiceRequest[]>("/requests/all"),

    updateStatus: (id: string, status: string) =>
        requestJson<ServiceRequest>(`/requests/${id}/status`, {
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
