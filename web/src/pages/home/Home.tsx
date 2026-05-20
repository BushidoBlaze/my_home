import Hero from "@/pages/home/ui/hero/ui/Hero.tsx";
import ServiceManagementSection from "@/pages/home/ui/serviceManagement/ui/ServiceManagementSection.tsx";
import SloganLabel from "@/shared/ui/sloganLabel/SloganLabel.tsx";
import TariffsSection from "@/widgets/tariffsSection/ui/TariffsSection.tsx";
import ContactSection from "@/pages/home/ui/contact/ui/ContactSection.tsx";
import FAQSection from "@/pages/home/ui/FAQ/ui/FAQSection.tsx";

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
