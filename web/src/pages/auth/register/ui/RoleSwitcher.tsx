import type {RegisterMode} from "../model/types.ts";

interface Props {
    mode: RegisterMode;
    onChange: (mode: RegisterMode) => void;
}

// Переключатель ролей в верхней части формы регистрации.
// Меняет mode в родителе — тот пересобирает страницу под выбранную роль.
export default function RoleSwitcher({mode, onChange}: Props) {
    const isResident = mode === "resident";

    return (
        <div className="register__role-switcher">
            <button
                type="button"
                className={`register__role-button${isResident ? " register__role-button--active" : ""}`}
                onClick={() => onChange("resident")}
            >
                Житель ЖК
            </button>
            <button
                type="button"
                className={`register__role-button${!isResident ? " register__role-button--active" : ""}`}
                onClick={() => onChange("manager")}
            >
                Управляющая компания
            </button>
        </div>
    );
}
