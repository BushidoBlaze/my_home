import type {ServiceManagementContentProps} from "../model/types.ts";
import "./ServiceManagement.css";

export default function CardHeader({title, description, button}: ServiceManagementContentProps) {
    return (
        <div className="service-management-card__header">
            <div className="service-management-card__content">
                <h3 className="service-management-card__title">{title}</h3>
                <p className="service-management-card__description">{description}</p>
            </div>

            {button && (
                <button.component
                    text={button.text}
                    className={button.className}
                />
            )}
        </div>
    );
}
