// plugins
import {useState} from "react";

// hooks
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

// ui — жители
import RegisterResidentForm from "./residentRegister/RegisterResidentForm.tsx";
import RegisterResidentBrand from "./residentRegister/ui/RegisterResidentBrand.tsx";

// ui — управляющие компании
import RegisterManagerForm from "./managerRegister/RegisterManagerForm.tsx";
import RegisterManagerBrand from "./managerRegister/ui/RegisterManagerBrand.tsx";

// data
import {RESIDENT_FEATURES, MANAGER_FEATURES} from "./model/data.ts";

// types
import type {RegisterMode} from "./model/types.ts";

// styles
import "./ui/Register.css";

// Корневой компонент /register. Держит режим (житель/УК) и рендерит подходящую
// пару Brand + Form. Слоты меняются местами с плавной анимацией:
//   житель — бренд слева, форма справа;
//   УК — форма слева, бренд справа (так в макете).
export default function Register() {
    useDocumentTitle("Регистрация");

    const [mode, setMode] = useState<RegisterMode>("resident");
    const isResident = mode === "resident";

    return (
        <div className={`register${isResident ? "" : " register--manager"}`}>
            {isResident ? (
                <>
                    <div className="register__slot register__slot--brand register__slot--left">
                        <RegisterResidentBrand features={RESIDENT_FEATURES}/>
                    </div>
                    <div className="register__slot register__slot--form register__slot--right">
                        <RegisterResidentForm onModeChange={setMode}/>
                    </div>
                </>
            ) : (
                <>
                    <div className="register__slot register__slot--form register__slot--left">
                        <RegisterManagerForm onModeChange={setMode}/>
                    </div>
                    <div className="register__slot register__slot--brand register__slot--right">
                        <RegisterManagerBrand features={MANAGER_FEATURES}/>
                    </div>
                </>
            )}
        </div>
    );
}
