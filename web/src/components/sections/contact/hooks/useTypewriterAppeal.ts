import {useEffect, useRef, useState} from "react";

interface Options {
    startDelay?: number; // Задержка перед началом печати
    onComplete?: () => void; // Callback, который вызовется после полного завершения всей анимации
}

// Ограниченный набор строк (защита от ошибок)
type Stage = "question" | "answer" | "thanks" | "finished";

export function useTypewriterAppeal(
    question: string,
    answer: string,
    thanks: string,
    options?: Options // дополнительные настройки
) {
    // Если startDelay не передан — используем 0
    const {startDelay = 0, onComplete} = options || {};

    // Состояния для постепенно печатаемого текста. Сначала пустые строки
    const [typedQuestion, setTypedQuestion] = useState("");
    const [typedAnswer, setTypedAnswer] = useState("");
    const [typedThanks, setTypedThanks] = useState("");

    // Текущий этап анимации
    const [stage, setStage] = useState<Stage>("question");

    // Ref для хранения ID таймера старта. Нужно для очистки при размонтировании
    const timeoutRef = useRef<number | null>(null);

    /**
     * Универсальная функция печати текста:
     * text — что печатаем
     * speed — скорость печати
     * setter — функция обновления состояния
     * onDone — что делать после завершения
     */
    const typeText = (
        text: string,
        speed: number,
        setter: (val: string) => void,
        onDone: () => void
    ) => {
        let index = 0; // текущая позиция символа

        const interval = window.setInterval(() => {
            index++;

            // Берём часть строки от 0 до index
            setter(text.slice(0, index));

            // Если дошли до конца строки останавливаем интервал, вызываем callback
            if (index >= text.length) {
                clearInterval(interval);
                onDone();
            }
        }, speed);
    };

    /**
     * useEffect запускается один раз при монтировании
     * (потому что dependency array пустой)
     */
    useEffect(() => {
        // Ждём стартовую задержку перед началом анимации
        timeoutRef.current = window.setTimeout(() => {

            typeText(question, 35, setTypedQuestion, () => { // Вопрос
                setTimeout(() => {
                    setStage("answer");

                    typeText(answer, 35, setTypedAnswer, () => { // Ответ
                        setTimeout(() => {
                            setStage("thanks");

                            typeText(thanks, 35, setTypedThanks, () => { // Слова благодарности
                                setTimeout(() => {
                                    setStage("finished");

                                    onComplete?.(); // Вызываем внешний callback, если он был передан
                                }, 1500); // дополнительная пауза
                            });
                        }, 800); // После ответа ждём 800мс
                    });
                }, 500); // После вопроса ждём 500мс
            });
        }, startDelay);

        /**
         * Cleanup-функция
         * Вызывается при размонтировании компонента
         * Очищаем таймер, чтобы избежать утечек памяти
         */
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [question, answer, thanks, startDelay, onComplete]);

    // Возвращаем данные в компонент
    return {
        typedQuestion,
        typedAnswer,
        typedThanks,
        stage,
    };
}