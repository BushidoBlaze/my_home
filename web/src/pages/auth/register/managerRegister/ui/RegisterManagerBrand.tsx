// ui
import Logo from "@/shared/ui/logo/Logo.tsx";
import Skyline from "@/shared/ui/Skyline/Skyline.tsx";

// types
import type {RegisterFeature} from "../../model/types.ts";

interface Props {
    features: RegisterFeature[];
}

// Брендовая панель для регистрации УК.
// В отличие от резидентской — графитовый фон вместо изумрудного,
// eyebrow вместо chip, нет ссылки «На главную» (она дублируется кнопкой «Назад» в форме).
export default function RegisterManagerBrand({features}: Props) {
    return (
        <div className="register__brand register__brand--graphite">
            {/* Фоновая архитектурная иллюстрация — общая со всеми auth-экранами */}
            <Skyline/>

            <div className="register__brand-top">
                <Logo/>
            </div>

            <div className="register__brand-body">
                <span className="register__brand-eyebrow">Платформа для УК</span>
                <h1 className="register__brand-headline">
                    Автоматизируйте управление жилым фондом
                </h1>
                <p className="register__brand-lead">
                    Один кабинет для диспетчерской и связи с жильцами.
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
