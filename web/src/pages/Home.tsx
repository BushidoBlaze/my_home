import HeroSection from "@/components/sections/hero/ui/HeroSection.tsx";
import ServiceManagementSection from "@/components/sections/serviceManagement/ui/ServiceManagementSection.tsx";
import BackToTopButton from "@/widgets/backToTop/BackToTopButton.tsx";

export default function Home() {
    return (
        <>
            {/*Кнопка скролла наверх*/}
            <BackToTopButton/>

            {/*Главная секция*/}
            <HeroSection/>

            {/*Секция - управление сервисом*/}
            <ServiceManagementSection/>
        </>
    )
}