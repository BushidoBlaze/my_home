import AboutProduct from "@/widgets/footer/ui/AboutProduct.tsx";
import FooterMenu from "@/widgets/footer/ui/FooterMenu.tsx";
import FooterContact from "@/widgets/footer/ui/FooterContact.tsx";
import FooterBottom from "@/widgets/footer/ui/FooterBottom.tsx";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
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