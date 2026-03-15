import {ChevronsRight} from "lucide-react";
import {Link} from "react-router-dom";
import "./NotFound.css";

import heroImage from "@/shared/assets/images/notFound/background-image-not-found-page.jpg";

export default function NotFound() {
    return (
        <div className="not-found-container">

            {/*Фото ЖК -- (background)*/}
            <div className="not-found__hero" style={{backgroundImage: `url(${heroImage})`}}/>

            {/*Затемнение фона*/}
            <div className="not-found__overlay"/>

            {/*Цифры 404*/}
            <span className="not-found__code" aria-hidden="true">404</span>

            {/* Стеклянная карточка по центру */}
            <main className="not-found__card">
                <p className="not-found__label">Похоже, вы зашли не в тот подъезд</p>
                <p className="not-found__description">
                    Страница была удалена или никогда не существовала
                </p>
                <Link to="/" className="not-found__button">
                    <span>Вернуться на главную</span>
                    <span className="not-found__button-arrow"><ChevronsRight strokeWidth={0.75}/></span>
                </Link>
            </main>
        </div>
    );
}