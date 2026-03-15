import CustomButton from "@/shared/ui/customButton/CustomButton.tsx";
import CustomTitle from "@/shared/ui/customTitle/CustomTitle.tsx";
import HeroStats from "./HeroStats.tsx";
import {MoveDown} from "lucide-react";

export default function HeroContent() {
    // Функция плавного скролла до 1 секции - в нашем случае (.possibilities-devices)
    const handleScrollDown = () => {
        document.querySelector(".possibilities-devices")
            ?.scrollIntoView();
    };

    return (
        // data-reveal -- hook useScrollReveal.ts
        <div className="possibilities-hero__content" data-reveal>
            <CustomTitle
                title={
                    <>
                        Всё что нужно<span className="possibilities-hero__title-accent"> для управления домом</span>
                    </>
                }
                className="possibilities-hero__title"
            />

            <p className="possibilities-hero__description">
                Заявки, оплата, голосования — в одном приложении.
            </p>

            <CustomButton
                onClick={handleScrollDown}
                text="Перейти к возможностям"
                className="possibilities-hero__button">
                <MoveDown strokeWidth={1.25} />
            </CustomButton>

            {/*Секция - краткая статистика*/}
            <HeroStats/>
        </div>
    )
}