import {useEffect} from "react";
import {useLocation} from "react-router-dom";

export function useScrollReveal() {
    const location = useLocation();

    useEffect(() => {
        const elements = document.querySelectorAll("[data-reveal]");

        // сброс revealed у всех элементов при смене страницы
        elements.forEach((el) => el.classList.remove("revealed"));

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {threshold: 0.1}
        );

        const timeout = setTimeout(() => {
            elements.forEach((el) => observer.observe(el));
        }, 50);

        return () => {
            clearTimeout(timeout);
            observer.disconnect();
        };
    }, [location.pathname]); // перезапуск при каждом изменении роута
}