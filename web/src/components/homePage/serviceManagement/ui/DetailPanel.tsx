import type {ServiceManagementDetailProps} from "../model/types.ts";
import "./ServiceManagement.css";

interface DetailPanelProps {
    isOpen: boolean;
    item: ServiceManagementDetailProps | null;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

export default function DetailPanel({isOpen, item, onClose, onNext, onPrev}: DetailPanelProps) {
    return (
        <div
            className={`service-management__detail-panel ${
                isOpen ? "open" : ""
            }`}
        >
            {item && (
                <div className="service-management__detail-body">
                    <div className="service-management__detail-header">
                        <h4 className="service-management__detail-title">
                            {item.title}
                        </h4>
                        <p className="service-management__detail-description">
                            {item.detail}
                        </p>
                    </div>

                    <div className="service-management__detail-navigation">
                        <button
                            onClick={onPrev}
                            className="service-management__detail-switch-button">
                            Назад
                        </button>

                        <button
                            onClick={onNext}
                            className="service-management__detail-switch-button">
                            Далее
                        </button>

                        <button
                            onClick={onClose}
                            className="service-management__detail-close">
                            Закрыть
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}