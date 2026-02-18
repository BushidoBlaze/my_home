import React from "react";
import "./CustomBackgroundIcon.css";

interface CustomBackgroundIconProps {
    icon: React.ElementType;
    className?: string;
}

export default function CustomBackgroundIcon({icon: BackgroundIcon, className}: CustomBackgroundIconProps) {
    return <BackgroundIcon className={`custom__background-icon ${className || ""}`}/>
}