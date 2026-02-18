import HeaderMenu from "./HeaderMenu.tsx";
import HeaderLogo from "./HeaderLogo.tsx";
import HeaderDefaultInfo from "./HeaderDefaultInfo.tsx";
import "./Header.css";

export default function Header() {
    return (
        <header className="header">
            <nav className="header__nav">
                {/* Блок логотипа */}
                <HeaderLogo/>

                {/* Навигационное меню */}
                <HeaderMenu/>

                {/* Блок контактов и авторизации */}
                <HeaderDefaultInfo/>
            </nav>
        </header>
    );
}