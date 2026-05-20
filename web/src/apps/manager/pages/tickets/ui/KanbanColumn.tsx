import type {JSX} from "react";
import {MoreHorizontal, Plus} from "lucide-react";
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
                <button className="btn btn--icon btn--sm btn--ghost">
                    <MoreHorizontal size={13}/>
                </button>
            </div>

            {column.sub && <div className="kanban-col__sub">{column.sub}</div>}

            <div className="kanban-col__body">
                {column.tickets.map(t => (
                    <KanbanCard key={t.id} ticket={t}/>
                ))}
                <button className="kanban-col__add">
                    <Plus size={12}/> Добавить
                </button>
            </div>
        </div>
    );
}
