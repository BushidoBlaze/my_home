import PossibilityCard from './PossibilityCard.tsx';
import CustomTitle from "@/shared/ui/customTitle/CustomTitle.tsx";
import {POSSIBILITIES_CARDS} from "../model/data.ts";
import "./PossibilitiesCards.css";

export default function PossibilitiesCards() {
    return (
        <div className="possibilities-cards" data-reveal>
            <CustomTitle title="Возможности" className="possibilities-cards__title"/>

            <div className="possibilities-cards__grid">
                {POSSIBILITIES_CARDS.map((card, index) => (
                    <PossibilityCard key={index} {...card} />
                ))}
            </div>
        </div>
    );
}