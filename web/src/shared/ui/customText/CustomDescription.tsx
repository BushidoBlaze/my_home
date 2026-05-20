import type {ReactNode} from "react";
import "./CustomDescription.css";

interface CustomDescriptionProps {
    description: ReactNode;
    className?: string;
}

export default function CustomDescription({description, className}: CustomDescriptionProps) {
    return <p className={`custom__description ${className || ""}`}>{description}</p>
}