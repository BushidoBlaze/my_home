// NewsletterSection — подписка на рассылку страницы /blog — Тёмный фон, email-форма, локальный useState для success-состояния

import { useState } from "react";
import "./NewsletterSection.css";

export default function NewsletterSection() {
    /* Email из инпута */
    const [email, setEmail] = useState<string>("");

    /* Флаг успешной подписки — при true показываем подтверждение */
    const [subscribed, setSubscribed] = useState<boolean>(false);

    /**
     * Обработчик отправки формы.
     * Без API — просто переключаем флаг subscribed.
     */
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // Простая валидация — email не должен быть пустым
        if (!email.trim()) return;

        setSubscribed(true);
    }

    return (
        /* data-reveal — подхватывается хуком useScrollReveal */
        <section className="blog-newsletter" data-reveal>
            <div className="blog-newsletter__inner">

                {/* Заголовок */}
                <h2 className="blog-newsletter__title">Будьте в курсе</h2>

                {/* Описание рассылки */}
                <p className="blog-newsletter__desc">
                    Новые статьи, кейсы и обновления платформы — раз в две недели
                </p>

                {/* Форма подписки / success-сообщение */}
                {subscribed ? (
                    /* Success-состояние после подписки */
                    <div className="blog-newsletter__success">
                        <span className="blog-newsletter__success-icon">✓</span>
                        Вы подписаны
                    </div>
                ) : (
                    /* Форма с email и кнопкой */
                    <form
                        className="blog-newsletter__form"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <input
                            className="blog-newsletter__input"
                            type="email"
                            placeholder="Ваш email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            aria-label="Email для подписки"
                        />
                        <button
                            className="blog-newsletter__btn"
                            type="submit"
                        >
                            Подписаться
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
