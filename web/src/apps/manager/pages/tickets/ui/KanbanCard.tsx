import type {JSX} from "react";
import {Link} from "react-router-dom";
import type {Ticket} from "../model/types.ts";
import {KANBAN_TYPES} from "../model/data.ts";

interface KanbanCardProps {
    ticket: Ticket;
}

export default function KanbanCard({ticket}: KanbanCardProps): JSX.Element {
    const type = KANBAN_TYPES[ticket.type];
    const TypeIcon = type.icon;

    const borderLeft =
        ticket.priority === "high" ? "3px solid #ef4444"
            : ticket.priority === "med" ? "3px solid #f59e0b"
                : "1px solid #e2e8f0";

    return (
        <Link
            to={`/manager/tickets/${ticket.realId}`}
            className="kanban-card"
            style={{borderLeft, display: "block", textDecoration: "none", color: "inherit"}}
        >
            <div className="kanban-card__head">
                <span className="mono kanban-card__id">{ticket.id}</span>
                <div className="kanban-card__badges">
                    {ticket.priority === "high" && (
                        <span className="chip chip--danger kanban-card__chip">АВАРИЯ</span>
                    )}
                    {ticket.sla && (
                        <span className={"chip kanban-card__chip" + (ticket.slaTone ? " chip--" + ticket.slaTone : "")}>
                            {ticket.sla}
                        </span>
                    )}
                </div>
            </div>

            <div className="kanban-card__body">
                <div className="kanban-card__type" style={{background: type.bg, color: type.fg}}>
                    <TypeIcon size={14}/>
                </div>
                <div className="kanban-card__text">
                    <div className="kanban-card__title">{ticket.title}</div>
                    <div className="kanban-card__addr">{ticket.addr}</div>
                </div>
            </div>
        </Link>
    );
}
