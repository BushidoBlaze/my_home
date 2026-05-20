import {marketplaceApi} from "@/api/marketplace.api.ts";
import {useCallback, useState} from "react";
import type {ServiceDetail} from "../model/types.ts";


export function useServiceDetail() {
    const [service, setService] = useState<ServiceDetail | null>(null);
    const [loading, setLoading] = useState(false);

    const open = useCallback(async (id: string) => {
        setLoading(true);

        try {
            const data = await marketplaceApi.getMarketplaceServiceById(id);
            setService(data as ServiceDetail);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    const close = useCallback(() => setService(null), []);

    const createOrder = useCallback(async (serviceId: string, scheduledAt: Date, comment: string) => {
        await marketplaceApi.createMarketplaceOrder({
            serviceId,
            scheduledAt: scheduledAt.toISOString(),
            comment: comment || undefined,
        });
    }, []);

    const addReview = useCallback(async (serviceId: string, rating: number, comment: string) => {
        await marketplaceApi.createMarketplaceReview(serviceId, {
            rating,
            comment: comment || undefined,
        });
    }, []);

    return {service, loading, open, close, createOrder, addReview};
}