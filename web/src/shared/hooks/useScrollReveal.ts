import {useEffect} from "react";

export function useScrollReveal() {
    useEffect(() => {
        // [data-reveal] - data-атрибут, фича для хранения произвольных данных на элементе
        const elements = document.querySelectorAll("[data-reveal]");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");
                        observer.unobserve(entry.target); // каждый элемент — один раз
                    }
                });
            },
            {threshold: 0.1}
        );

        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);
}