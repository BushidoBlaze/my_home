import type {ServiceManagementDetailProps} from "../model/types.ts";
import {SquareArrowOutUpRight} from "lucide-react";
import "./ServiceManagement.css";

interface DetailsListProps {
    details: ServiceManagementDetailProps[];
    isOpen: boolean;
    onOpen: (index: number) => void;
}

export default function DetailsList({details, isOpen, onOpen}: DetailsListProps) {
    return (
        <div className={`service-management__content ${isOpen ? "is-hidden" : ""}`}>
            <ul className="service-management__list">
                {details.map((item, index) => (
                    <li key={item.id}>
                        <div
                            className="service-management__list-item"
                            onClick={() => onOpen(index)}
                        >
                            {item.title}
                            <SquareArrowOutUpRight size={16} strokeWidth={0.75} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
