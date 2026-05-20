import {usersApi, type User} from "@/api/users.api.ts";
import {servicesApi, type MyServiceItem} from "@/api/services.api.ts";
import {useEffect, useMemo, useState} from "react";
import {Frown, Loader2, Plus, X} from "lucide-react";


type Props = {
    onClose: () => void;
};

const API_URL = import.meta.env.VITE_API_URL ?? "";

type ProfileDecision = "updateProfile" | "serviceOnly";

export function MyServicesModal({onClose}: Props) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [myServices, setMyServices] = useState<MyServiceItem[]>([]);
    const [me, setMe] = useState<User | null>(null);

    const [showCreate, setShowCreate] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [selectedImageName, setSelectedImageName] = useState("");

    const [showProfileQuestion, setShowProfileQuestion] = useState(false);
    const [profileDecision, setProfileDecision] = useState<ProfileDecision | null>(null);

    const [profileName, setProfileName] = useState("");
    const [profilePhone, setProfilePhone] = useState("");

    const [serviceOnlyName, setServiceOnlyName] = useState("");
    const [serviceOnlyPhone, setServiceOnlyPhone] = useState("");

    const hasProfileContacts = useMemo(() => {
        const fullName = me?.fullName?.trim() ?? "";
        const phone = me?.phone?.trim() ?? "";
        return Boolean(fullName && phone);
    }, [me]);

    useEffect(() => {
        void loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        setError(null);
        try {
            const [services, user] = await Promise.all([
                servicesApi.getMyServices(),
                usersApi.getMe(),
            ]);
            setMyServices(Array.isArray(services) ? services : []);
            setMe(user);
            setProfileName(user.fullName ?? "");
            setProfilePhone(user.phone ?? "");
            setServiceOnlyName(user.fullName ?? "");
            setServiceOnlyPhone(user.phone ?? "");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Не удалось загрузить раздел услуг");
        } finally {
            setLoading(false);
        }
    }

    function resetCreateForm() {
        setTitle("");
        setDescription("");
        setPrice("");
        setImageUrl("");
        setSelectedImageName("");
        setSuccess(null);
        setError(null);
        setShowProfileQuestion(false);
        setProfileDecision(null);
    }

    function openCreateForm() {
        setShowCreate(true);
        resetCreateForm();
    }

    async function onUploadImage(file: File) {
        setUploading(true);
        setError(null);
        try {
            const uploaded = await servicesApi.uploadServiceImage(file);
            setImageUrl(uploaded.url);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ошибка загрузки фото");
        } finally {
            setUploading(false);
        }
    }

    async function saveProfileForService() {
        if (!me) return;
        if (!profileName.trim() || !profilePhone.trim()) {
            setError("Заполните ФИО и телефон для профиля");
            return;
        }

        const updated = await usersApi.updateMe({
            fullName: profileName.trim(),
            phone: profilePhone.trim(),
            birthDate: me.birthDate,
            country: me.country,
            city: me.city,
            street: me.street,
            house: me.house,
            building: me.building,
            entrance: me.entrance,
            floor: me.floor,
            apartmentNumber: me.apartmentNumber,
            residents: me.residents,
            area: me.area,
            rooms: me.rooms,
            apartmentRole: me.apartmentRole,
        });

        setMe(updated);
        setServiceOnlyName(updated.fullName ?? "");
        setServiceOnlyPhone(updated.phone ?? "");
    }

    async function createService() {
        if (!title.trim() || !description.trim() || !price.trim()) {
            setError("Заполните обязательные поля услуги");
            return;
        }

        if (!hasProfileContacts && !showProfileQuestion) {
            setShowProfileQuestion(true);
            return;
        }

        if (!hasProfileContacts && !profileDecision) {
            setError("Выберите, как использовать данные профиля");
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            let providerName = me?.fullName?.trim();
            let providerPhone = me?.phone?.trim();

            // Если профиль не заполнен — действуем по выбранному пользователем сценарию.
            if (!hasProfileContacts && profileDecision === "updateProfile") {
                await saveProfileForService();
                providerName = profileName.trim();
                providerPhone = profilePhone.trim();
            }

            if (!hasProfileContacts && profileDecision === "serviceOnly") {
                if (!serviceOnlyName.trim() || !serviceOnlyPhone.trim()) {
                    setError("Заполните ФИО и телефон для услуги");
                    return;
                }
                providerName = serviceOnlyName.trim();
                providerPhone = serviceOnlyPhone.trim();
            }

            await servicesApi.createMyService({
                title: title.trim(),
                description: description.trim(),
                price: Number(price),
                imageUrl: imageUrl || undefined,
                category: "Home",
                providerName,
                providerPhone,
            });

            setSuccess("Услуга создана");
            await loadData();
            resetCreateForm();
            setShowCreate(false);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Не удалось создать услугу");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="mp-modal-overlay" onClick={onClose}>
            <div className="mp-modal mp-modal--orders" onClick={(e) => e.stopPropagation()}>
                <div className="mp-modal__header">
                    <div className="mp-modal__header-info">
                        <h2 className="mp-modal__title">Мои услуги</h2>
                        <span className="mp-modal__category">Управление услугами исполнителя</span>
                    </div>
                    <button className="mp-modal__close" onClick={onClose}>
                        <X size={20}/>
                    </button>
                </div>

                <div className="mp-modal__body">
                    <button className="marketplace__action-btn marketplace__my-services-btn marketplace__my-services-btn--active" onClick={openCreateForm}>
                        <Plus size={16}/> Добавить услугу
                    </button>

                    {loading && (
                        <div className="marketplace__loading">
                            <Loader2 className="marketplace__spinner" size={20}/>
                            Загрузка...
                        </div>
                    )}

                    {error && <div className="marketplace__error">{error}</div>}
                    {success && <div className="marketplace__success">{success}</div>}

                    {showCreate && (
                        <div className="marketplace__create-card">
                            <h3 className="marketplace__create-title">Новая услуга</h3>

                            <label className="mp-modal__label">Название услуги *</label>
                            <input className="mp-modal__input" value={title} onChange={(e) => setTitle(e.target.value)}/>

                            <label className="mp-modal__label">Описание *</label>
                            <textarea className="mp-modal__textarea" value={description} rows={3}
                                      onChange={(e) => setDescription(e.target.value)}/>

                            <label className="mp-modal__label">Стоимость (₽) *</label>
                            <input className="mp-modal__input" type="number" min="0" value={price}
                                   onChange={(e) => setPrice(e.target.value)}/>

                            <label className="mp-modal__label">Фото услуги (опционально)</label>
                            <label className="marketplace__file-upload">
                                <input
                                    className="marketplace__file-upload-input"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setSelectedImageName(file.name);
                                            void onUploadImage(file);
                                        }
                                    }}
                                />
                                <span className="marketplace__file-upload-btn">Выберите файл</span>
                                <span className="marketplace__file-upload-name">
                                    {selectedImageName || "Файл не выбран"}
                                </span>
                            </label>
                            {uploading && <span className="marketplace__hint">Загружаем фото...</span>}

                            {!hasProfileContacts && (
                                <>
                                    {showProfileQuestion && (
                                        <div className="marketplace__profile-question">
                                            <p>
                                                Ваши данные профиля не заполнены. Хотите заполнить их сейчас или использовать
                                                только для этой услуги?
                                            </p>
                                            <div className="marketplace__row-btns">
                                                <button className="marketplace__ghost-btn" type="button"
                                                        onClick={() => setProfileDecision("updateProfile")}>
                                                    Заполнить профиль
                                                </button>
                                                <button className="marketplace__ghost-btn" type="button"
                                                        onClick={() => setProfileDecision("serviceOnly")}>
                                                    Только для услуги
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {profileDecision === "updateProfile" && (
                                        <div className="marketplace__profile-box">
                                            <label className="mp-modal__label">ФИО (профиль)</label>
                                            <input className="mp-modal__input" value={profileName}
                                                   onChange={(e) => setProfileName(e.target.value)}/>
                                            <label className="mp-modal__label">Телефон (профиль)</label>
                                            <input className="mp-modal__input" value={profilePhone}
                                                   onChange={(e) => setProfilePhone(e.target.value)}/>
                                        </div>
                                    )}

                                    {profileDecision === "serviceOnly" && (
                                        <div className="marketplace__profile-box">
                                            <label className="mp-modal__label">ФИО (только для услуги)</label>
                                            <input className="mp-modal__input" value={serviceOnlyName}
                                                   onChange={(e) => setServiceOnlyName(e.target.value)}/>
                                            <label className="mp-modal__label">Телефон (только для услуги)</label>
                                            <input className="mp-modal__input" value={serviceOnlyPhone}
                                                   onChange={(e) => setServiceOnlyPhone(e.target.value)}/>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="marketplace__row-btns marketplace__row-btns--actions">
                                <button className="marketplace__ghost-btn marketplace__ghost-btn--strong" type="button"
                                        onClick={() => {
                                            setShowCreate(false);
                                            resetCreateForm();
                                        }}>
                                    Отмена
                                </button>
                                <button className="marketplace__my-services-btn marketplace__my-services-btn--submit" type="button" disabled={saving}
                                        onClick={() => void createService()}>
                                    {saving ? "Сохраняем..." : "Создать услугу"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="marketplace__my-services-grid">
                        {myServices.map((service) => (
                            <div className="marketplace__my-service-card" key={service.id}>
                                <div className="marketplace__my-service-image">
                                    {service.imageUrl ? (
                                        <img src={`${API_URL}${service.imageUrl}`} alt={service.title}/>
                                    ) : (
                                        <div className="marketplace__my-service-empty-image">
                                            <Frown size={24}/>
                                            <span>Нету фото</span>
                                        </div>
                                    )}
                                </div>
                                <h4>{service.title}</h4>
                                <p>{service.description}</p>
                                <div className="marketplace__my-service-meta">
                                    <span>{service.price.toLocaleString("ru-RU")} ₽</span>
                                    <div className="marketplace__my-service-provider">
                                        <div className="marketplace__my-service-provider-avatar">
                                            {service.providerAvatarUrl ? (
                                                <img src={`${API_URL}${service.providerAvatarUrl}`} alt={service.providerName || "Профиль"}/>
                                            ) : (
                                                <span>{(service.providerName || me?.fullName || "—").trim().charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="marketplace__my-service-provider-info">
                                            <span>{service.providerName || me?.fullName || "—"}</span>
                                            <span>{service.providerPhone || me?.phone || "—"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
