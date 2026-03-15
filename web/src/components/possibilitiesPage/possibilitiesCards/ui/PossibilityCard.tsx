import type {PossibilityCardProps} from "../model/type.ts";

export default function PossibilityCard({icon: Icon, title, description, tag}: PossibilityCardProps) {
    return (
        <div className="possibility-card">
            <div className="possibility-card__top">
                {/* Иконка*/}
                <div className="possibility-card__icon-wrap">
                    <Icon
                        className="possibility-card__icon"
                        size={22}
                        strokeWidth={1.5}
                    />
                </div>

                <span className={`possibility-card__tag ${tag === "УК" ? "possibility-card__tag--uk" : ""}`}>
                    {tag}
                </span>
            </div>
            <h3 className="possibility-card__title">{title}</h3>
            <p className="possibility-card__description">{description}</p>
        </div>
    );
}