import {Star, ShoppingCart, Wrench} from "lucide-react";
import type { MarketplaceService } from "../model/types.ts";
import { CATEGORIES } from "../model/data.ts";

interface Props {
    service: MarketplaceService;
    onOpen: (id: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL ?? "";

// Возвращаем объект категории
function getCategory(id: string) {
    return CATEGORIES.find((c) => c.id === id);
}

// Возвращаем название категории
function getCategoryLabel(id: string) {
    return getCategory(id)?.label ?? id;
}

// Звезды рейтинга
function Stars({ rating }: { rating: number }) {
    return (
        <div className="mp-card__stars">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    size={13}
                    className={
                        i <= Math.round(rating)
                            ? "mp-card__star mp-card__star--filled"
                            : "mp-card__star"
                    }
                />
            ))}
        </div>
    );
}

export function ServiceCard({ service, onOpen }: Props) {
    return (
        <div className="mp-card" onClick={() => onOpen(service.id)}>
            <div className="mp-card__image">
                {service.imageUrl ? (
                    <img src={`${API_URL}${service.imageUrl}`} alt={service.title} />
                ) : (
                    <div className="mp-card__image-placeholder">
                        <Wrench size={20}/>
                    </div>
                )}
            </div>

            <div className="mp-card__body">
                <span className="mp-card__category">
                    <Wrench size={14}/> {getCategoryLabel(service.category)}
                </span>

                <h3 className="mp-card__title">{service.title}</h3>

                <p className="mp-card__desc">
                    {service.description.slice(0, 80)}
                    {service.description.length > 80 ? "..." : ""}
                </p>

                <div className="mp-card__rating">
                    <Stars rating={service.rating} />
                    <span className="mp-card__rating-value">{service.rating.toFixed(1)}</span>
                    <span className="mp-card__reviews">({service.reviewsCount})</span>
                </div>

                <div className="mp-card__footer">
          <span className="mp-card__price">
            {service.price.toLocaleString("ru-RU")} ₽
          </span>

                    <button className="mp-card__btn" type="button">
                        <ShoppingCart size={15} />
                        Заказать
                    </button>
                </div>
            </div>
        </div>
    );
}