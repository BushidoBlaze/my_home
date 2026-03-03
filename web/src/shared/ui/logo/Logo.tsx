import {BsHouseCheck} from "react-icons/bs";
import "./Logo.css";

export default function Logo() {
    return (
        <div className="logo">
            <BsHouseCheck className="logo-icon"/>
            <span className="logo-text">
                Мой Дом
            </span>
        </div>
    )
}