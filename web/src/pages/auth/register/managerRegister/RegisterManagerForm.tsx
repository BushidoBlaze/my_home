// plugins
import {Link} from "react-router";
import {
    Mail,
    Lock,
    User,
    Phone,
    Building2,
    Hash,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Check
} from "lucide-react";

// hooks
import {useRegisterManagerForm} from "../hooks/useRegisterManagerForm.ts";

// ui
import RoleSwitcher from "../ui/RoleSwitcher.tsx";

// types
import type {RegisterMode} from "../model/types.ts";

interface Props {
    // Колбек для переключения на форму жителя — состояние режима в Register.tsx
    onModeChange: (mode: RegisterMode) => void;
}

// Заявка на подключение управляющей компании.
// Концептуально это НЕ моментальная регистрация, а заявка:
// после submit менеджер платформы свяжется в течение рабочего дня.
export default function RegisterManagerForm({onModeChange}: Props) {
    const {
        register, errors,
        showPassword, setShowPassword,
        loading, error,
        handleSubmit,
    } = useRegisterManagerForm();

    return (
        <div className="register__form-side">

            {/* Верхняя строка: переключатель ролей + ссылка на вход */}
            <div className="register__form-top">
                <RoleSwitcher mode="manager" onChange={onModeChange}/>
                <span className="register__login-hint">
                    Уже зарегистрированы?
                    <Link to="/login" className="register__login-hint-link">Войти</Link>
                </span>
            </div>

            {/* Форма УК шире чем у жителя — больше полей, нужно место под 2-кол сетку */}
            <div className="register__form-inner register__form-inner--wide">
                <div>
                    <span className="register__form-eyebrow">Подключение УК</span>
                    <h2 className="register__title">Регистрация УК</h2>
                </div>

                {error && <div className="register__error">{error}</div>}

                <form className="register__form" onSubmit={handleSubmit}>

                    {/* Реквизиты УК: название + ИНН */}
                    <div className="register__row-two">
                        <div className="register__field">
                            <label className="register__label">Название УК</label>
                            <div
                                className={`register__input-wrap${errors.companyName ? " register__input-wrap--error" : ""}`}>
                                <Building2 className="register__input-icon" size={16} strokeWidth={1.6}/>
                                <input
                                    className="register__input"
                                    type="text"
                                    placeholder="ООО «ЖилСервис»"
                                    {...register("companyName")}
                                />
                            </div>
                            {errors.companyName &&
                                <span className="register__field-error">{errors.companyName.message}</span>}
                        </div>

                        <div className="register__field">
                            <label className="register__label">ИНН</label>
                            <div className={`register__input-wrap${errors.inn ? " register__input-wrap--error" : ""}`}>
                                <Hash className="register__input-icon" size={16} strokeWidth={1.6}/>
                                <input
                                    className="register__input"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="7700123456"
                                    {...register("inn")}
                                />
                            </div>
                            {errors.inn && <span className="register__field-error">{errors.inn.message}</span>}
                        </div>
                    </div>

                    {/* Контактное лицо: ФИО + должность */}
                    <div className="register__row-two">
                        <div className="register__field">
                            <label className="register__label">Контактное лицо</label>
                            <div
                                className={`register__input-wrap${errors.contactName ? " register__input-wrap--error" : ""}`}>
                                <User className="register__input-icon" size={16} strokeWidth={1.6}/>
                                <input
                                    className="register__input"
                                    type="text"
                                    placeholder="Анна Петрова"
                                    {...register("contactName")}
                                />
                            </div>
                            {errors.contactName &&
                                <span className="register__field-error">{errors.contactName.message}</span>}
                        </div>

                        <div className="register__field">
                            <label className="register__label">Должность</label>
                            <div
                                className={`register__input-wrap${errors.contactPosition ? " register__input-wrap--error" : ""}`}>
                                <input
                                    className="register__input register__input--no-icon"
                                    type="text"
                                    placeholder="Главный инженер"
                                    {...register("contactPosition")}
                                />
                            </div>
                            {errors.contactPosition &&
                                <span className="register__field-error">{errors.contactPosition.message}</span>}
                        </div>
                    </div>

                    {/* Каналы связи: корпоративная почта + телефон */}
                    <div className="register__row-two">
                        <div className="register__field">
                            <label className="register__label">Корпоративная почта</label>
                            <div
                                className={`register__input-wrap${errors.email ? " register__input-wrap--error" : ""}`}>
                                <Mail className="register__input-icon" size={16} strokeWidth={1.6}/>
                                <input
                                    className="register__input"
                                    type="email"
                                    placeholder="director@uk.ru"
                                    {...register("email")}
                                />
                            </div>
                            {errors.email && <span className="register__field-error">{errors.email.message}</span>}
                        </div>

                        <div className="register__field">
                            <label className="register__label">Телефон</label>
                            <div
                                className={`register__input-wrap${errors.phone ? " register__input-wrap--error" : ""}`}>
                                <Phone className="register__input-icon" size={16} strokeWidth={1.6}/>
                                <input
                                    className="register__input"
                                    type="tel"
                                    placeholder="+7 (999) 000-00-00"
                                    {...register("phone")}
                                />
                            </div>
                            {errors.phone && <span className="register__field-error">{errors.phone.message}</span>}
                        </div>
                    </div>

                    {/* Пароль для будущего входа в кабинет УК */}
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
                                {showPassword ? <Eye size={16} strokeWidth={1.6}/> :
                                    <EyeOff size={16} strokeWidth={1.6}/>}
                            </button>
                        </div>
                        {errors.password && <span className="register__field-error">{errors.password.message}</span>}
                    </div>

                    {/* Согласие + подтверждение полномочий */}
                    <label className="register__agreement">
                        <input type="checkbox" {...register("agreed")} className="register__agreement-checkbox"/>
                        <span className="register__agreement-box">
                            <Check size={10} strokeWidth={2.4}/>
                        </span>
                        <span>Я согласен на обработку данных и подтверждаю полномочия от лица УК.</span>
                    </label>

                    {/* Назад уводит на главную; submit отправляет заявку */}
                    <div className="register__navigation-row">
                        <Link to="/" className="register__button-ghost">
                            <ArrowLeft size={16} strokeWidth={2}/> Назад
                        </Link>
                        <button className="register__button-primary register__button-primary--flex" type="submit"
                                disabled={loading}>
                            {loading
                                ? <><Loader2 size={16} className="register__spinner"/> Отправляем...</>
                                : <>Зарегистрироваться <ArrowRight size={16} strokeWidth={2}/></>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
