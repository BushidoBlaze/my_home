import "./CustomButton.css";

interface CustomButtonProps {
    text: string;
    className?: string;
}

export default function CustomButton({text, className}: CustomButtonProps) {
    return <button className={`custom__button ${className || ""}`}>{text}</button>
}