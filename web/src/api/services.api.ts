import {requestJson, requestVoid, uploadFileJson} from "@/api/httpClient.ts";

export interface MyServiceItem {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    imageUrl?: string;
    createdAt: string;
    providerName?: string;
    providerPhone?: string;
    providerAvatarUrl?: string;
}

export interface CreateMyServiceDto {
    title: string;
    description: string;
    category: string;
    price: number;
    imageUrl?: string;
    providerName?: string;
    providerPhone?: string;
}

export const servicesApi = {
    getMyServices: () =>
        requestJson<MyServiceItem[]>("/services/my"),

    createMyService: (data: CreateMyServiceDto) =>
        requestJson<MyServiceItem>("/services", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    deleteMyService: (id: string) =>
        requestVoid(`/services/${id}`, {method: "DELETE"}),

    uploadServiceImage: (file: File) =>
        uploadFileJson<{ url: string }>("/services/image", file),
};
