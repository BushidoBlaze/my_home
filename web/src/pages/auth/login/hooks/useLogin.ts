// plugins
import {useState} from "react";
import {useNavigate} from "react-router";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

//api
import {authApi} from "@/api/auth.api.ts";

//hooks
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

const loginSchema = z.object({
    email: z.email("Введите корректный email"),
    password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function useLogin() {
    useDocumentTitle("Вход");
    const navigate = useNavigate();

    // Флаги UI: блокировка кнопки во время запроса и сообщение об ошибке
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Локальные состояния полей формы
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    // Подключаем react-hook-form с zod-валидацией по loginSchema
    const {register, handleSubmit, formState: {errors}} = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {email: "", password: ""},
    });

    async function onSubmit(values: LoginFormValues) {
        setLoading(true);
        setError("");

        try {
            const data = await authApi.login(values);

            // Сохраняем сессию в localStorage — токен читается в axios-интерцепторе
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("fullName", data.fullName);

            // Редирект зависит от роли: менеджер → панель УК, житель → домашняя страница
            if (data.role === "Manager") navigate("/manager");
            else navigate("/resident/home");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка входа");
        } finally {
            setLoading(false);
        }
    }

    return {
        loading,
        error,
        showPassword,
        setShowPassword,
        rememberMe,
        setRememberMe,
        register,
        handleSubmit,
        errors,
        onSubmit,
    };
}