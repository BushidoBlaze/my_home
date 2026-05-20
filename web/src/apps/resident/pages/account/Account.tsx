import {usersApi} from "@/api/users.api.ts";
import {subscriptionApi, type SubscriptionInfo, type UserApartmentItem} from "@/api/subscription.api.ts";
// plugins
import {useEffect, useState, useRef} from "react";

import {
    User, Mail, Phone, Calendar, Lock, Home, Users,
    Ruler, DoorOpen, ChevronDown, ChevronUp, Edit2, Check, X, Camera,
    Crown, Plus, Building2, Sparkles,
} from "lucide-react";

// api


// styles
import "./Account.css";

const API_URL = import.meta.env.VITE_API_URL ?? "";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

// Типы — расширяем User полями квартиры и аватара
interface Me {
    id: string;
    fullName: string;
    email: string;
    role: string;
    phone?: string;
    birthDate?: string;
    avatarUrl?: string;
    country?: string;
    city?: string;
    street?: string;
    house?: string;
    building?: string;
    entrance?: string;
    floor?: string;
    apartmentNumber?: string;
    residents?: number;
    area?: number;
    rooms?: number;
    apartmentRole?: string;
}

// Получаем инициалы из имени для аватара-заглушки
function getInitials(name: string) {
    return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

// Роль на русском
function getRoleLabel(role: string) {
    const map: Record<string, string> = {
        Resident: "Житель",
        Manager: "Управляющая компания",
    };
    return map[role] || role;
}

export default function Account() {
    // Данные пользователя
    const [me, setMe] = useState<Me | null>(null);
    const [loading, setLoading] = useState(true);

    // Режим редактирования
    const [editMode, setEditMode] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Личные данные
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [birthDate, setBirthDate] = useState("");

    // Адрес
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [street, setStreet] = useState("");
    const [house, setHouse] = useState("");
    const [building, setBuilding] = useState("");
    const [entrance, setEntrance] = useState("");
    const [floor, setFloor] = useState("");
    const [apartmentNumber, setApartmentNumber] = useState("");

    // Параметры квартиры
    const [residents, setResidents] = useState("");
    const [area, setArea] = useState("");
    const [rooms, setRooms] = useState("");
    const [apartmentRole, setApartmentRole] = useState("Собственник");

    // Аватар
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarLoading, setAvatarLoading] = useState(false);

    // Смена пароля
    const [pwOpen, setPwOpen] = useState(false);
    const [pwOld, setPwOld] = useState("");
    const [pwNew, setPwNew] = useState("");
    const [pwConfirm, setPwConfirm] = useState("");
    const [pwError, setPwError] = useState("");
    const [pwSuccess, setPwSuccess] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);

    // Секция квартиры — открыта по умолчанию
    const [aptOpen, setAptOpen] = useState(true);

    // Подписка
    const [subscription, setSubscription] = useState<SubscriptionInfo>({plan: "Basic"});
    const [upgradeLoading, setUpgradeLoading] = useState(false);

    // Список квартир
    const [apartments, setApartments] = useState<UserApartmentItem[]>([]);

    async function handleUpgrade() {
        setUpgradeLoading(true);
        try {
            const result = await subscriptionApi.upgradeSubscription();
            setSubscription(result);
        } finally {
            setUpgradeLoading(false);
        }
    }

    async function addApartment() {
        try {
            const newApt = await subscriptionApi.addApartment({});
            setApartments(prev => [...prev, newApt]);
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Ошибка");
        }
    }

    // Загружаем данные пользователя при монтировании
    useEffect(() => {
        usersApi.getMe()
            .then(data => {
                setMe(data);
                // Инициализируем все поля формы
                setFullName(data.fullName);
                setPhone(data.phone || "");
                setBirthDate(data.birthDate || "");
                setCountry(data.country || "");
                setCity(data.city || "");
                setStreet(data.street || "");
                setHouse(data.house || "");
                setBuilding(data.building || "");
                setEntrance(data.entrance || "");
                setFloor(data.floor || "");
                setApartmentNumber(data.apartmentNumber || "");
                setResidents(data.residents?.toString() || "");
                setArea(data.area?.toString() || "");
                setRooms(data.rooms?.toString() || "");
                setApartmentRole(data.apartmentRole || "Собственник");
            })
            .finally(() => setLoading(false));
        subscriptionApi.getSubscription().then(setSubscription).catch(() => {});
        subscriptionApi.getMyApartments().then(setApartments).catch(() => {});
    }, []);

    // Сохранение всех данных профиля
    async function handleSave() {
        if (!me) return;
        setSaveLoading(true);
        try {
            const updated = await usersApi.updateMe({
                fullName, phone, birthDate,
                country, city, street, house,
                building, entrance, floor, apartmentNumber,
                residents: residents ? parseInt(residents) : undefined,
                area: area ? parseFloat(area) : undefined,
                rooms: rooms ? parseInt(rooms) : undefined,
                apartmentRole
            });
            setMe({...me, ...updated});
            // Обновляем имя в localStorage чтобы сайдбар подхватил
            localStorage.setItem("fullName", fullName);
            setEditMode(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } finally {
            setSaveLoading(false);
        }
    }

    // Загрузка аватара — отправляем файл на бэк
    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !me) return;

        setAvatarLoading(true);
        try {
            const res = await usersApi.uploadAvatar(file);
            // Добавляем timestamp чтобы браузер не кешировал старое фото
            setMe({...me, avatarUrl: res.url + "?t=" + Date.now()});
        } catch (err) {
            console.error("Ошибка загрузки аватара:", err);
        } finally {
            setAvatarLoading(false);
        }
    }

    // Смена пароля — реальный запрос к бэку
    async function handlePasswordChange() {
        setPwError("");
        if (!pwOld || !pwNew || !pwConfirm) {
            setPwError("Заполните все поля");
            return;
        }
        if (pwNew !== pwConfirm) {
            setPwError("Пароли не совпадают");
            return;
        }
        if (pwNew.length < 6) {
            setPwError("Минимум 6 символов");
            return;
        }

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

    // Состояния загрузки и ошибки
    if (loading) return (
        <div className="account__loading">
            <div className="account__loading-spinner"/>
        </div>
    );

    if (!me) return <div className="account__error-state">Ошибка загрузки</div>;

    return (
        <div className="account">

            {/* Шапка страницы */}
            <div className="account__header">
                <div>
                    <h1 className="account__title">Аккаунт</h1>
                    <p className="account__subtitle">Личные данные и настройки профиля</p>
                </div>
                {/* Toast уведомление об успешном сохранении */}
                {saveSuccess && (
                    <div className="account__save-toast">
                        <Check size={14}/> Данные сохранены
                    </div>
                )}
            </div>

            {/* ─── Карточка: Личные данные ─── */}
            <div className="account__card">

                {/* Профиль: аватар + имя + кнопки */}
                <div className="account__profile">

                    {/* Аватар с кнопкой загрузки */}
                    <div className="account__avatar-wrap">
                        {me.avatarUrl ? (
                            <img
                                className="account__avatar-img"
                                src={`${API_ORIGIN}${me.avatarUrl}`}
                                alt={me.fullName}
                            />
                        ) : (
                            <div className="account__avatar">
                                <span className="account__avatar-initials">
                                    {getInitials(me.fullName)}
                                </span>
                            </div>
                        )}

                        {/* Кнопка камеры — открывает выбор файла */}
                        <button
                            className="account__avatar-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={avatarLoading}
                            title="Изменить фото"
                        >
                            {avatarLoading
                                ? <div className="account__avatar-spinner"/>
                                : <Camera size={14}/>
                            }
                        </button>

                        {/* Скрытый input для выбора файла */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{display: "none"}}
                            onChange={handleAvatarChange}
                        />
                    </div>

                    {/* Имя и роль */}
                    <div className="account__profile-info">
                        <h2 className="account__profile-name">{me.fullName}</h2>
                        <span className="account__profile-role">
                            {getRoleLabel(me.role)}
                        </span>
                    </div>

                    {/* Кнопки редактирования / сохранения */}
                    {!editMode ? (
                        <button className="account__edit-btn" onClick={() => setEditMode(true)}>
                            <Edit2 size={15}/> Редактировать
                        </button>
                    ) : (
                        <div className="account__edit-actions">
                            <button
                                className="account__save-btn"
                                onClick={handleSave}
                                disabled={saveLoading}
                            >
                                <Check size={15}/>
                                {saveLoading ? "Сохраняем..." : "Сохранить"}
                            </button>
                            <button
                                className="account__cancel-btn"
                                onClick={() => setEditMode(false)}
                            >
                                <X size={15}/>
                            </button>
                        </div>
                    )}
                </div>

                <div className="account__divider"/>

                {/* Заголовок секции */}
                <div className="account__section-title">
                    <User size={16}/> Личные данные
                </div>

                {/* Поля личных данных */}
                <div className="account__grid">

                    <div className="account__field">
                        <label className="account__label"><User size={13}/> ФИО</label>
                        {editMode ? (
                            <input
                                className="account__input"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="Иван Иванов"
                            />
                        ) : (
                            <span className="account__value">{me.fullName}</span>
                        )}
                    </div>

                    {/* Email нельзя менять */}
                    <div className="account__field">
                        <label className="account__label"><Mail size={13}/> Email</label>
                        <span className="account__value account__value--muted">{me.email}</span>
                    </div>

                    <div className="account__field">
                        <label className="account__label"><Phone size={13}/> Телефон</label>
                        {editMode ? (
                            <input
                                className="account__input"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="+7 (999) 000-00-00"
                            />
                        ) : (
                            <span className="account__value">
                                {me.phone || <span className="account__value--empty">Не указан</span>}
                            </span>
                        )}
                    </div>

                    <div className="account__field">
                        <label className="account__label"><Calendar size={13}/> Дата рождения</label>
                        {editMode ? (
                            <input
                                className="account__input"
                                type="date"
                                value={birthDate}
                                onChange={e => setBirthDate(e.target.value)}
                            />
                        ) : (
                            <span className="account__value">
                                {me.birthDate
                                    ? new Date(me.birthDate).toLocaleDateString("ru-RU")
                                    : <span className="account__value--empty">Не указана</span>
                                }
                            </span>
                        )}
                    </div>
                </div>

                <div className="account__divider"/>

                {/* Секция смены пароля — сворачивается */}
                <button className="account__pw-toggle" onClick={() => setPwOpen(v => !v)}>
                    <div className="account__pw-toggle-left">
                        <Lock size={16}/> <span>Сменить пароль</span>
                    </div>
                    {pwOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>

                {pwOpen && (
                    <div className="account__pw-form">
                        {pwError && <p className="account__pw-error">{pwError}</p>}
                        {pwSuccess && <p className="account__pw-success">Пароль успешно изменён!</p>}

                        <input
                            className="account__input"
                            type="password"
                            placeholder="Текущий пароль"
                            value={pwOld}
                            onChange={e => setPwOld(e.target.value)}
                        />
                        <input
                            className="account__input"
                            type="password"
                            placeholder="Новый пароль (минимум 6 символов)"
                            value={pwNew}
                            onChange={e => setPwNew(e.target.value)}
                        />
                        <input
                            className="account__input"
                            type="password"
                            placeholder="Повторите новый пароль"
                            value={pwConfirm}
                            onChange={e => setPwConfirm(e.target.value)}
                        />
                        <button
                            className="account__pw-submit"
                            onClick={handlePasswordChange}
                            disabled={pwLoading}
                        >
                            <Lock size={15}/>
                            {pwLoading ? "Сохраняем..." : "Обновить пароль"}
                        </button>
                    </div>
                )}
            </div>

            {/* ─── Карточка: Подписка и квартиры ─── */}
            <div className="account__card">
                <div className="account__sub-header">
                    <div className="account__section-title">
                        <Crown size={16}/> Подписка и квартиры
                    </div>
                    <span className={`account__plan-badge ${subscription.plan === "Premium" ? "account__plan-badge--premium" : ""}`}>
                        {subscription.plan === "Premium" ? <><Sparkles size={11}/> Премиум</> : "Базовый"}
                    </span>
                </div>

                {/* Планы */}
                <div className="account__plans">
                    <div className={`account__plan ${subscription.plan !== "Premium" ? "account__plan--active" : ""}`}>
                        <div className="account__plan-name">Базовый</div>
                        <div className="account__plan-price">Бесплатно</div>
                        <ul className="account__plan-features">
                            <li><Check size={12}/> 1 квартира</li>
                            <li><Check size={12}/> Все основные функции</li>
                            <li className="account__plan-feature--off"><X size={12}/> Несколько квартир</li>
                            <li className="account__plan-feature--off"><X size={12}/> Приоритетная поддержка</li>
                        </ul>
                    </div>

                    <div className={`account__plan account__plan--premium ${subscription.plan === "Premium" ? "account__plan--active" : ""}`}>
                        <div className="account__plan-crown"><Crown size={14}/></div>
                        <div className="account__plan-name">Премиум</div>
                        <div className="account__plan-price">199 ₽<span>/мес</span></div>
                        <ul className="account__plan-features">
                            <li><Check size={12}/> До 5 квартир</li>
                            <li><Check size={12}/> Все основные функции</li>
                            <li><Check size={12}/> Единый кабинет</li>
                            <li><Check size={12}/> Приоритетная поддержка</li>
                        </ul>
                        {subscription.plan !== "Premium" && (
                            <button
                                className="account__upgrade-btn"
                                onClick={handleUpgrade}
                                disabled={upgradeLoading}
                            >
                                <Sparkles size={14}/>
                                {upgradeLoading ? "Оформляем..." : "Подключить Премиум"}
                            </button>
                        )}
                        {subscription.plan === "Premium" && (
                            <div className="account__active-tag"><Check size={12}/> Активна</div>
                        )}
                    </div>
                </div>

                <div className="account__divider"/>

                {/* Список квартир */}
                <div className="account__section-title" style={{marginBottom: 4}}>
                    <Building2 size={16}/> Мои квартиры
                </div>

                <div className="account__apts">
                    {apartments.map(apt => (
                        <div key={apt.id} className={`account__apt ${apt.isActive ? "account__apt--active" : ""}`}>
                            <div className="account__apt-icon">
                                <Home size={16}/>
                            </div>
                            <div className="account__apt-info">
                                <span className="account__apt-label">{apt.label}</span>
                                <span className="account__apt-addr">{apt.address}</span>
                            </div>
                            {apt.isActive && <span className="account__apt-current">Текущая</span>}
                        </div>
                    ))}

                    {/* Кнопка добавить */}
                    {subscription.plan === "Premium" ? (
                        apartments.length < 5 && (
                            <button className="account__apt-add" onClick={addApartment}>
                                <Plus size={16}/> Добавить квартиру
                            </button>
                        )
                    ) : (
                        <div className="account__apt-locked">
                            <Lock size={14}/>
                            <span>Добавление квартир доступно на тарифе <strong>Премиум</strong></span>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Карточка: Данные квартиры ─── */}
            <div className="account__card">
                <button
                    className="account__section-toggle"
                    onClick={() => setAptOpen(v => !v)}
                >
                    <div className="account__section-title">
                        <Home size={16}/> Данные квартиры
                    </div>
                    {aptOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>

                {aptOpen && (
                    <>
                        <div className="account__divider"/>
                        <p className="account__subsection">Адрес</p>

                        {/* Поля адреса — рендерим из массива чтобы не дублировать код */}
                        <div className="account__grid account__grid--wide">
                            {[
                                {label: "Страна", value: country, set: setCountry, placeholder: "Россия"},
                                {label: "Город", value: city, set: setCity, placeholder: "Москва"},
                                {label: "Улица", value: street, set: setStreet, placeholder: "ул. Ленина"},
                                {label: "Дом", value: house, set: setHouse, placeholder: "12"},
                                {label: "Корпус", value: building, set: setBuilding, placeholder: "1"},
                                {label: "Подъезд", value: entrance, set: setEntrance, placeholder: "3"},
                                {label: "Этаж", value: floor, set: setFloor, placeholder: "5"},
                                {label: "Квартира", value: apartmentNumber, set: setApartmentNumber, placeholder: "42"},
                            ].map(f => (
                                <div key={f.label} className="account__field">
                                    <label className="account__label">{f.label}</label>
                                    {editMode ? (
                                        <input
                                            className="account__input"
                                            value={f.value}
                                            onChange={e => f.set(e.target.value)}
                                            placeholder={f.placeholder}
                                        />
                                    ) : (
                                        <span className="account__value">
                                            {f.value || <span className="account__value--empty">—</span>}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="account__divider"/>
                        <p className="account__subsection">Параметры</p>

                        <div className="account__grid">
                            <div className="account__field">
                                <label className="account__label"><Users size={13}/> Проживающих</label>
                                {editMode ? (
                                    <input
                                        className="account__input"
                                        type="number"
                                        value={residents}
                                        onChange={e => setResidents(e.target.value)}
                                        placeholder="2"
                                        min="1"
                                    />
                                ) : (
                                    <span className="account__value">
                                        {residents || <span className="account__value--empty">—</span>}
                                    </span>
                                )}
                            </div>

                            <div className="account__field">
                                <label className="account__label"><Ruler size={13}/> Площадь (м²)</label>
                                {editMode ? (
                                    <input
                                        className="account__input"
                                        type="number"
                                        value={area}
                                        onChange={e => setArea(e.target.value)}
                                        placeholder="54.5"
                                    />
                                ) : (
                                    <span className="account__value">
                                        {area ? `${area} м²` : <span className="account__value--empty">—</span>}
                                    </span>
                                )}
                            </div>

                            <div className="account__field">
                                <label className="account__label"><DoorOpen size={13}/> Комнат</label>
                                {editMode ? (
                                    <input
                                        className="account__input"
                                        type="number"
                                        value={rooms}
                                        onChange={e => setRooms(e.target.value)}
                                        placeholder="2"
                                        min="1"
                                    />
                                ) : (
                                    <span className="account__value">
                                        {rooms || <span className="account__value--empty">—</span>}
                                    </span>
                                )}
                            </div>

                            <div className="account__field">
                                <label className="account__label"><User size={13}/> Роль</label>
                                {editMode ? (
                                    <select
                                        className="account__input"
                                        value={apartmentRole}
                                        onChange={e => setApartmentRole(e.target.value)}
                                    >
                                        {/* Добавляй новые роли здесь */}
                                        <option value="Собственник">Собственник</option>
                                        <option value="Арендатор">Арендатор</option>
                                        <option value="Член семьи">Член семьи</option>
                                    </select>
                                ) : (
                                    <span className="account__role-tag">{apartmentRole}</span>
                                )}
                            </div>
                        </div>

                        <div className="account__divider"/>
                        <p className="account__subsection">Счётчики и платежи</p>
                        <div className="account__placeholder">
                            🔧 Счётчики и платёжные методы будут доступны после подключения УК
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}