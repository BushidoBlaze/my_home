import {Link} from "react-router";
import {NAV_LINKS} from "@/widgets/header/model/data.ts";

export default function HeaderMenu() {
    return (
        <>
            <ul className="header__list">
                {NAV_LINKS.map(item => (
                    <li key={item.to} className="header-nav__item">
                        <Link
                            to={item.to}
                            className="header-nav__link">
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    )
};