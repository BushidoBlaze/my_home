// plugins
import {ArrowLeft} from "lucide-react";

// ui
import Logo from "@/shared/ui/logo/Logo.tsx";
import Skyline from "@/shared/ui/Skyline/Skyline.tsx";

// types
import type {RegisterFeature} from "../../model/types.ts";

interface Props {
    features: RegisterFeature[];
}

// Брендовая панель для регистрации жителя ЖК.
// Изумрудный фон, Регистрация < 2 минут, 4 преимущества снизу.
export default function RegisterResidentBrand({features}: Props) {
    return (
        <div className="register__brand register__brand--emerald">
            {/* Фоновая архитектурная иллюстрация — общая со всеми auth-экранами */}
            <Skyline/>

            <div className="register__brand-top">
                <Logo/>
                <a href="/" className="register__brand-back">
                    <ArrowLeft size={14} strokeWidth={1.6}/> На главную
                </a>
            </div>

            <div className="register__brand-body">
                <div className="register__brand-chip">
                    <span className="register__brand-chip-dot"/>
                    Регистрация 2 минуты
                </div>
                <h1 className="register__brand-headline">
                    Начните управлять домом уже сегодня
                </h1>
                <p className="register__brand-lead">
                    Подключитесь к платформе бесплатно — она уже работает в вашем ЖК.
                </p>
            </div>

            <div className="register__brand-features">
                {features.map(feature => (
                    <div key={feature.id} className="register__brand-feature">
                        <div className="register__brand-feature-icon">
                            <feature.icon size={15}/>
                        </div>
                        <div>
                            <div className="register__brand-feature-title">{feature.title}</div>
                            <div className="register__brand-feature-subtitle">{feature.subtitle}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
