import {useState, useEffect} from "react";

/*
    Анимированный числовой счётчик
    target — конечное значение
    duration — длительность анимации в мс (по умолчанию 1400)
    active — запускать ли анимацию (обычно передаётся inView)
*/
export function useCounter(target: number, duration = 1400, active = false): number {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!active) return;
        let start: number | null = null;

        const step = (ts: number) => {
            if (!start) start = ts;

            // p — прогресс от 0 до 1
            const p = Math.min((ts - start) / duration, 1);

            // быстрый старт, плавное торможение
            setValue(Math.round((1 - Math.pow(1 - p, 3)) * target));

            if (p < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    }, [active, target, duration]);

    return value;
}