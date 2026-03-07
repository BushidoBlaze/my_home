import {useState, useEffect} from 'react';
import {Link} from "react-router-dom";

export default function FooterBottom() {

    // ВСЁ РАДИ ВРЕМЕНИ
    const [time, setTime] = useState(new Date().toLocaleTimeString("ru-RU"));

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString("ru-RU"));
        }, 1000);

        return () => clearInterval(interval);
    }, []);
    // ВСЁ РАДИ ВРЕМЕНИ ...
    return (
        <div className="footer__bottom">
            <span className="footer__copy">© {new Date().getFullYear()} Мой Дом. Все права защищены.</span>

            <span className="footer__time">{time}</span>

            <div className="footer__bottom-links">
                <Link to="/privacy" className="footer__bottom-link">Конфиденциальность</Link>
                <Link to="/terms" className="footer__bottom-link">Условия</Link>
                <Link to="/sitemap" className="footer__bottom-link">Карта сайта</Link>
            </div>
        </div>
    )
}