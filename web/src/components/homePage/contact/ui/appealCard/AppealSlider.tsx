import {useState} from "react";
import {APPEAL_CONTENT} from "../../model/data.ts";
import DecorativeAppealCard from "./DecorativeAppealCard.tsx";
import "./AppealSection.css";

export default function AppealSlider() {
    const [index, setIndex] = useState(0);
    const [isLeaving, setIsLeaving] = useState(false);

    //
    const handleComplete = () => {
        setIsLeaving(true);

        setTimeout(() => {
            setIndex((prev) => (prev + 1) % APPEAL_CONTENT.length);
            setIsLeaving(false);
        }, 900); // время анимации ухода
    };

    return (
        <div className="appeal-slider">
            <div className={`slider-window ${isLeaving ? "leave" : ""}`}>
                <DecorativeAppealCard
                    key={index}
                    content={APPEAL_CONTENT[index]}
                    onComplete={handleComplete}
                />
            </div>
        </div>
    );
}