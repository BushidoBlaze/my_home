import {useCallback, useEffect, useState} from "react";

interface DashboardDataState<TLocal> {
    data: TLocal | null;
    loading: boolean;
    error: Error | null;
    /** Перезапустить запрос. */
    retry: () => void;
}

/**
 * Хук загрузки одного блока дашборда.
 *
 * Поведение:
 *  - Сначала loading=true, data=null, error=null — отрисовывается скелетон.
 *  - При успехе → data заполняется, loading=false.
 *  - При ошибке → error заполняется, data остаётся null. UI должен показать сообщение об ошибке.
 *  - Метод retry() сбрасывает состояние и повторяет запрос.
 *
 * Никаких моков-фолбэков — если бэк недоступен, UI это явно показывает.
 */
export function useDashboardData<TApi, TLocal>(
    fetcher: () => Promise<TApi>,
    adapter: (api: TApi) => TLocal,
): DashboardDataState<TLocal> {
    const [data, setData] = useState<TLocal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [tick, setTick] = useState(0);

    const retry = useCallback(() => {
        setTick(t => t + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        fetcher()
            .then(api => {
                if (cancelled) return;
                setData(adapter(api));
            })
            .catch(e => {
                if (cancelled) return;
                setData(null);
                setError(e instanceof Error ? e : new Error(String(e)));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tick]);

    return {data, loading, error, retry};
}
