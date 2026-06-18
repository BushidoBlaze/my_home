import type {JSX} from "react";
import KanbanCard from "./KanbanCard.tsx";
import type {KanbanColumn as KanbanColumnData} from "../model/types.ts";

interface KanbanColumnProps {
    column: KanbanColumnData;
}

export default function KanbanColumn({column}: KanbanColumnProps): JSX.Element {
    return (
        <div className="kanban-col">
            <div className="kanban-col__head">
                <div className="kanban-col__title-wrap">
                    <span className="kanban-col__dot" style={{background: column.tone}}/>
                    <span className="kanban-col__title">{column.title}</span>
                    <span className="kanban-col__count">· {column.count}</span>
                </div>
            </div>

            {column.sub && <div className="kanban-col__sub">{column.sub}</div>}

            <div className="kanban-col__body">
                {column.tickets.map(t => (
                    <KanbanCard key={t.id} ticket={t}/>
                ))}
                {column.tickets.length === 0 && (
                    <div className="kanban-col__empty">Нет заявок</div>
                )}
            </div>
        </div>
    );
}
