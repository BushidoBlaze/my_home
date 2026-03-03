import {Link} from "react-router";
import {NAV_LINKS} from "@/widgets/header/model/data.ts";

export default function HeaderMenu() {
    return (
        <>
            <nav className="header__nav">
                <ul className="header__nav-list">
                    {NAV_LINKS.map(item => (
                        <li key={item.to} className="header__nav-item">
                            <Link
                                to={item.to}
                                className="header__nav-link">
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    )
};