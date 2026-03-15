import React from "react";
import "./CustomButton.css";

interface CustomButtonProps {
    text: string;
    className?: string;
    children?: React.ReactNode;
    onClick?: () => void;
}

export default function CustomButton({text, className, children, onClick}: CustomButtonProps) {
    return (
        <button className={`custom__button ${className || ""}`} onClick={onClick}>
            {text}
            {children}
        </button>
    );
}