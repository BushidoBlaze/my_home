import type {JSX} from "react";
import {MoreHorizontal, Search, Users, PanelLeftClose, PanelLeftOpen} from "lucide-react";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import {CONVERSATIONS} from "../model/data.ts";

interface Props {
    collapsed: boolean;
    onToggle: () => void;
}

export default function ChatList({collapsed, onToggle}: Props): JSX.Element {
    return (
        <section className={"chat-list" + (collapsed ? " chat-list--collapsed" : "")}>
            <div className="chat-list__head">
                {!collapsed && <span className="chat-list__title">Обращения</span>}
                {!collapsed && <span className="chip chip--danger chat-list__new">3 новых</span>}
                <button
                    className="btn btn--icon btn--sm btn--ghost chat-list__toggle"
                    onClick={onToggle}
                    title={collapsed ? "Развернуть список" : "Свернуть список"}
                >
                    {collapsed ? <PanelLeftOpen size={15}/> : <PanelLeftClose size={15}/>}
                </button>
                {!collapsed && (
                    <button className="btn btn--icon btn--sm btn--ghost">
                        <MoreHorizontal size={14}/>
                    </button>
                )}
            </div>

            {!collapsed && (
                <div className="chat-list__filters">
                    <div className="chat-list__search">
                        <Search size={13} style={{color: "#64748b"}}/>
                        <input
                            type="text"
                            className="chat-list__search-input"
                            placeholder="Поиск"
                        />
                    </div>
                    <div className="chat-list__tabs">
                        <button className="btn btn--sm chat-list__tab--active">Все</button>
                        <button className="btn btn--sm btn--ghost">Мои · 12</button>
                        <button className="btn btn--sm btn--ghost">Без ответа · 4</button>
                    </div>
                </div>
            )}

            <div className="chat-list__items">
                {CONVERSATIONS.map(c => (
                    <div
                        key={c.id}
                        className={"chat-item" + (c.selected ? " chat-item--selected" : "")}
                    >
                        {c.selected && !collapsed && <div className="chat-item__rail"/>}
                        <div className="chat-item__avatar">
                            {c.group ? (
                                <div className="chat-item__group-icon">
                                    <Users size={18}/>
                                </div>
                            ) : (
                                <Avatar name={c.name} size={38}/>
                            )}
                        </div>
                        {!collapsed && (
                            <div className="chat-item__main">
                                <div className="chat-item__top">
                                    <span className="chat-item__name">{c.name}</span>
                                    <span className="chat-item__time">{c.time}</span>
                                </div>
                                <div className="chat-item__addr">{c.addr}</div>
                                <div className="chat-item__last-row">
                                    <span
                                        className="chat-item__last"
                                        style={{
                                            color: c.unread > 0 ? "#0f172a" : "#64748b",
                                            fontWeight: c.unread > 0 ? 500 : 400,
                                        }}
                                    >
                                        {c.last}
                                    </span>
                                    {c.unread > 0 && (
                                        <span className="chat-item__unread">{c.unread}</span>
                                    )}
                                </div>
                                {c.tag && (
                                    <span className={"chip chat-item__tag chip--" + c.tag.tone}>
                                        {c.tag.label}
                                    </span>
                                )}
                            </div>
                        )}
                        {collapsed && c.unread > 0 && (
                            <span className="chat-item__unread chat-item__unread--dot"/>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
