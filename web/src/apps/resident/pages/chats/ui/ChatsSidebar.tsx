import {type Chat} from "@/api/chats.api.ts";
import {useState} from "react";
import {MessageSquarePlus, PanelLeftClose, PanelLeftOpen, Plus, Search, UserPlus, Users} from "lucide-react";


import {getChatFallback} from "../model/utils.ts";
import {formatTime} from "../lib/date.ts";
import {toApiFileUrl} from "../lib/url.ts";

type Props = {
    visibleChats: Chat[];
    activeChat: Chat | null;
    setActiveChat: (chat: Chat) => void;
    unreadByChat: Record<string, number>;
    openCreateChat: (mode: "group" | "direct") => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
};

export function ChatsSidebar({visibleChats, activeChat, setActiveChat, unreadByChat, openCreateChat, collapsed, onToggleCollapse}: Props) {
    const [query, setQuery] = useState("");

    const filtered = query.trim()
        ? visibleChats.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
        : visibleChats;

    return (
        <aside className="chats__sidebar">
            {/* Заголовок */}
            <div className="chats__sidebar-header">
                <div className="chats__sidebar-header-left">
                    <h2 className="chats__sidebar-title">Чаты</h2>
                    {visibleChats.length > 0 && (
                        <span className="chats__sidebar-count">{visibleChats.length}</span>
                    )}
                </div>
                <div className="chats__sidebar-actions">
                    <button className="chats__header-btn" title="Новая группа" onClick={() => openCreateChat("group")}>
                        <Users size={15}/>
                        <Plus size={12}/>
                    </button>
                    <button className="chats__header-btn" title="Новый личный чат"
                            onClick={() => openCreateChat("direct")}>
                        <UserPlus size={16}/>
                    </button>
                    {/* Кнопка сворачивания сайдбара — при сворачивании остаётся только она */}
                    <button
                        className="chats__header-btn chats__sidebar-collapse-btn"
                        title={collapsed ? "Развернуть список чатов" : "Свернуть список чатов"}
                        onClick={onToggleCollapse}
                    >
                        {collapsed ? <PanelLeftOpen size={16}/> : <PanelLeftClose size={16}/>}
                    </button>
                </div>
            </div>

            {/* Поиск по чатам */}
            {visibleChats.length > 0 && (
                <div className="chats__sidebar-search">
                    <Search size={14} className="chats__sidebar-search-icon"/>
                    <input
                        className="chats__sidebar-search-input"
                        placeholder="Поиск..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
            )}

            {/* Список */}
            <ul className="chats__list">
                {filtered.length === 0 && visibleChats.length > 0 && (
                    <li className="chats__list-no-results">Чаты не найдены</li>
                )}

                {filtered.length === 0 && visibleChats.length === 0 && (
                    <li className="chats__sidebar-empty">
                        <div className="chats__sidebar-empty-icon">
                            <MessageSquarePlus size={28}/>
                        </div>
                        <p className="chats__sidebar-empty-title">Нет чатов</p>
                        <p className="chats__sidebar-empty-text">Создайте групповой чат или начните личный диалог</p>
                        <div className="chats__sidebar-empty-btns">
                            <button className="chats__sidebar-empty-btn" onClick={() => openCreateChat("group")}>
                                <Users size={14}/> Группа
                            </button>
                            <button className="chats__sidebar-empty-btn" onClick={() => openCreateChat("direct")}>
                                <UserPlus size={14}/> Диалог
                            </button>
                        </div>
                    </li>
                )}

                {filtered.map(chat => {
                    const unread = unreadByChat[chat.id] ?? 0;
                    const isActive = activeChat?.id === chat.id;

                    return (
                        <li
                            key={chat.id}
                            className={`chats__item ${isActive ? "chats__item--active" : ""}`}
                            onClick={() => setActiveChat(chat)}
                        >
                            <div className="chats__item-avatar-wrap">
                                <div className="chats__item-avatar">
                                    {chat.avatarUrl ? (
                                        <img src={toApiFileUrl(chat.avatarUrl)} alt={chat.name}/>
                                    ) : (
                                        <span>{getChatFallback(chat)}</span>
                                    )}
                                </div>
                                {/* В свёрнутом сайдбаре нет места под нижнюю строку,
                                    поэтому показываем бейдж в углу аватара */}
                                {collapsed && unread > 0 && (
                                    <span className="chats__item-unread chats__item-unread--corner">
                                        {unread > 99 ? "99+" : unread}
                                    </span>
                                )}
                            </div>

                            <div className="chats__item-info">
                                <div className="chats__item-top">
                                    <span className="chats__item-name">{chat.name}</span>
                                    {chat.lastMessage && (
                                        <span className="chats__item-time">
                                            {formatTime(chat.lastMessage.createdAt)}
                                        </span>
                                    )}
                                </div>
                                <div className="chats__item-bottom">
                                    <span className="chats__item-last">
                                        {chat.lastMessage
                                            ? `${chat.lastMessage.senderName}: ${chat.lastMessage.text}`
                                            : "Нет сообщений"}
                                    </span>
                                    {chat.type !== "Direct" && (
                                        <span className="chats__item-members">{chat.membersCount} уч.</span>
                                    )}
                                    {/* Telegram-стиль: бейдж непрочитанных справа в одну строку с превью */}
                                    {unread > 0 && (
                                        <span className="chats__item-unread">
                                            {unread > 99 ? "99+" : unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}