import {useState} from "react";
import type {FooterTechChipProps} from "../model/types.ts";

export default function TechChip({label, icon: Icon, color}: FooterTechChipProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <li
            className={`tech-chip ${hovered ? "tech-chip--hovered" : ""}`}
            style={hovered ? {color, borderColor: color} : {}}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Icon
                className={`tech-chip__icon ${hovered ? "tech-chip__icon--spin" : ""}`}
            />
            {label}
        </li>
    );
}