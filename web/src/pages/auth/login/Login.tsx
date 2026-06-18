// plugins
import {Link} from "react-router";
import {Eye, EyeOff, Loader2, Lock, Mail, ArrowRight, Smartphone, Landmark, Check} from "lucide-react";

// hooks
import {useLogin} from "./hooks/useLogin.ts";

// ui
import LoginBranding from "./ui/LoginBranding.tsx";

// styles
import "./Login.css";

export default function Login() {
    const {
        loading, error,
        showPassword, setShowPassword,
        rememberMe, setRememberMe,
        register, handleSubmit, errors,
        onSubmit,
    } = useLogin();

    return (
        <div className="login">
            {/* Визуальная панель (брендинг) */}
            <LoginBranding/>

            {/*Форма*/}
            <section className="login__form-side">
                <div className="login__register-hint">
                    Нет аккаунта?
                    <Link to="/register" className="login__register-hint-link">
                        Зарегистрироваться
                    </Link>
                </div>

                <div className="login__form-inner">
                    <div>
                        <h2 className="login__title">Войти в кабинет</h2>
                        <p className="login__subtitle">Жители ЖК и сотрудники УК — единый вход.</p>
                    </div>

                    {error && <div className="login__error">{error}</div>}

                    <form className="login__form" onSubmit={handleSubmit(onSubmit)}>
                        {/* Email */}
                        <div className="login__field">
                            <label className="login__label">Email или телефон</label>
                            <div className={`login__input-wrap${errors.email ? " login__input-wrap--error" : ""}`}>
                                <Mail className="login__input-icon" size={16} strokeWidth={1.6}/>
                                <input
                                    className="login__input"
                                    type="email"
                                    placeholder="ivan@example.com"
                                    {...register("email")}
                                />
                            </div>
                            {errors.email && <span className="login__field-error">{errors.email.message}</span>}
                        </div>

                        {/* Password */}
                        <div className="login__field">
                            <label className="login__label">Пароль</label>
                            <div className={`login__input-wrap${errors.password ? " login__input-wrap--error" : ""}`}>
                                <Lock className="login__input-icon" size={16} strokeWidth={1.6}/>
                                <input
                                    className="login__input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Введите пароль"
                                    {...register("password")}
                                />
                                <button
                                    type="button"
                                    className="login__password-toggle"
                                    onClick={() => setShowPassword(p => !p)}
                                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                                >
                                    {showPassword
                                        ? <Eye size={16} strokeWidth={1.6}/>
                                        : <EyeOff size={16} strokeWidth={1.6}/>
                                    }
                                </button>
                            </div>
                            <div className="login__password-hint">
                                <label className="login__remember">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={e => setRememberMe(e.target.checked)}
                                    />
                                    <span className={`login__checkbox${rememberMe ? " login__checkbox--on" : ""}`}>
                                        {rememberMe && <Check size={10} strokeWidth={2.4}/>}
                                    </span>
                                    Запомнить меня
                                </label>
                                <button type="button" className="login__forgot-password">Забыли пароль?</button>
                            </div>
                            {errors.password && <span className="login__field-error">{errors.password.message}</span>}
                        </div>

                        <button className="login__button-primary" type="submit" disabled={loading}>
                            {loading
                                ? <><Loader2 size={16} className="login__spinner"/> Входим...</>
                                : <>Войти <ArrowRight size={16} strokeWidth={2}/></>
                            }
                        </button>
                    </form>

                    <div className="login__divider"><span>или</span></div>

                    <div className="login__alternative-buttons">
                        <button type="button" className="login__button-ghost">
                            <Smartphone size={16} strokeWidth={1.6}/>
                            Код по SMS

                            <span className="login__button-ghost--later">
                                (Скоро)
                            </span>
                        </button>
                        <button type="button" className="login__button-ghost">
                            <Landmark size={16} strokeWidth={1.6}/>
                            Госуслуги

                            <span className="login__button-ghost--later">
                                (Скоро)
                            </span>
                        </button>
                    </div>

                    <p className="login__footer">Соединение защищено</p>
                </div>
            </section>
        </div>
    );
}