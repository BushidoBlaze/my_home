import type {JSX} from "react";
import {AlertCircle, RefreshCw} from "lucide-react";

interface DataErrorProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    /** Компактный режим — для маленьких блоков. */
    compact?: boolean;
}

/** Единый блок ошибки загрузки для всех виджетов главной. */
export function DataError({
    title = "Не удалось загрузить данные",
    message = "Бэкенд недоступен. Проверьте подключение и попробуйте снова.",
    onRetry,
    compact = false,
}: DataErrorProps): JSX.Element {
    return (
        <div className={"home-data-state home-data-state--error" + (compact ? " home-data-state--compact" : "")}>
            <AlertCircle size={compact ? 18 : 22} style={{color: "#ef4444"}}/>
            <div className="home-data-state__main">
                <div className="home-data-state__title">{title}</div>
                {!compact && <div className="home-data-state__msg">{message}</div>}
            </div>
            {onRetry && (
                <button
                    type="button"
                    className="home-data-state__retry"
                    onClick={onRetry}
                    aria-label="Повторить"
                >
                    <RefreshCw size={13}/> Повторить
                </button>
            )}
        </div>
    );
}

interface DataLoadingProps {
    compact?: boolean;
    label?: string;
}

/** Скелетон/индикатор загрузки. */
export function DataLoading({compact = false, label = "Загрузка…"}: DataLoadingProps): JSX.Element {
    return (
        <div className={"home-data-state home-data-state--loading" + (compact ? " home-data-state--compact" : "")}>
            <div className="home-data-state__spinner"/>
            <div className="home-data-state__title home-data-state__title--muted">{label}</div>
        </div>
    );
}
