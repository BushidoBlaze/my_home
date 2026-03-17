import {useState, useEffect, useRef, type RefObject} from "react";

/*
    Отслеживание появления элемента в viewport
    threshold — доля видимости элемента для срабатывания (0–1, по умолчанию 0.3)
    [ref, inView] — ref вешается на элемент, inView становится true один раз и остаётся
*/
export function useInView<T extends HTMLElement>(threshold = 0.1): [RefObject<T | null>, boolean] {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Срабатывает один раз — после чего наблюдение не нужно
                if (entry.isIntersecting) setInView(true);
            },
            {threshold}
        );

        if (ref.current) observer.observe(ref.current);

        // Отключаем observer при размонтировании компонента
        return () => observer.disconnect();
    }, [threshold]);

    return [ref, inView];
}