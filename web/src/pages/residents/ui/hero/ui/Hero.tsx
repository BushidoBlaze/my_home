import {useNavigate} from "react-router";
import {Wallet, ClipboardList, MessageCircle, Gauge} from "lucide-react";
import HeroSphere from "@/shared/ui/heroSphere/HeroSphere.tsx";
import "./Hero.css";

/* Ключевые возможности — правая колонка, aria-hidden */
const FEATURES = [
    {icon: Wallet, title: "Оплата без комиссии", desc: "ЖКУ, интернет и парковка в пару кликов", color: "#2ecc71"},
    {icon: Gauge, title: "Показания счётчиков", desc: "Передавайте данные онлайн, без очередей", color: "#60a5fa"},
    {
        icon: ClipboardList,
        title: "Заявки на ремонт",
        desc: "Статус — в реальном времени прямо в телефоне",
        color: "#a78bfa"
    },
    {icon: MessageCircle, title: "Чат с УК", desc: "Пишите управляющей компании напрямую", color: "#f59e0b"},
    {icon: Wallet, title: "Оплата без комиссии", desc: "ЖКУ, интернет и парковка в пару кликов", color: "#2ecc71"},
    {icon: Gauge, title: "Показания счётчиков", desc: "Передавайте данные онлайн, без очередей", color: "#60a5fa"}
];

export default function ResidentsHero() {
    const navigate = useNavigate();

    function scrollToBenefits() {
        document.getElementById("residents-benefits")?.scrollIntoView({behavior: "smooth"});
    }

    return (
        <section className="residents-hero">

            {/* Анимированная сфера из точек — правый фон */}
            <HeroSphere/>

            <div className="residents-hero__bg" aria-hidden="true"/>

            {/* ── ЛЕВАЯ колонка: текстовый контент (data-reveal) ── */}
            <div className="residents-hero__content" data-reveal>
                <h1 className="residents-hero__title">
                    Ваш дом —<br/>
                    <span className="residents-hero__title-accent">в смартфоне</span>
                </h1>

                <p className="residents-hero__desc">
                    Оплата ЖКУ без комиссии, передача показаний счётчиков,
                    заявки на ремонт и прямой чат с управляющей компанией.
                    Всё в одном приложении — бесплатно.
                </p>

                <div className="residents-hero__pills">
                    {["Бесплатно", "Без очередей", "24 / 7"].map((p) => (
                        <span key={p} className="residents-hero__pill">{p}</span>
                    ))}
                </div>

                <div className="residents-hero__actions">
                    <button
                        className="hero__button hero__button--active"
                        onClick={() => navigate("/login")}
                    >
                        Зарегистрироваться бесплатно
                    </button>
                    <button
                        className="hero__button"
                        onClick={scrollToBenefits}
                    >
                        Узнать больше ↓
                    </button>
                </div>
            </div>

            {/* ── ПРАВАЯ колонка: сетка возможностей (aria-hidden) ── */}
            <div className="residents-hero__features" aria-hidden="true">
                {FEATURES.map((f) => {
                    const Icon = f.icon;
                    return (
                        <div key={f.title} className="residents-feature">
                            <div
                                className="residents-feature__icon"
                                style={{background: `${f.color}18`, color: f.color}}
                            >
                                <Icon size={20} strokeWidth={2}/>
                            </div>
                            <p className="residents-feature__title">{f.title}</p>
                            <p className="residents-feature__desc">{f.desc}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
