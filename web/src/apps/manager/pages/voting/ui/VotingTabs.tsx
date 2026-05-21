import type {JSX} from "react";
import {Filter} from "lucide-react";
import {toast} from "sonner";

export type VotingTab = "active" | "drafts" | "archive";

interface VotingTabsProps {
    active: VotingTab;
    onChange: (tab: VotingTab) => void;
    counts: {active: number; drafts: number; archive: number};
}

const TABS: {id: VotingTab; label: string}[] = [
    {id: "active", label: "Активные"},
    {id: "drafts", label: "Черновики"},
    {id: "archive", label: "Архив"},
];

export default function VotingTabs({active, onChange, counts}: VotingTabsProps): JSX.Element {
    const filterToast = () => toast("Расширенные фильтры скоро будут", {description: "Сейчас можно фильтровать только по вкладкам."});

    return (
        <div className="vote-tabs">
            {TABS.map(t => {
                const isActive = active === t.id;
                const count = counts[t.id];
                return (
                    <button
                        key={t.id}
                        className={"btn btn--sm" + (isActive ? " vote-tabs__active" : " btn--ghost")}
                        onClick={() => onChange(t.id)}
                    >
                        {t.label} · {count}
                    </button>
                );
            })}
            <span className="vote-tabs__spacer"/>
            <button className="btn btn--sm btn--ghost" onClick={filterToast}>Дом</button>
            <button className="btn btn--sm btn--ghost" onClick={filterToast}>Тип</button>
            <button className="btn btn--sm btn--ghost btn--icon" onClick={filterToast} aria-label="Фильтр">
                <Filter size={12}/>
            </button>
        </div>
    );
}
