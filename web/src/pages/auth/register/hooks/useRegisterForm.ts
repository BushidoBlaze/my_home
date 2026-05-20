import {authApi} from "@/api/auth.api.ts";
// plugins
import {useState} from "react";
import {useNavigate} from "react-router";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

// api


// types
import type {RegisterMode} from "../model/types.ts";

const registerSchema = z.object({
    fullName: z.string().trim(),
    companyName: z.string().trim(),
    phone: z.string().trim(),
    email: z.email("Введите корректный email"),
    password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
    confirmPassword: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
    agreed: z.boolean(),
}).superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
        ctx.addIssue({
            code: "custom",
            path: ["confirmPassword"],
            message: "Пароли не совпадают",
        });
    }
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// Хук инкапсулирует логику обеих форм регистрации
export function useRegisterForm(mode: RegisterMode) {
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            companyName: "",
            phone: "",
            email: "",
            password: "",
            confirmPassword: "",
            agreed: false,
        },
    });

    const navigate = useNavigate();

    async function submit(values: RegisterFormValues) {
        setError("");
        const isResident = mode === "resident";
        const fullName = isResident ? values.fullName : values.companyName;
        const phone = isResident ? undefined : values.phone;
        const agreed = values.agreed;
        if (!isResident && !agreed) {
            setError("Необходимо согласие на обработку персональных данных");
            return;
        }
        if (isResident && !fullName.trim()) {
            setError("Укажите полное имя");
            return;
        }
        if (!isResident && !fullName.trim()) {
            setError("Укажите название УК");
            return;
        }
        if (!isResident && !phone?.trim()) {
            setError("Укажите телефон");
            return;
        }

        setLoading(true);

        try {
            const role = mode === "manager" ? "Manager" : "Resident";
            const name = mode === "manager" ? values.companyName : values.fullName;

            await authApi.register({email: values.email, password: values.password, fullName: name, role, phone});
            const data = await authApi.login({email: values.email, password: values.password});

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("fullName", data.fullName);

            // Редирект по роли
            navigate(data.role === "Manager" ? "/manager" : "/app/home");
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