import {FOOTER_NAV_LINKS} from "@/widgets/footer/model/data.ts";
import {Link} from "react-router-dom";

export default function FooterMenu() {
    return (
        <div className="footer__col">
            <p className="footer__col-label">Разделы</p>
            <ul className="footer__nav">
                {FOOTER_NAV_LINKS.map((item) => (
                    <li key={item.to} className="footer__nav-item">
                        <Link to={item.to} className="footer__nav-link">
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}