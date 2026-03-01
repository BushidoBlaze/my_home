import BackToTopButton from "@/widgets/backToTop/BackToTopButton.tsx";
import HeroSection from "@/components/sections/hero/ui/HeroSection.tsx";
import ServiceManagementSection from "@/components/sections/serviceManagement/ui/ServiceManagementSection.tsx";
import SloganLabel from "@/shared/ui/sloganLabel/SloganLabel.tsx";
import TariffsSection from "@/components/sections/tariffs/ui/TariffsSection.tsx";
import ContactSection from "@/components/sections/contact/ui/ContactSection.tsx";
import FAQSection from "@/components/sections/FAQ/ui/FAQSection.tsx";

export default function Home() {
    return (
        <>
            {/*Кнопка скролла наверх*/}
            <BackToTopButton/>

            {/*Главная секция*/}
            <HeroSection/>

            {/*Секция - управление сервисом*/}
            <ServiceManagementSection/>

            {/*Слоган (UI - элемент)*/}
            <SloganLabel sloganText="Вам больше времени на важные задачи, а мы автоматизируем рутину"/>

            {/*Секция тарифов и цен*/}
            <TariffsSection/>

            {/*Слоган (UI - элемент)*/}
            <SloganLabel sloganText="Остались вопросы? Напишите, а мы поможем разобраться"/>

            {/*Секция контактов*/}
            <ContactSection/>

            {/*Секция часто задаваемых вопросов*/}
            <FAQSection/>
        </>
    )
}