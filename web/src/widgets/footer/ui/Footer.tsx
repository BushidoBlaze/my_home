import AboutProduct from "@/widgets/footer/ui/AboutProduct.tsx";
import FooterMenu from "@/widgets/footer/ui/FooterMenu.tsx";
import FooterContact from "@/widgets/footer/ui/FooterContact.tsx";
import FooterBottom from "@/widgets/footer/ui/FooterBottom.tsx";
import "./Footer.css";

export default function Footer() {
    return (
        /*data-reveal - data-атрибут, фича для хранения произвольных данных на элементе,*/
        /*используется в глобальном хуке useScrollReveal.ts для плавного скролла секции*/
        <footer className="footer" data-reveal>
            {/*Статус*/}
            <div className="footer__status">
                <span className="footer__status-dot"/>
                Все системы работают в штатном режиме
            </div>

            {/*Основной контейнер*/}
            <div className="footer__main">

                {/*О продукте*/}
                <AboutProduct/>

                <div className="footer__divider"/>

                {/*Ссылки*/}
                <FooterMenu/>

                <div className="footer__divider"/>

                {/*Контакты*/}
                <FooterContact/>
            </div>

            {/*Footer bottom*/}
            <FooterBottom/>
        </footer>
    );
}