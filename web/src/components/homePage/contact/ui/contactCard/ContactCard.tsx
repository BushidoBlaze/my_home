import ContactCardHeader from "./ContactCardHeader.tsx";
import ContactCardForm from "./ContactCardForm.tsx";
import "../Contact.css";

export default function ContactCard() {
    return (
        /*data-reveal - data-атрибут, фича для хранения произвольных данных на элементе,*/
        /*используется в глобальном хуке useScrollReveal.ts для плавного скролла секции*/
        <div className="contact-card" data-reveal>
            {/*Заголовок формы*/}
            <ContactCardHeader/>

            {/*Форма заполнения*/}
            <ContactCardForm/>
        </div>
    )
}