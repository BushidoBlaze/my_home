import {X} from "lucide-react";
import type {ServiceOrder} from "../model/types.ts";
import {ORDER_STATUS} from "../model/data.ts";
import {resolveAvatarUrl} from "@/apps/resident/_shared/lib/resolveAvatarUrl.ts";

interface Props {
    orders: ServiceOrder[];
    loading: boolean;
    onCancel: (id: string) => void;
    onClose: () => void;
}

export function OrderHistory({orders, loading, onCancel, onClose}: Props) {
    return (
        <div className="mp-modal-overlay" onClick={onClose}>
            <div className="mp-modal mp-modal--orders" onClick={e => e.stopPropagation()}>

                <div className="mp-modal__header">
                    <h2 className="mp-modal__title">Мои заказы</h2>
                    <button className="mp-modal__close" onClick={onClose}>
                        <X size={20}/>
                    </button>
                </div>

                <div className="mp-modal__body">
                    {loading && <p className="mp-orders__loading">Загрузка...</p>}

                    {!loading && orders.length === 0 && (
                        <div className="mp-orders__empty">
                            <span>📋</span>
                            <p>Заказов пока нет</p>
                        </div>
                    )}

                    <ul className="mp-orders__list">
                        {orders.map(order => {
                            const statusInfo = ORDER_STATUS[order.status] ?? {label: order.status, color: "pending"};

                            return (
                                <li key={order.id} className="mp-orders__item">
                                    {/* Фото услуги */}
                                    <div className="mp-orders__image">
                                        {order.service.imageUrl ? (
                                            <img src={resolveAvatarUrl(order.service.imageUrl)} alt={order.service.title}/>
                                        ) : (
                                            <div className="mp-orders__image-placeholder">📦</div>
                                        )}
                                    </div>

                                    <div className="mp-orders__info">
                                        <div className="mp-orders__top">
                                            <h3 className="mp-orders__title">{order.service.title}</h3>
                                            <span className={`mp-orders__status mp-orders__status--${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                        </div>

                                        <p className="mp-orders__provider">
                                            {order.service.provider.fullName}
                                        </p>

                                        <div className="mp-orders__meta">
                                            <span>📅 {new Date(order.scheduledAt).toLocaleString("ru-RU", {
                                                day: "2-digit",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}</span>
                                            <span className="mp-orders__price">
                                                {order.service.price.toLocaleString("ru-RU")} ₽
                                            </span>
                                        </div>

                                        {order.comment && (
                                            <p className="mp-orders__comment">💬 {order.comment}</p>
                                        )}

                                        {/* Отменить заказ */}
                                        {order.status !== "Done" && order.status !== "Cancelled" && (
                                            <button
                                                className="mp-orders__cancel"
                                                onClick={() => onCancel(order.id)}
                                            >
                                                Отменить
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}