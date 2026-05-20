// plugins
import {Link} from "react-router";
import {Mail, Lock, User, LogIn, Eye, EyeOff, Building2, Phone} from "lucide-react";

// hooks
import {useRegisterForm} from "../hooks/useRegisterForm.ts";

// types
import type {RegisterMode} from "../model/types.ts";

interface Props {
    mode: RegisterMode;
}

// Форма регистрации — рендерит разные поля в зависимости от mode
export default function RegisterForm({mode}: Props) {
    const {
        register,
        errors,
        showPassword,
        setShowPassword,
        loading,
        error,
        handleSubmit,
    } = useRegisterForm(mode);

    const isResident = mode === "resident";

    return (
        <div className="register__form-side">
            <div className="register__card">
                <h2 className="register__title">
                    {isResident ? "Регистрация жителя" : "Регистрация УК"}
                </h2>
                <p className="register__subtitle">
                    {isResident
                        ? "Заполните данные для входа в личный кабинет"
                        : "Подключите вашу управляющую компанию к платформе"
                    }
                </p>

                {error && <div className="register__error">{error}</div>}

                <form className="register__form" onSubmit={handleSubmit}>

                    {/* Поле только для жителя — ФИО */}
                    {isResident && (
                        <div className="register__field">
                            <label className="register__label">Полное имя</label>
                            <div className="register__input-wrap">
                                <User className="register__input-icon" size={18}/>
                                <input
                                    className="register__input"
                                    type="text"
                                    {...register("fullName")}
                                    placeholder="Иван Иванов"
                                    required
                                />
                            </div>
                            {errors.fullName && <div className="register__error">{errors.fullName.message}</div>}
                        </div>
                    )}

                    {/* Поля только для УК */}
                    {!isResident && (
                        <>
                            <div className="register__field">
                                <label className="register__label">Название УК</label>
                                <div className="register__input-wrap">
                                    <Building2 className="register__input-icon" size={18}/>
                                    <input
                                        className="register__input"
                                        type="text"
                                        {...register("companyName")}
                                        placeholder="ООО ЖилСервис"
                                        required
                                    />
                                </div>
                                {errors.companyName && <div className="register__error">{errors.companyName.message}</div>}
                            </div>

                            <div className="register__field">
                                <label className="register__label">Телефон</label>
                                <div className="register__input-wrap">
                                    <Phone className="register__input-icon" size={18}/>
                                    <input
                                        className="register__input"
                                        type="tel"
                                        {...register("phone")}
                                        placeholder="+7 (999) 000-00-00"
                                        required
                                    />
                                </div>
                                {errors.phone && <div className="register__error">{errors.phone.message}</div>}
                            </div>
                        </>
                    )}

                    {/* Общие поля */}
                    <div className="register__field">
                        <label className="register__label">Электронная почта</label>
                        <div className="register__input-wrap">
                            <Mail className="register__input-icon" size={18}/>
                            <input
                                className="register__input"
                                type="email"
                                {...register("email")}
                                placeholder="example@gmail.com"
                                required
                            />
                        </div>
                        {errors.email && <div className="register__error">{errors.email.message}</div>}
                    </div>

                    <div className="register__field">
                        <label className="register__label">Пароль</label>
                        <div className="register__input-wrap">
                            <Lock className="register__input-icon" size={18}/>
                            <input
                                className="register__input"
                                type={showPassword ? "text" : "password"}
                                {...register("password")}
                                placeholder="Минимум 6 символов"
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                className="register__toggle-password"
                                onClick={() => setShowPassword(p => !p)}
                            >
                                {showPassword ? <Eye size={18}/> : <EyeOff size={18}/>}
                            </button>
                        </div>
                        {errors.password && <div className="register__error">{errors.password.message}</div>}
                    </div>

                    <div className="register__field">
                        <label className="register__label">Повторите пароль</label>
                        <div className="register__input-wrap">
                            <Lock className="register__input-icon" size={18}/>
                            <input
                                className="register__input"
                                type={showPassword ? "text" : "password"}
                                {...register("confirmPassword")}
                                placeholder="•••••••"
                                minLength={6}
                                required
                            />
                        </div>
                        {errors.confirmPassword && <div className="register__error">{errors.confirmPassword.message}</div>}
                    </div>

                    {/* Чекбокс согласия — только для УК */}
                    {!isResident && (
                        <label className="register__agree">
                            <input
                                type="checkbox"
                                {...register("agreed")}
                                className="register__agree-checkbox"
                                required
                            />
                            <span className="register__agree-text">
                                Я согласен на обработку персональных данных в соответствии с{" "}
                                <a href="#" className="register__agree-link">политикой конфиденциальности</a>
                            </span>
                        </label>
                    )}

                    <button className="register__button" type="submit" disabled={loading}>
                        {loading ? "Регистрируем..." : (
                            <>
                                <LogIn size={18}/>
                                Зарегистрироваться
                            </>
                        )}
                    </button>
                </form>

                <p className="register__link">
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </p>
            </div>
        </div>
    );
}