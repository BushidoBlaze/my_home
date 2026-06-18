import ManagementHero from "@/pages/management/ui/hero/ui/Hero.tsx";
import FeaturesSection from "@/pages/management/ui/features/ui/FeaturesSection.tsx";
import WorkflowSection from "@/pages/management/ui/workflow/ui/WorkflowSection.tsx";
import ManagementCtaBanner from "@/pages/management/ui/cta/ui/CTABanner.tsx";
import SloganLabel from "@/shared/ui/sloganLabel/SloganLabel.tsx";
import Stats from "@/pages/possibilities/ui/stats/ui/Stats.tsx";
import Reviews from "@/pages/possibilities/ui/reviews/Reviews.tsx";
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

export default function ManagementPage() {
    useDocumentTitle('Для управляющих компаний');

    return (
        <>
            {/* Главный баннер — тёмный фон, ценностное предложение для УК */}
            <ManagementHero />

            {/* Слоган-разделитель перед списком возможностей */}
            <SloganLabel sloganText="Всё управление домом — в одном окне браузера" />

            {/* Сетка функциональностей платформы */}
            <FeaturesSection />

            {/* Слоган-разделитель перед workflow */}
            <SloganLabel sloganText="Автоматизируйте рутину, концентрируйтесь на результате" />

            {/* Как работает система заявок — timeline */}
            <WorkflowSection />

            {/* Статистика платформы */}
            <Stats />

            {/* Отзывы пользователей */}
            <Reviews />

            {/* Финальный призыв к действию */}
            <ManagementCtaBanner />
        </>
    );
}
