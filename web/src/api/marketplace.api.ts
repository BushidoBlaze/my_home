import {requestJson} from "@/api/httpClient.ts";

export interface MarketplaceServiceItem {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    imageUrl?: string;
    createdAt: string;
    provider: {
        id: string;
        fullName: string;
        avatarUrl?: string;
    };
    rating: number;
    reviewsCount: number;
}

export interface MarketplaceServiceDetail extends MarketplaceServiceItem {
    provider: {
        id: string;
        fullName: string;
        avatarUrl?: string;
        phone?: string;
    };
    reviews: Array<{
        id: string;
        rating: number;
        comment?: string;
        createdAt: string;
        resident: {
            fullName: string;
            avatarUrl?: string;
        };
    }>;
}

export interface MarketplaceOrderItem {
    id: string;
    status: string;
    comment?: string;
    scheduledAt: string;
    createdAt: string;
    service: {
        id: string;
        title: string;
        category: string;
        price: number;
        imageUrl?: string;
        provider: {
            fullName: string;
        };
    };
}

export const marketplaceApi = {
    getMarketplaceServices: (params: {
        category?: string | null;
        search?: string;
        sort?: "rating" | "price_asc" | "price_desc" | "new";
    }) => {
        const query = new URLSearchParams();
        if (params.category) query.set("category", params.category);
        if (params.search) query.set("search", params.search);
        if (params.sort) query.set("sort", params.sort);
        const suffix = query.toString();
        return requestJson<MarketplaceServiceItem[]>(
            `/marketplace/services${suffix ? `?${suffix}` : ""}`
        );
    },

    getMarketplaceServiceById: (serviceId: string) =>
        requestJson<MarketplaceServiceDetail>(`/marketplace/services/${serviceId}`),

    createMarketplaceOrder: (data: { serviceId: string; scheduledAt: string; comment?: string }) =>
        requestJson<{ id: string; status: string; scheduledAt: string; createdAt: string }>(
            "/marketplace/orders",
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        ),

    getMarketplaceOrders: () =>
        requestJson<MarketplaceOrderItem[]>("/marketplace/orders"),

    cancelMarketplaceOrder: (orderId: string) =>
        requestJson<{ id: string; status: string }>(`/marketplace/orders/${orderId}/cancel`, {
            method: "PATCH",
        }),

    createMarketplaceReview: (serviceId: string, data: { rating: number; comment?: string }) =>
        requestJson<{ id: string; rating: number; comment?: string; createdAt: string }>(
            `/marketplace/services/${serviceId}/reviews`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        ),
};
