import {marketplaceApi} from "@/api/marketplace.api.ts";
import {useCallback, useEffect, useState} from "react";
import type {MarketplaceService, SortOption} from "../model/types.ts";


// const API_URL = import.meta.env.VITE_API_URL ?? "";

/*
async function fetchApi<T>(url: string): Promise<T> {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}${url}`, {
        headers: token ? {Authorization: `Bearer ${token}`} : {},
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}
*/

export function useMarketplace() {
    const [services, setServices] = useState<MarketplaceService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [category, setCategory] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortOption>("rating");

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await marketplaceApi.getMarketplaceServices({
                category,
                search,
                sort,
            });

            // Backend может вернуть произвольный payload при ошибках прокси;
            // нормализуем ответ, чтобы UI не падал на map/render.
            const normalized: MarketplaceService[] = (Array.isArray(data) ? data : []).map(service => ({
                id: service.id,
                title: service.title,
                description: service.description,
                category: service.category,
                price: service.price,
                imageUrl: service.imageUrl,
                rating: service.rating,
                reviewsCount: service.reviewsCount,
                provider: {
                    id: service.provider.id,
                    fullName: service.provider.fullName,
                    avatarUrl: service.provider.avatarUrl,
                },
            }));

            setServices(normalized);
        } catch (e) {
            setError("Не удалось загрузить услуги");
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [category, search, sort]);

    useEffect(() => {
        void load();
    }, [load]);

    return {
        services,
        loading,
        error,
        category,
        setCategory,
        search,
        setSearch,
        sort,
        setSort,
        reload: load,
    };
}