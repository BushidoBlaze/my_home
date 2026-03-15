import type {ReactNode} from "react";
import "./CustomTitle.css";

interface CustomTextProps {
    title: ReactNode;
    className?: string;
}

export default function CustomTitle({title, className}: CustomTextProps) {
    return <h2 className={`custom__title ${className || ""}`}>{title}</h2>
}