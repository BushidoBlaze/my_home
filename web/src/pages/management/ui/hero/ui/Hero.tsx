import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router";
import {TrendingUp, Clock, CheckCircle, AlertCircle} from "lucide-react";
import HeroSphere from "@/shared/ui/heroSphere/HeroSphere.tsx";
import "./Hero.css";

/* ── Count-up компонент ───────────────────────────────────── */
interface CountUpProps {
    target: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    duration?: number; // мс
}

function CountUp({target, prefix = "", suffix = "", decimals = 0, duration = 2800}: CountUpProps) {
    const [value, setValue] = useState(0);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const startTime = performance.now();

        const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            /* ease-out cubic */
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(eased * target);
            if (progress < 1) rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration]);

    const display = decimals > 0
        ? value.toFixed(decimals)
        : Math.round(value).toString();

    return <span className="mgmt-stat__value">{prefix}{display}{suffix}</span>;
}

/* ── Данные дашборда ──────────────────────────────────────── */
const DASHBOARD_STATS = [
    {label: "Активных заявок", target: 24, prefix: "", suffix: "", decimals: 0, icon: AlertCircle, color: "#f59e0b"},
    {label: "Закрыто сегодня", target: 17, prefix: "", suffix: "", decimals: 0, icon: CheckCircle, color: "#2ecc71"},
    {label: "Среднее время, ч", target: 1.4, prefix: "", suffix: "", decimals: 1, icon: Clock, color: "#60a5fa"},
    {
        label: "Рост эффективности",
        target: 38,
        prefix: "+",
        suffix: "%",
        decimals: 0,
        icon: TrendingUp,
        color: "#a78bfa"
    },
];

const RECENT_REQUESTS = [
    {title: "Течёт кран в кв. 47", status: "В работе", statusColor: "#f59e0b"},
    {title: "Не работает лифт №2", status: "Срочно", statusColor: "#ef4444"},
    {title: "Замена лампочки, кв. 12", status: "Закрыто", statusColor: "#2ecc71"},
];

/* ── Компонент ────────────────────────────────────────────── */
export default function ManagementHero() {
    const navigate = useNavigate();

    return (
        <section className="management-hero">

            {/* Анимированная сфера из точек — правый фон */}
            <HeroSphere/>

            {/* Декоративный макет дашборда — абсолютный оверлей справа */}
            <div className="management-hero__dashboard-wrap" aria-hidden="true">
                <div className="mgmt-dashboard">
                    <div className="mgmt-dashboard__stats">
                        {DASHBOARD_STATS.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="mgmt-stat">
                                    <Icon size={16} color={stat.color} strokeWidth={2}/>
                                    <CountUp
                                        target={stat.target}
                                        prefix={stat.prefix}
                                        suffix={stat.suffix}
                                        decimals={stat.decimals}
                                    />
                                    <span className="mgmt-stat__label">{stat.label}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mgmt-dashboard__section-title">Последние заявки</div>
                    <div className="mgmt-dashboard__requests">
                        {RECENT_REQUESTS.map((req) => (
                            <div key={req.title} className="mgmt-request">
                                <span className="mgmt-request__title">{req.title}</span>
                                <span
                                    className="mgmt-request__status"
                                    style={{
                                        color: req.statusColor,
                                        borderColor: `${req.statusColor}33`,
                                        backgroundColor: `${req.statusColor}11`,
                                    }}
                                >
                                    {req.status}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mgmt-dashboard__section-title">Активность за неделю</div>
                    <div className="mgmt-chart">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="mgmt-chart__bar" style={{height: `${h}%`}}/>
                        ))}
                    </div>
                </div>
            </div>

            {/* Заголовок + описание */}
            <div className="management-hero__intro" data-reveal>
                <h1 className="management-hero__title">
                    Управляйте домом<br/>
                    <span className="management-hero__title-accent">умнее,</span> не тяжелее
                </h1>
                <p className="management-hero__desc">
                    Цифровой диспетчер заявок, аналитика расходов,
                    коммуникация с жильцами и автоматизация рутины —
                    всё в одной платформе.
                </p>
            </div>

            {/* CTA кнопки */}
            <div className="management-hero__actions" data-reveal>
                <button
                    className="hero__button hero__button--active"
                    onClick={() => navigate("/login")}
                >
                    Получить демо бесплатно
                </button>
                <button
                    className="hero__button"
                    onClick={() => navigate("/tariffs")}
                >
                    Посмотреть тарифы →
                </button>
            </div>

        </section>
    );
}
