import CustomTitle from "@/shared/ui/customTitle/CustomTitle.tsx";
import CustomDescription from "@/shared/ui/customText/CustomDescription.tsx";
import "../Contact.css";

export default function ContactCardHeader() {
    return (
        <div className="contact-card__header">
            <CustomTitle
                title="Обратная связь"
                className="contact-card__title"
            />

            <CustomDescription
                description="Напишите нам и мы пришлём вам письмо с ответом на указанный Email"
                className="contact-card__description"
            />
        </div>
    )
}