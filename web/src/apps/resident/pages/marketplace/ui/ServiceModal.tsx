import {useState} from "react";
import {X, Star, Phone, Calendar, MessageCircle} from "lucide-react";
import type {ServiceDetail} from "../model/types.ts";
import {CATEGORIES} from "../model/data.ts";
import {resolveAvatarUrl} from "@/apps/resident/_shared/lib/resolveAvatarUrl.ts";

interface Props {
    service: ServiceDetail;
    onClose: () => void;
    onOrder: (scheduledAt: Date, comment: string) => Promise<void>;
    onReview: (rating: number, comment: string) => Promise<void>;
}

function Stars({rating, interactive = false, onRate}: {
    rating: number;
    interactive?: boolean;
    onRate?: (r: number) => void;
}) {
    const [hover, setHover] = useState(0);

    return (
        <div className="mp-modal__stars">
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    size={interactive ? 24 : 14}
                    className={`mp-modal__star ${i <= (hover || rating) ? "mp-modal__star--filled" : ""} ${interactive ? "mp-modal__star--interactive" : ""}`}
                    onClick={() => interactive && onRate?.(i)}
                    onMouseEnter={() => interactive && setHover(i)}
                    onMouseLeave={() => interactive && setHover(0)}
                />
            ))}
        </div>
    );
}

function getInitials(name: string) {
    return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

export function ServiceModal({service, onClose, onOrder, onReview}: Props) {
    const [tab, setTab] = useState<"info" | "order" | "reviews">("info");

    // Форма заказа
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [comment, setComment] = useState("");
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderError, setOrderError] = useState("");

    // Форма отзыва
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState(false);
    const [reviewError, setReviewError] = useState("");

    async function handleOrder() {
        if (!scheduledDate || !scheduledTime) {
            setOrderError("Выберите дату и время");
            return;
        }
        setOrderLoading(true);
        setOrderError("");
        try {
            const dt = new Date(`${scheduledDate}T${scheduledTime}`);
            await onOrder(dt, comment);
            setOrderSuccess(true);
            setScheduledDate("");
            setScheduledTime("");
            setComment("");
        } catch (e) {
            setOrderError(e instanceof Error ? e.message : "Ошибка оформления заказа");
        } finally {
            setOrderLoading(false);
        }
    }

    async function handleReview() {
        if (reviewRating === 0) {
            setReviewError("Поставьте оценку");
            return;
        }
        setReviewLoading(true);
        setReviewError("");
        try {
            await onReview(reviewRating, reviewComment);
            setReviewSuccess(true);
        } catch (e) {
            setReviewError(e instanceof Error ? e.message : "Ошибка отправки отзыва");
        } finally {
            setReviewLoading(false);
        }
    }

    const categoryLabel = CATEGORIES.find(c => c.id === service.category)?.label ?? service.category;

    return (
        <div className="mp-modal-overlay" onClick={onClose}>
            <div className="mp-modal" onClick={e => e.stopPropagation()}>

                {/* Шапка */}
                <div className="mp-modal__header">
                    <div className="mp-modal__header-info">
                        <span className="mp-modal__category">{categoryLabel}</span>
                        <h2 className="mp-modal__title">{service.title}</h2>
                        <div className="mp-modal__rating-row">
                            <Stars rating={service.rating}/>
                            <span>{service.rating.toFixed(1)}</span>
                            <span className="mp-modal__reviews-count">
                                {service.reviewsCount} отзывов
                            </span>
                        </div>
                    </div>
                    <button className="mp-modal__close" onClick={onClose}>
                        <X size={20}/>
                    </button>
                </div>

                {/* Фото */}
                {service.imageUrl && (
                    <div className="mp-modal__image">
                        <img src={resolveAvatarUrl(service.imageUrl)} alt={service.title}/>
                    </div>
                )}

                {/* Табы */}
                <div className="mp-modal__tabs">
                    {([
                        {key: "info", label: "Описание"},
                        {key: "order", label: "Заказать"},
                        {key: "reviews", label: `Отзывы (${service.reviewsCount})`},
                    ] as const).map(t => (
                        <button
                            key={t.key}
                            className={`mp-modal__tab ${tab === t.key ? "mp-modal__tab--active" : ""}`}
                            onClick={() => setTab(t.key)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="mp-modal__body">

                    {/* ─── Описание ─── */}
                    {tab === "info" && (
                        <div className="mp-modal__info">
                            <p className="mp-modal__desc">{service.description}</p>

                            <div className="mp-modal__price-block">
                                <span className="mp-modal__price-label">Стоимость</span>
                                <span className="mp-modal__price">
                                    {service.price.toLocaleString("ru-RU")} ₽
                                </span>
                            </div>

                            {/* Провайдер */}
                            <div className="mp-modal__provider">
                                <div className="mp-modal__provider-avatar">
                                    {service.provider.avatarUrl ? (
                                        <img src={resolveAvatarUrl(service.provider.avatarUrl)} alt={service.provider.fullName}/>
                                    ) : (
                                        <span>{getInitials(service.provider.fullName)}</span>
                                    )}
                                </div>
                                <div className="mp-modal__provider-info">
                                    <span className="mp-modal__provider-name">{service.provider.fullName}</span>
                                    {service.provider.phone && (
                                        <a href={`tel:${service.provider.phone}`} className="mp-modal__provider-phone">
                                            <Phone size={13}/> {service.provider.phone}
                                        </a>
                                    )}
                                </div>
                            </div>

                            <button className="mp-modal__order-btn" onClick={() => setTab("order")}>
                                <Calendar size={16}/> Записаться
                            </button>
                        </div>
                    )}

                    {/* ─── Заказ ─── */}
                    {tab === "order" && (
                        <div className="mp-modal__order">
                            {orderSuccess ? (
                                <div className="mp-modal__success">
                                    <span className="mp-modal__success-icon">✅</span>
                                    <h3>Заказ оформлен!</h3>
                                    <p>Ожидайте подтверждения от исполнителя</p>
                                </div>
                            ) : (
                                <>
                                    <h3 className="mp-modal__form-title">Выберите дату и время</h3>

                                    {orderError && <p className="mp-modal__error">{orderError}</p>}

                                    <div className="mp-modal__form">
                                        <label className="mp-modal__label">Дата</label>
                                        <input
                                            className="mp-modal__input"
                                            type="date"
                                            value={scheduledDate}
                                            min={new Date().toISOString().split("T")[0]}
                                            onChange={e => setScheduledDate(e.target.value)}
                                        />

                                        <label className="mp-modal__label">Время</label>
                                        <input
                                            className="mp-modal__input"
                                            type="time"
                                            value={scheduledTime}
                                            onChange={e => setScheduledTime(e.target.value)}
                                        />

                                        <label className="mp-modal__label">Комментарий (необязательно)</label>
                                        <textarea
                                            className="mp-modal__textarea"
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            placeholder="Уточните детали..."
                                            rows={3}
                                        />

                                        <div className="mp-modal__order-summary">
                                            <span>Итого:</span>
                                            <span className="mp-modal__price">
                                                {service.price.toLocaleString("ru-RU")} ₽
                                            </span>
                                        </div>

                                        <button
                                            className="mp-modal__order-btn"
                                            onClick={handleOrder}
                                            disabled={orderLoading}
                                        >
                                            <Calendar size={16}/>
                                            {orderLoading ? "Оформляем..." : "Подтвердить заказ"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ─── Отзывы ─── */}
                    {tab === "reviews" && (
                        <div className="mp-modal__reviews">
                            {/* Форма отзыва */}
                            {!reviewSuccess ? (
                                <div className="mp-modal__review-form">
                                    <h3 className="mp-modal__form-title">Оставить отзыв</h3>

                                    {reviewError && <p className="mp-modal__error">{reviewError}</p>}

                                    <Stars
                                        rating={reviewRating}
                                        interactive
                                        onRate={setReviewRating}
                                    />

                                    <textarea
                                        className="mp-modal__textarea"
                                        value={reviewComment}
                                        onChange={e => setReviewComment(e.target.value)}
                                        placeholder="Расскажите о вашем опыте..."
                                        rows={3}
                                    />

                                    <button
                                        className="mp-modal__review-btn"
                                        onClick={handleReview}
                                        disabled={reviewLoading || reviewRating === 0}
                                    >
                                        <MessageCircle size={15}/>
                                        {reviewLoading ? "Отправляем..." : "Отправить отзыв"}
                                    </button>
                                </div>
                            ) : (
                                <div className="mp-modal__success mp-modal__success--small">
                                    ✅ Отзыв отправлен, спасибо!
                                </div>
                            )}

                            {/* Список отзывов */}
                            {service.reviews.length === 0 ? (
                                <p className="mp-modal__no-reviews">Отзывов пока нет</p>
                            ) : (
                                <ul className="mp-modal__review-list">
                                    {service.reviews.map(r => (
                                        <li key={r.id} className="mp-modal__review-item">
                                            <div className="mp-modal__review-header">
                                                <div className="mp-modal__review-avatar">
                                                    {r.resident.avatarUrl ? (
                                                        <img src={resolveAvatarUrl(r.resident.avatarUrl)} alt={r.resident.fullName}/>
                                                    ) : (
                                                        <span>{getInitials(r.resident.fullName)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="mp-modal__review-name">{r.resident.fullName}</span>
                                                    <Stars rating={r.rating}/>
                                                </div>
                                                <span className="mp-modal__review-date">
                                                    {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                                                </span>
                                            </div>
                                            {r.comment && (
                                                <p className="mp-modal__review-text">{r.comment}</p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}