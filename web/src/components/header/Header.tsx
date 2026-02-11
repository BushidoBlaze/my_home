import {RiHome9Line} from "react-icons/ri";
import {Link} from "react-router";
import "./Header.css";

const navItem = [
    {
        label: "Главная",
        to: "/",
    },
    {
        label: "Возможности",
        to: "/possibilities",
    },
    {
        label: "Тарифы",
        to: "/tariffs",
    },
    {
        label: "Для УК",
        to: "/management",
    },
    {
        label: "Для жителей",
        to: "/residents",
    },
    {
        label: "Блог",
        to: "/blog",
    }
];

export default function Header() {
    return (
        <header className="header">
            <nav className="header__nav">

                {/* Блок логотипа */}
                <div className="header__logo">
                    <RiHome9Line className="header__logo-icon"/>
                    <span className="header__logo-text">
                        Мой Дом
                    </span>
                </div>

                {/* Навигационное меню */}
                <ul className="header__list">
                    {navItem.map(item => (
                        <li key={item.to} className="header-nav__item">
                            <Link
                                to={item.to}
                                className="header-nav__link">
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Блок контактов и авторизации */}
                <div className="header__controls">
                    <span className="header__phone">8 800 700-35-12</span>
                    <button
                        type="button"
                        className="header__login-button"
                    >
                        Попробовать бесплатно
                    </button>
                </div>
            </nav>
        </header>
    );
}