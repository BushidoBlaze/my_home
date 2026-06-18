// plugins
import {Globe} from "lucide-react";

// ui
import Logo from "@/shared/ui/logo/Logo.tsx";
import Skyline from "@/shared/ui/Skyline/Skyline.tsx";

export default function LoginBranding() {
    return (
        <aside className="login__brand">
            {/*Фоновая архитектурная иллюстрация*/}
            <Skyline/>

            <div className="login__brand-top">
                <Logo/>
                <button type="button" className="login__language">
                    <Globe size={14} strokeWidth={1.6}/> RU
                </button>
            </div>

            <div className="login__brand-body">
                    <span className="login__eyebrow">
                        Платформа для УК и ЖК
                    </span>
                <h1 className="login__headline">
                    Центр управления вашим домом
                </h1>
                <p className="login__lead">
                    Передача показаний, оплата ЖКУ без комиссии и заявки в УК — в одном личном кабинете.
                </p>
            </div>

            <div className="login__statistics">
                {[
                    {
                        n: "Для",
                        l: "жителей"
                    },
                    {
                        n: "Для",
                        l: "управляющих компаний"},
                    {
                        n: "0 ₽",
                        l: "комиссий за оплату ЖКУ"},
                ].map((s, i) => (
                    <div key={i} className={`login__statistic${i ? " login__statistic--border" : ""}`}>
                        <div className="login__statistic-number">{s.n}</div>
                        <div className="login__statistic-label">{s.l}</div>
                    </div>
                ))}
            </div>
        </aside>
    )
}