import {SERVICE_MANAGEMENT_CONTENT} from "../model/data.ts";
import {ServiceManagementCard} from "./ServiceManagementCard.tsx";
import MainTitle from "@/shared/ui/mainTitle/MainTitle.tsx";
import "./ServiceManagement.css";

export default function ServiceManagementSection() {
    return (
        /*data-reveal - data-атрибут, фича для хранения произвольных данных на элементе,*/
        /*используется в глобальном хуке useScrollReveal.ts для плавного скролла секции*/
        <div className="service-management" data-reveal>
            <MainTitle title="Управление сервисом"/>

            <article className="service-management__cards">
                {SERVICE_MANAGEMENT_CONTENT.map((item) => (
                    <ServiceManagementCard key={item.id} {...item} />
                ))}
            </article>
        </div>
    );
}
