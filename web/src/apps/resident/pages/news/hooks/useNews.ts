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

// POST с авторизацией (для добавления комментария)
async function postApi<T>(url: string, body: unknown): Promise<T> {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}${url}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
        body: JSON.stringify(body),
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
    const [submittingComment, setSubmittingComment] = useState(false);
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

    // Загружаем список новостей.
    // Бэкенд возвращает paginated-объект {items, total, page, pageSize, hasMore},
    // достаём оттуда .items.
    const loadList = useCallback(async () => {
        setListLoading(true);
        setError(null);
        try {
            const data = await fetchApi<NewsItem[] | { items: NewsItem[] }>("/news?pageSize=50");
            const items = Array.isArray(data)
                ? data
                : Array.isArray(data?.items) ? data.items : [];
            setList(items);
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

    // Добавление комментария к выбранной новости.
    // После успешной отправки перечитываем список комментариев и обновляем счётчик.
    const addComment = useCallback(async (content: string) => {
        const text = content.trim();
        if (!selected || !text) return;

        setSubmittingComment(true);
        try {
            await postApi(`/news/${selected.id}/comments`, {content: text});
            const fresh = await fetchApi<NewsComment[]>(`/news/${selected.id}/comments`);
            setComments(Array.isArray(fresh) ? fresh : []);
            setList(prev => prev.map(n =>
                n.id === selected.id ? {...n, commentsCount: (n.commentsCount ?? 0) + 1} : n
            ));
        } catch (e) {
            console.error(e);
            throw e;
        } finally {
            setSubmittingComment(false);
        }
    }, [selected]);

    useEffect(() => {
        void loadList();
    }, [loadList]);

    return {
        list,
        selected,
        comments,
        listLoading,
        detailLoading,
        submittingComment,
        error,
        selectNews,
        addComment,
    };
}