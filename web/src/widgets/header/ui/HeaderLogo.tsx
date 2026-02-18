import {RiHome9Line} from "react-icons/ri";

export default function HeaderLogo() {
    return (
        <div className="header__logo">
            <RiHome9Line className="header__logo-icon"/>
            <span className="header__logo-text">
                Мой Дом
            </span>
        </div>
    )
}