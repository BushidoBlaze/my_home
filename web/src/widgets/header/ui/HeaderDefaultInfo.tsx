import {useNavigate} from "react-router";

export default function HeaderDefaultInfo() {
    const navigate = useNavigate();

    return (
        <div className="header__controls">
            <span className="header__phone">7 902 664-93-93</span>
            <button
                type="button"
                className="header__login-button"
                onClick={() => navigate("/login")}
            >
                Попробовать бесплатно
            </button>
        </div>
    )
}