import type {JSX} from "react";
import {Filter} from "lucide-react";

export default function VotingTabs(): JSX.Element {
    return (
        <div className="vote-tabs">
            <button className="btn btn--sm vote-tabs__active">Активные · 3</button>
            <button className="btn btn--sm btn--ghost">Черновики · 1</button>
            <button className="btn btn--sm btn--ghost">Архив · 12</button>
            <span className="vote-tabs__spacer"/>
            <button className="btn btn--sm btn--ghost">Дом</button>
            <button className="btn btn--sm btn--ghost">Тип</button>
            <button className="btn btn--sm btn--ghost btn--icon">
                <Filter size={12}/>
            </button>
        </div>
    );
}
