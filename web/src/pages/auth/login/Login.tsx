import {authApi} from "@/api/auth.api.ts";
// plugins
import {useState} from "react";
import {useNavigate, Link} from "react-router";
import {Eye, EyeOff, Loader2, Lock, LogIn, Mail} from "lucide-react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

// ui
import Logo from "@/shared/ui/logo/Logo.tsx";

// api

// styles
import "./Login.css";

// Страница входа в систему
// После успешного логина редиректит жителя → /dashboard, менеджера → /manager
const loginSchema = z.object({
    email: z.email("Введите корректный email"),
    password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
    // Состояния UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const navigate = useNavigate();

    async function onSubmit(values: LoginFormValues) {
        setLoading(true);
        setError("");

        try {
            const data = await authApi.login(values);

            // Сохраняем авторизацию в localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("fullName", data.fullName);

            // Редирект по роли
            if (data.role === "Manager") {
                navigate("/manager");
            } else {
                navigate("/app/home");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка входа");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login">

            {/* Левая часть — брендинг */}
            <div className="login__brand">
                <div className="login__brand-content">
                    <div className="login__brand-logo">
                        <Logo/>
                    </div>
                    <h1 className="login__brand-title">
                        Центр управления вашим домом
                    </h1>
                    <p className="login__brand-subtitle">
                        Единая платформа для жильцов и управляющих компаний онлайн
                    </p>

                    {/* Статистика как на лендинге */}
                    <div className="login__brand-stats">
                        <div className="login__brand-stat">
                            <span className="login__brand-stat-value">4 305</span>
                            <span className="login__brand-stat-label">клиентов</span>
                        </div>
                        <div className="login__brand-stat">
                            <span className="login__brand-stat-value">166 800 ₽</span>
                            <span className="login__brand-stat-label">экономим клиенту</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Правая часть — форма */}
            <div className="login__form-side">
                <div className="login__card">
                    <h2 className="login__title">Добро пожаловать</h2>
                    <p className="login__subtitle">Войдите в аккаунт жителя ЖК или управляющей компании</p>

                    {/* Ошибка */}
                    {error && (
                        <div className="login__error">
                            {error}
                        </div>
                    )}

                    <form className="login__form" onSubmit={handleSubmit(onSubmit)}>

                        {/* Email */}
                        <div className="login__field">
                            <label className="login__label">Email</label>
                            <div className="login__input-wrap">
                                <Mail className="login__input-icon" size={18}/>
                                <input
                                    className={`login__input ${errors.email ? "login__input--error" : ""}`}
                                    type="email"
                                    {...register("email")}
                                    placeholder="example@gmail.com"
                                    required
                                />
                            </div>
                            {errors.email && <div className="login__field-error">{errors.email.message}</div>}
                        </div>

                        {/* Пароль */}
                        <div className="login__field">
                            <label className="login__label">Пароль</label>
                            <div className="login__input-wrap">
                                <Lock className="login__input-icon" size={18}/>
                                <input
                                    className={`login__input ${errors.password ? "login__input--error" : ""}`}
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    placeholder="******"
                                    required
                                />
                                <button
                                    type="button"
                                    className="login__toggle-password"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                                >
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                            <button type="button" className="login__forgot-password">
                                Забыли пароль?
                            </button>
                            {errors.password && <div className="login__field-error">{errors.password.message}</div>}
                        </div>

                        <button className="login__button" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="login__spinner"/>
                                    Входим...
                                </>
                            ) : (
                                <>
                                    <LogIn size={18}/>
                                    Войти
                                </>
                            )}
                        </button>
                    </form>

                    <p className="login__link">
                        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}