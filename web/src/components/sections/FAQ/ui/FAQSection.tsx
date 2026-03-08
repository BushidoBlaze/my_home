import MainTitle from "@/shared/ui/mainTitle/MainTitle.tsx";
import FAQList from "@/components/sections/FAQ/ui/FAQList.tsx";
import "./FAQSection.css";

export default function FAQSection() {
    return (
        /*data-reveal - data-атрибут, фича для хранения произвольных данных на элементе,*/
        /*используется в глобальном хуке useScrollReveal.ts для плавного скролла секции*/
        <div className="FAQ-section" data-reveal>
            {/*Заголовок секции*/}
            <div className="FAQ-main-title-container">
                <MainTitle className="FAQ-main-title" title="FAQ"/>
                <p className="FAQ-main-description">(Часто задаваемые вопросы)</p>
            </div>

            {/*Вертикальный разделитель между колонками*/}
            <div className="FAQ__divider"/>

            {/*Список часто задаваемых вопросов*/}
            <div className="FAQ-list-container">
                <FAQList/>
            </div>
        </div>
    )
}