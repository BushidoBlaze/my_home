import TariffsHero from "@/pages/tariffs/ui/hero/ui/Hero.tsx";
import TariffsCtaBanner from "@/pages/tariffs/ui/cta/ui/CTABanner.tsx";
import SloganLabel from "@/shared/ui/sloganLabel/SloganLabel.tsx";
import TariffsSection from "@/widgets/tariffsSection/ui/TariffsSection.tsx";
import FAQSection from "@/pages/home/ui/FAQ/ui/FAQSection.tsx";
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

export default function TariffsPage() {
    useDocumentTitle('Тарифы и цены');

    return (
        <>
            {/* Главный баннер страницы — тёмный фон, заголовок, CTA */}
            <TariffsHero />

            {/* Слоган-разделитель перед тарифами */}
            <SloganLabel sloganText="Выберите тариф, который подходит именно вашему дому" />

            {/* Секция с тарифами и таблицей сравнения возможностей */}
            <TariffsSection />

            {/* Слоган-разделитель перед FAQ */}
            <SloganLabel sloganText="Остались вопросы? Напишите нам — всё объясним" />

            {/* Часто задаваемые вопросы */}
            <FAQSection />

            {/* Финальный призыв к действию */}
            <TariffsCtaBanner />
        </>
    );
}
