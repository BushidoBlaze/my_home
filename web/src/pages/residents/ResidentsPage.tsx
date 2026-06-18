import ResidentsHero from "@/pages/residents/ui/hero/ui/Hero.tsx";
import BenefitsSection from "@/pages/residents/ui/benefits/ui/BenefitsSection.tsx";
import HowItWorksSection from "@/pages/residents/ui/howItWorks/ui/HowItWorksSection.tsx";
import ResidentsCtaBanner from "@/pages/residents/ui/cta/ui/CTABanner.tsx";
import SloganLabel from "@/shared/ui/sloganLabel/SloganLabel.tsx";
import Reviews from "@/pages/possibilities/ui/reviews/Reviews.tsx";
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

export default function ResidentsPage() {
    useDocumentTitle('Для жителей');

    return (
        <>
            {/* Главный баннер — тёмный фон, ценностное предложение для жителей */}
            <ResidentsHero />

            {/* Слоган-разделитель перед преимуществами */}
            <SloganLabel sloganText="Больше никаких очередей в кассу и звонков диспетчеру" />

            {/* Сетка преимуществ платформы для жителей */}
            <BenefitsSection />

            {/* Слоган-разделитель перед инструкцией */}
            <SloganLabel sloganText="Всё под контролем — прямо в вашем смартфоне" />

            {/* Три шага для начала работы с платформой */}
            <HowItWorksSection />

            {/* Отзывы пользователей */}
            <Reviews />

            {/* Финальный призыв к действию — регистрация */}
            <ResidentsCtaBanner />
        </>
    );
}
