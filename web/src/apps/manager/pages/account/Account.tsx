// plugins
import {useEffect, useRef, useState, type JSX} from "react";
import {useNavigate} from "react-router-dom";
import {User, Mail, Phone, MessageSquare, Hash, Lock, Building2, Briefcase, ShieldCheck, Clock, Calendar, Home, Eye,
    Edit2, Check, X, Camera, ChevronDown, ChevronUp, LogOut
} from "lucide-react";

// api
import {usersApi} from "@/api/users.api.ts";

// hooks
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

// styles
import "./Account.css";

const API_URL = import.meta.env.VITE_API_URL ?? "";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

interface Me {
    id: string;
    fullName: string;
    email: string;
    role: string;
    phone?: string;
    avatarUrl?: string;

    // Расширенные поля менеджера (пока заполняются из fallback;
    // позже добавим эти колонки в БД и Users API).
    telegram?: string;
    extension?: string;          // внутренний/добавочный номер
    organization?: string;
    position?: string;
    department?: string;
    employeeNumber?: string;     // табельный
    hiredAt?: string;            // дата приёма (ISO)
    accessLevel?: string;
    assignedBuildings?: string[];
    schedule?: string;
    visibleToResidents?: boolean;
}

function getInitials(name: string) {
    return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function formatDateRu(iso?: string): string {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString("ru-RU", {day: "numeric", month: "long", year: "numeric"});
    } catch {
        return iso;
    }
}

/** Демо-профиль — используется когда бэк недоступен или сервер не вернул расширенные поля. */
function buildFallback(base?: Partial<Me>): Me {
    return {
        id: base?.id ?? "demo",
        fullName: base?.fullName ?? localStorage.getItem("fullName") ?? "Ошибка загрузки...",
        email: base?.email ?? "Ошибка загрузки...",
        role: base?.role ?? "Ошибка загрузки...",
        phone: base?.phone ?? "Ошибка загрузки...",
        telegram: "@atlasov_uk",
        extension: "142",
        organization: "УК «Зелёный квартал»",
        position: "Главный диспетчер",
        department: "Диспетчерская служба",
        employeeNumber: "УК-0042",
        hiredAt: "2024-03-14",
        accessLevel: "Полный (Manager)",
        assignedBuildings: ["Берёзовая, 14", "Берёзовая, 16", "Парковая, 7к1", "Лесная, 2", "Солнечный, 11"],
        schedule: "Пн–Пт, 09:00–18:00",
        visibleToResidents: true,
        avatarUrl: base?.avatarUrl,
    };
}

export default function Account(): JSX.Element {
    useDocumentTitle('Аккаунт');

    const navigate = useNavigate();

    const [me, setMe] = useState<Me | null>(null);
    const [loading, setLoading] = useState(true);

    // Редактирование
    const [editMode, setEditMode] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Поля формы (только то что менеджер реально может менять сам)
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [telegram, setTelegram] = useState("");
    const [extension, setExtension] = useState("");
    const [visibleToResidents, setVisibleToResidents] = useState(true);

    // Аватар
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarLoading, setAvatarLoading] = useState(false);

    // Пароль
    const [pwOpen, setPwOpen] = useState(false);
    const [pwOld, setPwOld] = useState("");
    const [pwNew, setPwNew] = useState("");
    const [pwConfirm, setPwConfirm] = useState("");
    const [pwError, setPwError] = useState("");
    const [pwSuccess, setPwSuccess] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);

    // Email
    const [emOpen, setEmOpen] = useState(false);
    const [emNew, setEmNew] = useState("");
    const [emPwd, setEmPwd] = useState("");
    const [emError, setEmError] = useState("");
    const [emSuccess, setEmSuccess] = useState(false);
    const [emLoading, setEmLoading] = useState(false);

    const seedForm = (data: Me) => {
        setFullName(data.fullName);
        setPhone(data.phone ?? "");
        setTelegram(data.telegram ?? "");
        setExtension(data.extension ?? "");
        setVisibleToResidents(data.visibleToResidents ?? true);
    };

    // Загружаем профиль. Если бэк не отдаёт расширенных полей — дополняем демо-значениями.
    useEffect(() => {
        usersApi.getMe()
            .then(data => {
                const merged = buildFallback({
                    id: data.id,
                    fullName: data.fullName,
                    email: data.email,
                    role: data.role,
                    phone: data.phone,
                    avatarUrl: data.avatarUrl,
                });
                setMe(merged);
                seedForm(merged);
            })
            .catch(() => {
                const fb = buildFallback();
                setMe(fb);
                seedForm(fb);
            })
            .finally(() => setLoading(false));
    }, []);

    async function handleSave() {
        if (!me) return;
        setSaveLoading(true);
        const next: Me = {...me, fullName, phone, telegram, extension, visibleToResidents};
        try {
            await usersApi.updateMe({fullName, phone});
            localStorage.setItem("fullName", fullName);
        } catch {/* демо-режим без бэка — сохраняем локально. */} finally {
            setMe(next);
            setEditMode(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
            setSaveLoading(false);
        }
    }

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !me) return;
        setAvatarLoading(true);
        try {
            const res = await usersApi.uploadAvatar(file);
            setMe({...me, avatarUrl: res.url + "?t=" + Date.now()});
        } catch (err) {
            console.error("Ошибка загрузки аватара:", err);
        } finally {
            setAvatarLoading(false);
        }
    }

    async function handlePasswordChange() {
        setPwError("");
        if (!pwOld || !pwNew || !pwConfirm) return setPwError("Заполните все поля");
        if (pwNew !== pwConfirm) return setPwError("Пароли не совпадают");
        if (pwNew.length < 6) return setPwError("Минимум 6 символов");
        setPwLoading(true);
        try {
            await usersApi.changePassword({oldPassword: pwOld, newPassword: pwNew});
            setPwSuccess(true);
            setPwOld("");
            setPwNew("");
            setPwConfirm("");
            setTimeout(() => {
                setPwSuccess(false);
                setPwOpen(false);
            }, 1500);
        } catch (err) {
            setPwError(err instanceof Error ? err.message : "Ошибка смены пароля");
        } finally {
            setPwLoading(false);
        }
    }

    async function handleEmailChange() {
        setEmError("");
        if (!emNew || !emPwd) return setEmError("Заполните все поля");
        if (!emNew.includes("@")) return setEmError("Введите корректный email");
        setEmLoading(true);
        try {
            const res = await usersApi.changeEmail({newEmail: emNew, password: emPwd});
            setMe(prev => prev ? {...prev, email: res.email} : prev);
            setEmSuccess(true);
            setEmNew("");
            setEmPwd("");
            setTimeout(() => {
                setEmSuccess(false);
                setEmOpen(false);
            }, 1500);
        } catch (err) {
            setEmError(err instanceof Error ? err.message : "Ошибка смены email");
        } finally {
            setEmLoading(false);
        }
    }

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    }

    if (loading) return (
        <div className="mgr-account__loading">
            <div className="mgr-account__spinner"/>
        </div>
    );

    if (!me) return <div className="mgr-account__error">Не удалось загрузить профиль</div>;

    return (
        <div className="mgr-account">
            <div className="mgr-account__header">
                <div>
                    <h1 className="mgr-account__title">Аккаунт</h1>
                    <p className="mgr-account__subtitle">Профиль сотрудника и настройки доступа</p>
                </div>
                {saveSuccess && (
                    <div className="mgr-account__toast">
                        <Check size={14}/> Данные сохранены
                    </div>
                )}
            </div>

            {/* профиль */}
            <div className="mgr-account__card">
                <div className="mgr-account__profile">
                    <div className="mgr-account__avatar-wrap">
                        {me.avatarUrl ? (
                            <img className="mgr-account__avatar-img" src={`${API_ORIGIN}${me.avatarUrl}`}
                                 alt={me.fullName}/>
                        ) : (
                            <div className="mgr-account__avatar">
                                <span className="mgr-account__avatar-initials">{getInitials(me.fullName)}</span>
                            </div>
                        )}
                        <button
                            className="mgr-account__avatar-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={avatarLoading}
                            title="Изменить фото"
                        >
                            {avatarLoading ? <div className="mgr-account__avatar-spinner"/> : <Camera size={14}/>}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{display: "none"}}
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <div className="mgr-account__profile-info">
                        <h2 className="mgr-account__profile-name">{me.fullName}</h2>
                        <span className="mgr-account__profile-role">
                            <ShieldCheck size={12}/> {me.position}
                        </span>
                        <div className="mgr-account__profile-org">{me.organization}</div>
                    </div>

                    {!editMode ? (
                        <button className="mgr-account__edit-btn" onClick={() => setEditMode(true)}>
                            <Edit2 size={15}/> Редактировать
                        </button>
                    ) : (
                        <div className="mgr-account__edit-actions">
                            <button className="mgr-account__save-btn" onClick={handleSave} disabled={saveLoading}>
                                <Check size={15}/> {saveLoading ? "Сохраняем…" : "Сохранить"}
                            </button>
                            <button className="mgr-account__cancel-btn" onClick={() => setEditMode(false)}>
                                <X size={15}/>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* личные / контактные данные */}
            <div className="mgr-account__card">
                <div className="mgr-account__section-title">
                    <User size={16}/> Контактные данные
                </div>

                <div className="mgr-account__grid">
                    <div className="mgr-account__field">
                        <label className="mgr-account__label"><User size={13}/> ФИО</label>
                        {editMode ? (
                            <input className="mgr-account__input" value={fullName}
                                   onChange={e => setFullName(e.target.value)} placeholder="Иванов Иван Иванович"/>
                        ) : (
                            <span className="mgr-account__value">{me.fullName}</span>
                        )}
                    </div>

                    <div className="mgr-account__field">
                        <label className="mgr-account__label"><Mail size={13}/> Рабочий email</label>
                        <span className="mgr-account__value mgr-account__value--muted">{me.email}</span>
                    </div>

                    <div className="mgr-account__field">
                        <label className="mgr-account__label"><Phone size={13}/> Мобильный</label>
                        {editMode ? (
                            <input className="mgr-account__input" value={phone}
                                   onChange={e => setPhone(e.target.value)} placeholder="+7 (999) 000-00-00"/>
                        ) : (
                            <span className="mgr-account__value">{me.phone ||
                                <span className="mgr-account__value--empty">Не указан</span>}</span>
                        )}
                    </div>

                    <div className="mgr-account__field">
                        <label className="mgr-account__label"><Hash size={13}/> Внутренний номер</label>
                        {editMode ? (
                            <input className="mgr-account__input" value={extension}
                                   onChange={e => setExtension(e.target.value)} placeholder="142"/>
                        ) : (
                            <span className="mgr-account__value">{me.extension ||
                                <span className="mgr-account__value--empty">—</span>}</span>
                        )}
                    </div>

                    <div className="mgr-account__field">
                        <label className="mgr-account__label"><MessageSquare size={13}/> Telegram</label>
                        {editMode ? (
                            <input className="mgr-account__input" value={telegram}
                                   onChange={e => setTelegram(e.target.value)} placeholder="@username"/>
                        ) : (
                            <span className="mgr-account__value">{me.telegram ||
                                <span className="mgr-account__value--empty">Не указан</span>}</span>
                        )}
                    </div>

                    <div className="mgr-account__field">
                        <label className="mgr-account__label"><Eye size={13}/> Виден жильцам</label>
                        {editMode ? (
                            <label className="mgr-account__toggle">
                                <input type="checkbox" checked={visibleToResidents}
                                       onChange={e => setVisibleToResidents(e.target.checked)}/>
                                <span className="mgr-account__toggle-track">
                                    <span className="mgr-account__toggle-knob"/>
                                </span>
                                <span className="mgr-account__toggle-label">
                                    {visibleToResidents ? "Да — имя и контакты доступны в чате" : "Нет — контакты скрыты"}
                                </span>
                            </label>
                        ) : (
                            <span
                                className={"mgr-account__value " + (me.visibleToResidents ? "" : "mgr-account__value--muted")}>
                                {me.visibleToResidents ? "Да" : "Скрыт"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* рабочие данные */}
            <div className="mgr-account__card">
                <div className="mgr-account__section-title">
                    <Briefcase size={16}/> Рабочие данные
                </div>

                <div className="mgr-account__grid">
                    <div className="mgr-account__field">
                        <label className="mgr-account__label"><Building2 size={13}/> Организация</label>
                        <span className="mgr-account__value">{me.organization}</span>
                    </div>
                    <div className="mgr-account__field">
                        <label className="mgr-account__label"><Briefcase size={13}/> Должность</label>
                        <span className="mgr-account__value">{me.position}</span>
                    </div>
                    <div className="mgr-account__field">
                        <label className="mgr-account__label"><Briefcase size={13}/> Отдел</label>
                        <span className="mgr-account__value">{me.department}</span>
                    </div>
                    <div className="mgr-account__field">
                        <label className="mgr-account__label"><Hash size={13}/> Табельный номер</label>
                        <span className="mgr-account__value mono">{me.employeeNumber}</span>
                    </div>
                    <div className="mgr-account__field">
                        <label className="mgr-account__label"><Calendar size={13}/> Дата приёма</label>
                        <span className="mgr-account__value">{formatDateRu(me.hiredAt)}</span>
                    </div>
                    <div className="mgr-account__field">
                        <label className="mgr-account__label"><ShieldCheck size={13}/> Уровень доступа</label>
                        <span className="mgr-account__role-tag">{me.accessLevel}</span>
                    </div>
                    <div className="mgr-account__field">
                        <label className="mgr-account__label"><Clock size={13}/> График работы</label>
                        <span className="mgr-account__value">{me.schedule}</span>
                    </div>
                </div>

                <div className="mgr-account__divider"/>

                <div className="mgr-account__field">
                    <label className="mgr-account__label"><Home size={13}/> Закреплённые дома</label>
                    <div className="mgr-account__chips">
                        {(me.assignedBuildings ?? []).map(addr => (
                            <span key={addr} className="mgr-account__chip">{addr}</span>
                        ))}
                    </div>
                </div>

                <div className="mgr-account__note">
                    Должность, отдел, табельный номер и закреплённые дома меняет администратор организации.
                </div>
            </div>

            {/* безопасность */}
            <div className="mgr-account__card">
                <div className="mgr-account__section-title">
                    <Lock size={16}/> Безопасность
                </div>

                <button className="mgr-account__pw-toggle" onClick={() => setEmOpen(v => !v)}>
                    <div className="mgr-account__pw-toggle-left">
                        <Mail size={16}/> <span>Сменить email</span>
                    </div>
                    {emOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>

                {emOpen && (
                    <div className="mgr-account__pw-form">
                        {emError && <p className="mgr-account__pw-error">{emError}</p>}
                        {emSuccess && <p className="mgr-account__pw-success">Email успешно изменён</p>}
                        <input className="mgr-account__input" type="email" placeholder="Новый email"
                               value={emNew} onChange={e => setEmNew(e.target.value)}/>
                        <input className="mgr-account__input" type="password" placeholder="Текущий пароль"
                               value={emPwd} onChange={e => setEmPwd(e.target.value)}/>
                        <button className="mgr-account__pw-submit" onClick={handleEmailChange} disabled={emLoading}>
                            <Mail size={15}/> {emLoading ? "Сохраняем…" : "Обновить email"}
                        </button>
                    </div>
                )}

                <button className="mgr-account__pw-toggle" onClick={() => setPwOpen(v => !v)}>
                    <div className="mgr-account__pw-toggle-left">
                        <Lock size={16}/> <span>Сменить пароль</span>
                    </div>
                    {pwOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>

                {pwOpen && (
                    <div className="mgr-account__pw-form">
                        {pwError && <p className="mgr-account__pw-error">{pwError}</p>}
                        {pwSuccess && <p className="mgr-account__pw-success">Пароль успешно изменён</p>}
                        <input className="mgr-account__input" type="password" placeholder="Текущий пароль"
                               value={pwOld} onChange={e => setPwOld(e.target.value)}/>
                        <input className="mgr-account__input" type="password"
                               placeholder="Новый пароль (минимум 6 символов)"
                               value={pwNew} onChange={e => setPwNew(e.target.value)}/>
                        <input className="mgr-account__input" type="password" placeholder="Повторите новый пароль"
                               value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}/>
                        <button className="mgr-account__pw-submit" onClick={handlePasswordChange} disabled={pwLoading}>
                            <Lock size={15}/> {pwLoading ? "Сохраняем…" : "Обновить пароль"}
                        </button>
                    </div>
                )}

                <button className="mgr-account__logout" onClick={handleLogout}>
                    <LogOut size={15}/> Выйти из аккаунта
                </button>
            </div>
        </div>
    );
}
