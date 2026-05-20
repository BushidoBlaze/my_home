// plugins
import {useState} from "react";

// ui
import RegisterBrand from "@/pages/auth/register/ui/RegisterBrand.tsx";
import RegisterForm from "@/pages/auth/register/ui/RegisterForm.tsx";

// data
import {RESIDENT_FEATURES, MANAGER_FEATURES} from "@/pages/auth/register/model/data.ts";

// types
import type {RegisterMode} from "@/pages/auth/register/model/types.ts";

// styles
import "@/pages/auth/register/ui/Register.css";

export default function Register() {
    const [mode, setMode] = useState<RegisterMode>("resident");
    const isResident = mode === "resident";
    const features = isResident ? RESIDENT_FEATURES : MANAGER_FEATURES;

    return (
        <div className="register">

            {/* Переключатель */}
            <div className="register__switcher">
                <button
                    className={`register__switch-btn ${isResident ? "register__switch-btn--active" : ""}`}
                    onClick={() => setMode("resident")}
                >
                    Житель (ЖК)
                </button>
                <button
                    className={`register__switch-btn ${!isResident ? "register__switch-btn--active" : ""}`}
                    onClick={() => setMode("manager")}
                >
                    Управляющая компания
                </button>
            </div>

            {/* Слот формы — плавно сдвигается */}
            <div className={`register__slot register__slot--form ${isResident ? "register__slot--left" : "register__slot--right"}`}>
                <RegisterForm mode={mode}/>
            </div>

            {/* Слот бренда — плавно сдвигается в противоположную сторону */}
            <div className={`register__slot register__slot--brand ${isResident ? "register__slot--right" : "register__slot--left"}`}>
                <RegisterBrand mode={mode} features={features}/>
            </div>
        </div>
    );
}