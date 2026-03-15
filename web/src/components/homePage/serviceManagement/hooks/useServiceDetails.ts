import {useState} from "react";
import type {ServiceManagementDetailProps} from "../model/types.ts";

// Хук управляет:
// - открытием панели
// - переключением деталей
//- текущим элементом

export function useServiceDetails(details?: ServiceManagementDetailProps[]) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const isOpen = openIndex !== null;

    // открыть деталь
    const open = (index: number) => {
        setOpenIndex(index);
    };

    // закрыть панель
    const close = () => {
        setOpenIndex(null);
    };

    // следующий элемент
    const next = () => {
        if (!details || openIndex === null) return;

        setOpenIndex(
            openIndex === details.length - 1 ? 0 : openIndex + 1
        );
    };

    // предыдущий элемент
    const prev = () => {
        if (!details || openIndex === null) return;

        setOpenIndex(
            openIndex === 0 ? details.length - 1 : openIndex - 1
        );
    };

    const currentItem =
        details && openIndex !== null
            ? details[openIndex]
            : null;

    return {
        isOpen,
        currentItem,
        open,
        close,
        next,
        prev,
    };
}