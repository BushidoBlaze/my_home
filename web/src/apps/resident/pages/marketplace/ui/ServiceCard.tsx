import {Star, ShoppingCart, Shapes} from "lucide-react";
import type { MarketplaceService } from "../model/types.ts";
import { CATEGORIES } from "../model/data.ts";
import { resolveAvatarUrl } from "@/apps/resident/_shared/lib/resolveAvatarUrl.ts";

interface Props {
    service: MarketplaceService;
    onOpen: (id: string) => void;
}

// Возвращаем объект категории
function getCategory(id: string) {
    return CATEGORIES.find((c) => c.id === id);
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
    const category = getCategory(service.category);
    // Иконка категории — у каждой своя; для неизвестной (старые данные) берём «Прочее».
    const CategoryIcon = category?.icon ?? Shapes;
    const categoryLabel = category?.label ?? service.category;

    return (
        <div className="mp-card" onClick={() => onOpen(service.id)}>
            <div className="mp-card__image">
                {service.imageUrl ? (
                    <img src={resolveAvatarUrl(service.imageUrl)} alt={service.title} />
                ) : (
                    <div className="mp-card__image-placeholder">Нет фото</div>
                )}
            </div>

            <div className="mp-card__body">
                <span className="mp-card__category">
                    <CategoryIcon size={14}/> {categoryLabel}
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