import {CONTACT_CARD} from "../../model/data.ts";
import "../Contact.css";

export default function ContactCardForm() {
    return (
        <form className="contact-card__form">
            {CONTACT_CARD.map((item) => {
                return (
                    <input
                        type={item.type}
                        placeholder={item.placeholder}
                        required={item.required}
                        className={item.className}
                        pattern={item.pattern}
                    />
                );
            })}

            <textarea
                placeholder="Ваш вопрос*"
                required
                className="contact-card__textarea"
            />

            <div className="contact-card__controllers">
                <button
                    type="submit"
                    className="contact-card__button"
                >
                    Отправить
                </button>

                <button
                    type="reset"
                    className="contact-card__button"
                >
                    Отмена
                </button>
            </div>

            <p className="contact-card__note">
                * — обязательные поля
            </p>
        </form>
    )
}