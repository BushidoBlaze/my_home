import "./MainTitle.css";

interface CustomTextProps {
    title: string;
    className?: string;
}

export default function MainTitle({title, className}: CustomTextProps) {
    return <h2 className={`main__title ${className || ""}`}>{title}</h2>
}