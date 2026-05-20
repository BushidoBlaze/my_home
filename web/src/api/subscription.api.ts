import {requestJson} from "@/api/httpClient.ts";

export interface SubscriptionInfo {
    plan: "Basic" | "Premium";
    expiresAt?: string | null;
}

export interface UserApartmentItem {
    id: string;
    label: string;
    address: string;
    isActive: boolean;
}

export const subscriptionApi = {
    getSubscription: () =>
        requestJson<SubscriptionInfo>("/subscription"),

    upgradeSubscription: () =>
        requestJson<SubscriptionInfo>("/subscription/upgrade", {method: "POST"}),

    getMyApartments: () =>
        requestJson<UserApartmentItem[]>("/subscription/apartments"),

    addApartment: (data: { label?: string; address?: string }) =>
        requestJson<UserApartmentItem>("/subscription/apartments", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    activateApartment: (id: string) =>
        requestJson<{ ok: boolean }>(`/subscription/apartments/${id}/activate`, {
            method: "PUT",
        }),
};
