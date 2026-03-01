import MainTitle from "@/shared/ui/mainTitle/MainTitle.tsx";
import FAQList from "@/components/sections/FAQ/ui/FAQList.tsx";
import "./FAQSection.css";

export default function FAQSection() {
    return (
        <div className="FAQ-section">
            {/*Заголовок секции*/}
            <div className="FAQ-main-title-container">
                <MainTitle className="FAQ-main-title" title="FAQ"/>
                <p className="FAQ-main-description">(Часто задаваемые вопросы)</p>
            </div>

            {/*Список часто задаваемых вопросов*/}
            <FAQList/>
        </div>
    )
}