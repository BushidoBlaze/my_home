import React from "react";
import "./MainTitle.css";

interface CustomTextProps {
    title: React.ReactNode;
    className?: string;
}

export default function MainTitle({title, className}: CustomTextProps) {
    return <h2 className={`main__title ${className || ""}`}>{title}</h2>
}