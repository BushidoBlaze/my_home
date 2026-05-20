import type {JSX} from "react";
import {Filter, Columns3, List, Calendar} from "lucide-react";
import {FILTER_TABS} from "../model/data.ts";

export type TicketsView = "kanban" | "list" | "calendar";

interface FilterBarProps {
    activeTab?: string;
    view: TicketsView;
    onViewChange: (view: TicketsView) => void;
}

export default function FilterBar({activeTab = "all", view, onViewChange}: FilterBarProps): JSX.Element {
    const viewBtnClass = (target: TicketsView) =>
        "btn btn--sm" + (view === target ? "" : " btn--ghost");
    const viewBtnStyle = (target: TicketsView) =>
        view === target ? {background: "#f1f5f9"} : undefined;

    return (
        <div className="filter-bar">
            <div className="filter-bar__tabs">
                {FILTER_TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={"filter-bar__tab" + (tab.id === activeTab ? " filter-bar__tab--active" : "")}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="filter-bar__divider"/>
            <div className="filter-bar__filters">
                <button className="btn btn--sm"><Filter size={12}/> Дом</button>
                <button className="btn btn--sm">Тип</button>
                <button className="btn btn--sm">Исполнитель</button>
                <button className="btn btn--sm">Период · май</button>
                <span className="filter-bar__more">+ ещё</span>
            </div>
            <div className="filter-bar__views">
                <button
                    className={viewBtnClass("kanban")}
                    style={viewBtnStyle("kanban")}
                    onClick={() => onViewChange("kanban")}
                    aria-label="Kanban"
                >
                    <Columns3 size={13}/>
                </button>
                <button
                    className={viewBtnClass("list")}
                    style={viewBtnStyle("list")}
                    onClick={() => onViewChange("list")}
                    aria-label="List"
                >
                    <List size={13}/>
                </button>
                <button
                    className={viewBtnClass("calendar")}
                    style={viewBtnStyle("calendar")}
                    onClick={() => onViewChange("calendar")}
                    aria-label="Calendar"
                >
                    <Calendar size={13}/>
                </button>
            </div>
        </div>
    );
}
