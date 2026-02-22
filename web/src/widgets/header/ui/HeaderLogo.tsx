import { BsHouseCheck } from "react-icons/bs";

export default function HeaderLogo() {
    return (
        <div className="header__logo">
            <BsHouseCheck className="header__logo-icon"/>
            <span className="header__logo-text">
                Мой Дом
            </span>
        </div>
    )
}