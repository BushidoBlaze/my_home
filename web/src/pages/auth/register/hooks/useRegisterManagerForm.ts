// plugins
import {useState} from "react";
import {useNavigate} from "react-router";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

// api
import {authApi} from "@/api/auth.api.ts";

// Схема валидации заявки на подключение УК
const managerSchema = z.object({
    companyName:     z.string().trim().min(2, "Укажите название УК"),
    // ИНН в РФ — 10 (юр.лицо) или 12 (ИП) цифр
    inn:             z.string().trim().regex(/^\d{10}(\d{2})?$/, "Введите 10 или 12 цифр"),
    contactName:     z.string().trim().min(2, "Минимум 2 символа"),
    contactPosition: z.string().trim().min(2, "Укажите должность"),
    email:           z.email("Введите корректный email"),
    phone:           z.string().trim().min(10, "Введите корректный номер"),
    password:        z.string().min(8, "Минимум 8 символов"),
    agreed:          z.boolean(),
});

export type ManagerFormValues = z.infer<typeof managerSchema>;

// Логика заявки на подключение управляющей компании.
// В отличие от резидента — это заявка, а не моментальная регистрация:
// после submit менеджер связывается в течение рабочего дня.
export function useRegisterManagerForm() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const {register, handleSubmit, formState: {errors}} = useForm<ManagerFormValues>({
        resolver: zodResolver(managerSchema),
        defaultValues: {
            companyName: "", inn: "",
            contactName: "", contactPosition: "",
            email: "", phone: "", password: "",
            agreed: false,
        },
    });

    async function submit(values: ManagerFormValues) {
        // Подтверждение полномочий обязательно — юр. требование от службы поддержки
        if (!values.agreed) {
            setError("Необходимо подтвердить согласие и полномочия");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Создаём УК (организацию) и её менеджера одним запросом.
            // ИНН/должность пока не сохраняются на бэке — добавим, когда появится /uk/applications.
            await authApi.registerManager({
                companyName: values.companyName,
                email:       values.email,
                password:    values.password,
                contactName: values.contactName,
                phone:       values.phone,
            });

            // Авто-логин: УК сразу попадает в свой кабинет
            const data = await authApi.login({email: values.email, password: values.password});

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("fullName", data.fullName);

            navigate("/manager");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка отправки заявки");
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
