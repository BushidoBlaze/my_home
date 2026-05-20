import type {JSX} from "react";
import {Phone, MessageCircle, Users, CheckCircle2, X} from "lucide-react";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import {ACTIVE_CONTACT, PROFILE_ROWS, OPEN_TICKETS, HISTORY} from "../model/data.ts";

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function ChatContext({open, onClose}: Props): JSX.Element {
    return (
        <aside className={"chat-context" + (open ? "" : " chat-context--closed")}>
            <div className="chat-context__hero">
                <button
                    className="btn btn--icon btn--sm btn--ghost chat-context__close"
                    onClick={onClose}
                    title="Закрыть"
                >
                    <X size={14}/>
                </button>
                <Avatar name={ACTIVE_CONTACT.name} size={64}/>
                <div className="chat-context__name">{ACTIVE_CONTACT.name}</div>
                <div className="chat-context__addr">{ACTIVE_CONTACT.addr}</div>
                <div className="chat-context__hero-actions">
                    <button className="btn btn--icon btn--sm">
                        <Phone size={16}/>
                    </button>
                    <button className="btn btn--icon btn--sm">
                        <MessageCircle size={16}/>
                    </button>
                    <button className="btn btn--icon btn--sm">
                        <Users size={16}/>
                    </button>
                </div>
            </div>

            <div className="chat-context__section">
                <div className="t-eyebrow chat-context__section-title">Личное дело</div>
                <div className="chat-context__profile">
                    {PROFILE_ROWS.map((p, i) => (
                        <div key={i} className="chat-context__profile-row">
                            <span className="chat-context__profile-key">{p.k}</span>
                            <span
                                className="chat-context__profile-val"
                                style={{
                                    color: p.tone === "ok" ? "#047857" : "#0f172a",
                                    fontWeight: p.tone ? 600 : 400,
                                }}
                            >
                                {p.v}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-context__section chat-context__section--border">
                <div className="t-eyebrow chat-context__section-title">Открытые заявки · 1</div>
                {OPEN_TICKETS.map(t => {
                    const TicketIcon = t.icon;
                    return (
                        <div key={t.id} className="chat-context__ticket">
                            <div
                                className="chat-context__ticket-icon"
                                style={{background: t.iconBg, color: t.iconFg}}
                            >
                                <TicketIcon size={15}/>
                            </div>
                            <div className="chat-context__ticket-main">
                                <div className="chat-context__ticket-title">{t.title}</div>
                                <div className="chat-context__ticket-meta">{t.assignee}</div>
                            </div>
                            <span className="chip chip--danger chat-context__ticket-chip">SLA</span>
                        </div>
                    );
                })}
            </div>

            <div className="chat-context__section chat-context__section--border">
                <div className="t-eyebrow chat-context__section-title">История · 4 за год</div>
                <div className="chat-context__history">
                    {HISTORY.map((h, i) => (
                        <div key={i} className="chat-context__history-item">
                            <CheckCircle2 size={13} style={{color: h.tone}}/>
                            <span className="mono chat-context__history-id">{h.id}</span>
                            <span className="chat-context__history-title">{h.title}</span>
                            <span className="chat-context__history-date">{h.date}</span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
