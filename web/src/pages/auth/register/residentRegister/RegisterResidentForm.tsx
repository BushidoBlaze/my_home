// plugins
import {Link} from "react-router";
import {Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Loader2, Check} from "lucide-react";

// hooks
import {useRegisterResidentForm} from "../hooks/useRegisterResidentForm.ts";

// ui
import RoleSwitcher from "../ui/RoleSwitcher.tsx";
import StepIndicator from "../ui/StepIndicator.tsx";

// types
import type {RegisterMode} from "../model/types.ts";

interface Props {
    // Колбек для переключения на форму УК — состояние режима живёт в Register.tsx
    onModeChange: (mode: RegisterMode) => void;
}

// Форма регистрации жителя ЖК.
// Шаг 1 из 3 в воронке: контакты → адрес → подтверждение.
// Адрес и подтверждение пока заглушка — после submit сразу идёт авто-логин.
export default function RegisterResidentForm({onModeChange}: Props) {
    const {
        register, errors,
        showPassword, setShowPassword,
        loading, error,
        handleSubmit,
    } = useRegisterResidentForm();

    return (
        <div className="register__form-side">

            {/* Верхняя строка: переключатель ролей + ссылка на вход */}
            <div className="register__form-top">
                <RoleSwitcher mode="resident" onChange={onModeChange}/>
                <span className="register__login-hint">
                    Есть аккаунт?
                    <Link to="/login" className="register__login-hint-link">Войти</Link>
                </span>
            </div>

            <div className="register__form-inner">
                <div>
                    <h2 className="register__title">Регистрация жителя</h2>
                    <p className="register__subtitle">Шаг 1 из 3 — данные для входа</p>
                </div>

                <StepIndicator steps={["Контакты", "Адрес", "Готово"]} current={0}/>

                {error && <div className="register__error">{error}</div>}

                <form className="register__form" onSubmit={handleSubmit}>

                    {/* Имя + фамилия в две колонки. У "Фамилии" нет иконки — так в макете */}
                    <div className="register__row-two">
                        <div className="register__field">
                            <label className="register__label">Имя</label>
                            <div className={`register__input-wrap${errors.firstName ? " register__input-wrap--error" : ""}`}>
                                <User className="register__input-icon" size={16} strokeWidth={1.6}/>
                                <input
                                    className="register__input"
                                    type="text"
                                    placeholder="Раян"
                                    {...register("firstName")}
                                />
                            </div>
                            {errors.firstName && <span className="register__field-error">{errors.firstName.message}</span>}
                        </div>

                        <div className="register__field">
                            <label className="register__label">Фамилия</label>
                            <div className={`register__input-wrap${errors.lastName ? " register__input-wrap--error" : ""}`}>
                                <input
                                    className="register__input register__input--no-icon"
                                    type="text"
                                    placeholder="Атласов"
                                    {...register("lastName")}
                                />
                            </div>
                            {errors.lastName && <span className="register__field-error">{errors.lastName.message}</span>}
                        </div>
                    </div>

                    {/* Телефон */}
                    <div className="register__field">
                        <label className="register__label">Телефон</label>
                        <div className={`register__input-wrap${errors.phone ? " register__input-wrap--error" : ""}`}>
                            <Phone className="register__input-icon" size={16} strokeWidth={1.6}/>
                            <input
                                className="register__input"
                                type="tel"
                                placeholder="+7 (___) ___-__-__"
                                {...register("phone")}
                            />
                        </div>
                        {errors.phone && <span className="register__field-error">{errors.phone.message}</span>}
                    </div>

                    {/* Электронная почта */}
                    <div className="register__field">
                        <label className="register__label">Электронная почта</label>
                        <div className={`register__input-wrap${errors.email ? " register__input-wrap--error" : ""}`}>
                            <Mail className="register__input-icon" size={16} strokeWidth={1.6}/>
                            <input
                                className="register__input"
                                type="email"
                                placeholder="вы@домен.ru"
                                {...register("email")}
                            />
                        </div>
                        {errors.email && <span className="register__field-error">{errors.email.message}</span>}
                    </div>

                    {/* Пароль с глазом и подсказкой по сложности */}
                    <div className="register__field">
                        <label className="register__label">Пароль</label>
                        <div className={`register__input-wrap${errors.password ? " register__input-wrap--error" : ""}`}>
                            <Lock className="register__input-icon" size={16} strokeWidth={1.6}/>
                            <input
                                className="register__input"
                                type={showPassword ? "text" : "password"}
                                placeholder="Минимум 8 символов"
                                {...register("password")}
                            />
                            <button
                                type="button"
                                className="register__password-toggle"
                                onClick={() => setShowPassword(p => !p)}
                                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                            >
                                {showPassword ? <Eye size={16} strokeWidth={1.6}/> : <EyeOff size={16} strokeWidth={1.6}/>}
                            </button>
                        </div>
                        <span className="register__input-hint">Буквы и цифры, без пробелов</span>
                        {errors.password && <span className="register__field-error">{errors.password.message}</span>}
                    </div>

                    {/* Согласие с условиями. Чекбокс скрыт CSS, рисуется через span */}
                    <label className="register__agreement">
                        <input type="checkbox" {...register("agreed")} className="register__agreement-checkbox"/>
                        <span className="register__agreement-box">
                            <Check size={10} strokeWidth={2.4}/>
                        </span>
                        <span>
                            Я соглашаюсь с <a href="#">условиями</a> и{" "}
                            <a href="#">политикой&nbsp;конфиденциальности</a>
                        </span>
                    </label>

                    <button className="register__button-primary" type="submit" disabled={loading}>
                        {loading
                            ? <><Loader2 size={16} className="register__spinner"/> Регистрируем...</>
                            : <>Продолжить <ArrowRight size={16} strokeWidth={2}/></>
                        }
                    </button>
                </form>

                <p className="register__footer">Защищённое соединение</p>
            </div>
        </div>
    );
}
