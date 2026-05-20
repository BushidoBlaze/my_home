/* ============================================================
   BlogPage — страница /blog
   Блог платформы my:home: статьи с фильтрацией по категориям
   и форма подписки на рассылку
   ============================================================ */

import BlogHero from "@/pages/blog/ui/hero/ui/Hero.tsx";
import ArticlesSection from "@/pages/blog/ui/articles/ui/ArticlesSection.tsx";
import NewsletterSection from "@/pages/blog/ui/newsletter/ui/NewsletterSection.tsx";

export default function BlogPage() {
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
