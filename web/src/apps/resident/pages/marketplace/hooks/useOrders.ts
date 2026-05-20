import {marketplaceApi} from "@/api/marketplace.api.ts";
import {useCallback, useEffect, useState} from "react";
import type {ServiceOrder} from "../model/types.ts";


export function useOrders() {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);

        try {
            const data = await marketplaceApi.getMarketplaceOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    const cancel = useCallback(async (id: string) => {
        await marketplaceApi.cancelMarketplaceOrder(id);
        await load();
    }, [load]);

    useEffect(() => {
        void load();
    }, [load]);

    return {orders, loading, reload: load, cancel};
}