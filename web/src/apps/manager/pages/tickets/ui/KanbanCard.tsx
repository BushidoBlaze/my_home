import type {JSX} from "react";
import {Paperclip, MessageCircle} from "lucide-react";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
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
        <div className="kanban-card" style={{borderLeft}}>
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

            <div className="kanban-card__foot">
                {ticket.assignee ? (
                    <div className="kanban-card__assignee">
                        <Avatar name={ticket.assignee} size={20}/>
                        <span>{ticket.assignee}</span>
                    </div>
                ) : (
                    <span className="kanban-card__assignee-empty">+ исполнитель</span>
                )}
                <div className="kanban-card__meta">
                    {ticket.attachments > 0 && (
                        <span className="kanban-card__meta-item">
                            <Paperclip size={11}/>
                            {ticket.attachments}
                        </span>
                    )}
                    {ticket.comments > 0 && (
                        <span className="kanban-card__meta-item">
                            <MessageCircle size={11}/>
                            {ticket.comments}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
