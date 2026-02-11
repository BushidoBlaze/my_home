import icon1 from "@/assets/images/icons/1.svg";
import icon2 from "@/assets/images/icons/2.svg";
import icon3 from "@/assets/images/icons/3.svg";
import icon4 from "@/assets/images/icons/4.svg";
import icon5 from "@/assets/images/icons/5.svg";
import icon6 from "@/assets/images/icons/6.svg";
import icon7 from "@/assets/images/icons/7.svg";

import "./CustomIcons.css";

interface CustomIconsProps {
    className?: string;
}

// массив путей к иконкам
const iconPaths = [
    icon1,
    icon2,
    icon3,
    icon4,
    icon5,
    icon6,
    icon7
];

// массив уникальных классов для каждой иконки
const iconClasses = [
    "custom__icon-1",
    "custom__icon-2",
    "custom__icon-3",
    "custom__icon-4",
    "custom__icon-5",
    "custom__icon-6",
    "custom__icon-7"
];

export default function CustomIcons({ className }: CustomIconsProps) {
    return (
        <>
            {iconPaths.map((path, index) => (
                <img
                    key={index}
                    src={path}
                    alt={`icon ${index + 1}`}
                    className={`custom__icon ${iconClasses[index]} ${className || ""}`}
                />
            ))}
        </>
    );
}