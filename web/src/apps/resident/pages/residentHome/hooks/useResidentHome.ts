import {useCallback, useEffect, useMemo, useState} from "react";
import {requestsApi} from "@/api/requests.api.ts";

import type {ResidentRequest} from "../model/types.ts";

// Хук-агрегатор данных главной страницы жителя для блока заявок.
// Отдельные состояния для первичной загрузки (loading/error) и для action-операций
// (actionLoadingId/actionError) — чтобы ошибка отмены заявки не ломала весь блок.
//
// Уведомления намеренно сюда не входят: они общие для всего кабинета и живут в ResidentTopBar.
export function useResidentHome() {
    const [requests, setRequests] = useState<ResidentRequest[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const list = await requestsApi.getMyRequests();
            setRequests(list);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось загрузить заявки");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    // Разделение active/done считаем здесь, чтобы UI получал готовое и не дублировал фильтрацию.
    const active = useMemo(() => requests.filter(r => r.status !== "Done"), [requests]);

    // Не более 5 последних закрытых — больше на главной не нужно, остальное на /resident/requests.
    const done = useMemo(
        () => requests.filter(r => r.status === "Done").slice(0, 5),
        [requests]
    );

    // Оптимистично удаляем заявку из локального стейта — запрашивать список заново не нужно.
    const cancelRequest = useCallback(async (id: string) => {
        setActionError("");
        setActionLoadingId(id);
        try {
            await requestsApi.deleteRequest(id);
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Не удалось отменить заявку");
        } finally {
            setActionLoadingId(null);
        }
    }, []);

    return {
        requests,
        loading,
        error,
        actionLoadingId,
        actionError,
        active,
        done,
        loadData,
        cancelRequest,
    };
}
