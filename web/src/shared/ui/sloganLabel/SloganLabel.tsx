import "./SloganLabel.css";

interface SloganLabelProps {
    sloganText: string;
    className?: string;
}

export default function SloganLabel({sloganText, className}: SloganLabelProps) {
    return (
        <div className="slogan-label">
            <h1 className={`slogan-label__text ${className || ""}`}>
                {sloganText}
            </h1>
        </div>
    )
}