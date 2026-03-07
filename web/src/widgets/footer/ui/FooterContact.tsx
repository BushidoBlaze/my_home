import {FOOTER_CONTACTS} from "../model/data.ts";

export default function FooterContact() {
    return (
        <div className="footer__col">
            <p className="footer__col-label">Связь</p>
            <ul className="footer__contacts">
                {FOOTER_CONTACTS.map((item) => (
                    <li key={item.label} className="footer__contact">
                        <p className="footer__contact-label">{item.label}</p>
                        {item.href ? (
                            <a href={item.href} className="footer__contact-value footer__contact-value--link">
                                {item.value}
                            </a>
                        ) : (
                            <span className="footer__contact-value">{item.value}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}