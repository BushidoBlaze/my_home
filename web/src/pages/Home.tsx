import Hero from "@/components/homePage/hero/ui/Hero.tsx";
import ServiceManagementSection from "@/components/homePage/serviceManagement/ui/ServiceManagementSection.tsx";
import SloganLabel from "@/shared/ui/sloganLabel/SloganLabel.tsx";
import TariffsSection from "@/components/sections/tariffs/ui/TariffsSection.tsx";
import ContactSection from "@/components/homePage/contact/ui/ContactSection.tsx";
import FAQSection from "@/components/homePage/FAQ/ui/FAQSection.tsx";

export default function Home() {
    return (
        <>
            {/*Главная секция*/}
            <Hero/>

            {/*Секция - управление сервисом*/}
            <ServiceManagementSection/>

            {/*Слоган (UI - элемент)*/}
            <SloganLabel sloganText={
                <>
                    Вам больше времени на важные задачи, <br/> а мы автоматизируем рутину
                </>
            }/>

            {/*Секция тарифов и цен*/}
            <TariffsSection/>

            {/*Слоган (UI - элемент)*/}
            <SloganLabel sloganText={
                <>
                    Остались вопросы? <br/> Напишите, а мы поможем разобраться
                </>
            }/>

            {/*Секция контактов*/}
            <ContactSection/>

            {/*Секция часто задаваемых вопросов*/}
            <FAQSection/>
        </>
    )
}