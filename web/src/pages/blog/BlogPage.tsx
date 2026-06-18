import BlogHero from "@/pages/blog/ui/hero/ui/Hero.tsx";
import ArticlesSection from "@/pages/blog/ui/articles/ui/ArticlesSection.tsx";
import NewsletterSection from "@/pages/blog/ui/newsletter/ui/NewsletterSection.tsx";
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

export default function BlogPage() {
    useDocumentTitle('Блог');

    return (
        <>
            {/* Главный баннер — тёмный фон, описание блога */}
            <BlogHero />

            {/* Секция статей с фильтрацией по категориям */}
            <ArticlesSection />

            {/* Форма подписки на рассылку */}
            <NewsletterSection />
        </>
    );
}
