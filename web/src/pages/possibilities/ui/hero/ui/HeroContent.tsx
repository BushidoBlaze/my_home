import { MoveDown } from "lucide-react";

export default function HeroContent() {
    const handleScrollDown = () => {
        document.querySelector(".possibilities-devices")
            ?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="possibilities-hero__content" data-reveal>
            <h1 className="possibilities-hero__title">
                Всё что нужно<br />
                <span className="possibilities-hero__title-accent">для управления домом</span>
            </h1>

            <p className="possibilities-hero__description">
                Заявки, оплата, голосования — в одном приложении.
            </p>

            <div className="possibilities-hero__actions">
                <button
                    className="hero__button hero__button--active"
                    onClick={handleScrollDown}
                >
                    Перейти к возможностям <MoveDown size={16} strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
}
