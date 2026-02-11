import "./CustomTitle.css";

interface CustomTextProps {
    title: string;
    className?: string;
}

export default function CustomTitle({title, className}: CustomTextProps) {
    return <h2 className={`custom__title ${className || ""}`}>{title}</h2>
}