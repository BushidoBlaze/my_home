import {useState, type JSX} from "react";
import {Upload, Plus} from "lucide-react";
import TopBar from "@/widgets/topBar/ui/TopBar.tsx";
import FilterBar, {type TicketsView} from "./ui/FilterBar.tsx";
import KanbanColumn from "./ui/KanbanColumn.tsx";
import KanbanCard from "./ui/KanbanCard.tsx";
import {KANBAN_COLUMNS} from "./model/data.ts";
import "./Tickets.css";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function Tickets(): JSX.Element {
    const [view, setView] = useState<TicketsView>("kanban");

    return (
        <>
            <TopBar
                title="Заявки"
                subtitle="189 в работе · 6 аварий · 11 SLA-рисков"
                action={
                    <>
                        <button className="btn"><Upload size={13}/> Импорт</button>
                        <button className="btn btn--primary">
                            <Plus size={13}/> Создать заявку
                        </button>
                    </>
                }
            />

            <FilterBar activeTab="all" view={view} onViewChange={setView}/>

            {view === "kanban" && (
                <div className="kanban-board">
                    {KANBAN_COLUMNS.map((col, i) => (
                        <KanbanColumn key={i} column={col}/>
                    ))}
                </div>
            )}

            {view === "list" && (
                <div className="kanban-board kanban-board--list">
                    {KANBAN_COLUMNS.map((col, i) => (
                        <div key={i} className="kanban-list__group">
                            <div className="kanban-list__head">
                                <span className="kanban-col__dot" style={{background: col.tone}}/>
                                <span className="kanban-col__title">{col.title}</span>
                                <span className="kanban-col__count">· {col.count}</span>
                            </div>
                            <div className="kanban-list__items">
                                {col.tickets.map(t => (
                                    <KanbanCard key={t.id} ticket={t}/>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {view === "calendar" && (
                <div className="kanban-board kanban-board--calendar">
                    {WEEKDAYS.map((day, dayIdx) => {
                        const dayTickets = KANBAN_COLUMNS.flatMap(c => c.tickets)
                            .filter((_, i) => i % 7 === dayIdx);
                        return (
                            <div key={day} className="kanban-cal__day">
                                <div className="kanban-cal__head">
                                    <span className="kanban-cal__weekday">{day}</span>
                                    <span className="kanban-cal__count">{dayTickets.length}</span>
                                </div>
                                <div className="kanban-cal__items">
                                    {dayTickets.map(t => (
                                        <KanbanCard key={t.id} ticket={t}/>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
