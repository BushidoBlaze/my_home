import {SERVICE_MANAGEMENT_CONTENT} from "../model/data.ts";
import {ServiceManagementCard} from "./ServiceManagementCard.tsx";
import MainTitle from "@/shared/ui/mainTitle/MainTitle.tsx";
import "./ServiceManagement.css";

export default function ServiceManagementSection() {
    return (
        <div className="service-management">
            <MainTitle title="Управление сервисом"/>

            <article className="service-management__cards">
                {SERVICE_MANAGEMENT_CONTENT.map((item) => (
                    <ServiceManagementCard key={item.id} {...item} />
                ))}
            </article>
        </div>
    );
}
