import HeaderMenu from "./HeaderMenu.tsx";
import Logo from "@/shared/ui/logo/Logo.tsx";
import HeaderDefaultInfo from "./HeaderDefaultInfo.tsx";
import "./Header.css";

export default function Header() {
    return (
        <header className="header">
            {/* Блок логотипа */}
            <Logo/>

            {/* Навигационное меню */}
            <HeaderMenu/>

            {/* Блок контактов и авторизации */}
            <HeaderDefaultInfo/>
        </header>
    );
}