import type {ReactNode} from "react";
import "./SloganLabel.css";

interface SloganLabelProps {
    sloganText: ReactNode;
    className?: string;
}

export default function SloganLabel({sloganText, className}: SloganLabelProps) {
    return (
        /*data-reveal - data-атрибут, фича для хранения произвольных данных на элементе,*/
        /*используется в глобальном хуке useScrollReveal.ts для плавного скролла секции*/
        <div className="slogan-label" data-reveal>
            <h1 className={`slogan-label__text ${className || ""}`}>
                {sloganText}
            </h1>
        </div>
    )
}