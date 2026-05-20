import ContactCard from "./contactCard/ContactCard.tsx";
import AppealSlider from "./appealCard/AppealSlider.tsx";
import "./Contact.css";

import backgroundVideo from "@/shared/assets/video/video-1.mp4";

export default function ContactSection() {
    return (
        <div className="contact-section">
            {/*Фоновое видео*/}
            <video
                className="background-video"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src={backgroundVideo} type="video/mp4"/>
            </video>

            {/*Контактная форма*/}
            <ContactCard/>

            {/*UI-элемент переписки в виде вертикального слайдера*/}
            <AppealSlider/>
        </div>
    )
}