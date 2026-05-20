// plugins
import type {RegisterFeature} from "../model/types.ts";

// ui
import Logo from "@/shared/ui/logo/Logo.tsx";

interface Props {
    mode: "resident" | "manager";
    features: RegisterFeature[];
}

// Брендинговая часть — контент меняется при смене режима
export default function RegisterBrand({mode, features}: Props) {
    const isResident = mode === "resident";

    return (
        <div className="register__brand">
            <div className="register__brand-content">
                <div className="register__brand-logo">
                    <Logo/>
                </div>

                <h1 className="register__brand-title">
                    {isResident
                        ? "Начните управлять своим домом уже сегодня"
                        : "Автоматизируйте управление жилым фондом"
                    }
                </h1>

                <p className="register__brand-subtitle">
                    {isResident
                        ? "Регистрация занимает меньше минуты. Подключитесь к платформе бесплатно."
                        : "Единый цифровой портал для управляющих компаний и ТСЖ."
                    }
                </p>

                <ul className="register__brand-features">
                    {features.map(feature => (
                        <li key={feature.id} className="register__brand-feature">
                            <feature.icon size={15} className="register__brand-feature-icon"/>
                            {feature.text}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}