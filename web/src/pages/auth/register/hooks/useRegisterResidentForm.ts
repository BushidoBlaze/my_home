// plugins
import {useState} from "react";
import {useNavigate} from "react-router";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

// api
import {authApi} from "@/api/auth.api.ts";

// Схема валидации полей регистрации жителя
const residentSchema = z.object({
    firstName: z.string().trim().min(2, "Минимум 2 символа"),
    lastName: z.string().trim().min(2, "Минимум 2 символа"),
    phone: z.string().trim().min(10, "Введите корректный номер"),
    email: z.email("Введите корректный email"),
    password: z.string().min(8, "Минимум 8 символов"),
    agreed: z.boolean(),
});

export type ResidentFormValues = z.infer<typeof residentSchema>;

// Логика формы регистрации жителя ЖК.
// Делает register → авто-login → редирект в личный кабинет жителя.
export function useRegisterResidentForm() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const {register, handleSubmit, formState: {errors}} = useForm<ResidentFormValues>({
        resolver: zodResolver(residentSchema),
        defaultValues: {
            firstName: "", lastName: "",
            phone: "", email: "", password: "",
            agreed: false,
        },
    });

    async function submit(values: ResidentFormValues) {
        // Согласие — обязательное поле, но в zod оставлено `boolean` ради UX:
        // ошибку показываем здесь же сообщением, а не красным контуром у чекбокса
        if (!values.agreed) {
            setError("Необходимо принять условия");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const fullName = `${values.firstName} ${values.lastName}`;

            await authApi.register({
                email: values.email,
                password: values.password,
                fullName,
                role: "Resident",
                phone: values.phone,
            });

            // Сразу же логиним, чтобы пользователь не вводил данные второй раз
            const data = await authApi.login({email: values.email, password: values.password});

            // Сессия: токен берёт axios-интерцептор, fullName — шапка приложения
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("fullName", data.fullName);

            navigate("/resident/home");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка регистрации");
        } finally {
            setLoading(false);
        }
    }

    return {
        register,
        errors,
        showPassword,
        setShowPassword,
        loading,
        error,
        handleSubmit: handleSubmit(submit),
    };
}
