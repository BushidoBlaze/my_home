import ContactCardHeader from "./ContactCardHeader.tsx";
import ContactCardForm from "./ContactCardForm.tsx";
import "../Contact.css";

export default function ContactCard() {
    return (
        <div className="contact-card">
            {/*Заголовок формы*/}
            <ContactCardHeader/>

            {/*Форма заполнения*/}
            <ContactCardForm/>
        </div>
    )
}