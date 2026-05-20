import {useCallback, useEffect, useState} from "react";
import type {NewsComment, NewsItem} from "../model/types.ts";

const API_URL = import.meta.env.VITE_API_URL ?? "";

// Базовый запрос с авторизацией
async function fetchApi<T>(url: string): Promise<T> {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}${url}`, {
        headers: token ? {Authorization: `Bearer ${token}`} : {},
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export function useNews() {
    const [list, setList] = useState<NewsItem[]>([]);
    const [selected, setSelected] = useState<NewsItem | null>(null);
    const [comments, setComments] = useState<NewsComment[]>([]);
    const [listLoading, setListLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Загружаем детали конкретной новости
    const loadDetail = useCallback(async (id: string) => {
        setDetailLoading(true);
        try {
            const [news, newsComments] = await Promise.all([
                fetchApi<NewsItem>(`/news/${id}`),
                fetchApi<NewsComment[]>(`/news/${id}/comments`),
            ]);
            setSelected(news);
            setComments(Array.isArray(newsComments) ? newsComments : []);
        } catch (e) {
            console.error(e);
        } finally {
            setDetailLoading(false);
        }
    }, []);

    // Загружаем список новостей
    const loadList = useCallback(async () => {
        setListLoading(true);
        setError(null);
        try {
            const data = await fetchApi<NewsItem[]>("/news");
            const items = Array.isArray(data) ? data : [];
            setList(items);
            // Автоматически открываем первую новость
            if (items.length > 0) {
                setSelected(items[0]);
                await loadDetail(items[0].id);
            }
        } catch (e) {
            setError("Не удалось загрузить новости");
            console.error(e);
        } finally {
            setListLoading(false);
        }
    }, [loadDetail]);

    // Выбор новости из списка
    const selectNews = useCallback((item: NewsItem) => {
        setSelected(item);
        void loadDetail(item.id);
    }, [loadDetail]);

    useEffect(() => {
        void loadList();
    }, [loadList]);

    return {
        list,
        selected,
        comments,
        listLoading,
        detailLoading,
        error,
        selectNews,
    };
}