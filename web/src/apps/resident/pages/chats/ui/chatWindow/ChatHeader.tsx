import {type Chat} from "@/api/chats.api.ts";
import {MoreVertical, Phone, Pin, Search, Video, X} from "lucide-react";


import type {ChatMessageUi} from "../../model/types.ts";
import {getChatFallback} from "../../model/utils.ts";
import {toApiFileUrl} from "../../lib/url.ts";

type Props = {
    activeChat: Chat;
    openSettings: () => void;
    showSearch: boolean;
    setShowSearch: (v: boolean | ((prev: boolean) => boolean)) => void;
    showPinned: boolean;
    setShowPinned: (v: boolean | ((prev: boolean) => boolean)) => void;
    pinned: ChatMessageUi[];
    search: string;
    setSearch: (value: string) => void;
};

export function ChatHeader({
                               activeChat,
                               openSettings,
                               setShowSearch,
                               setShowPinned,
                               pinned,
                               showSearch,
                               search,
                               setSearch,
                           }: Props) {
    return (
        <>
            <div className="chats__header">
                <div
                    className="chats__header-left chats__header-left--clickable"
                    onClick={() => activeChat.type !== "Direct" && openSettings()}
                    title={activeChat.type === "Direct" ? "" : "Открыть меню группы"}
                >
                    <div className="chats__header-avatar">
                        {activeChat.avatarUrl ? (
                            <img src={toApiFileUrl(activeChat.avatarUrl)} alt={activeChat.name}/>
                        ) : (
                            getChatFallback(activeChat)
                        )}
                    </div>
                    <div>
                        <div className="chats__header-title-row">
                            <h3 className="chats__header-name">{activeChat.name}</h3>
                            {activeChat.type !== "Direct" && (
                                <button
                                    className="chats__header-name-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openSettings();
                                    }}
                                    title="Открыть меню"
                                >
                                    <MoreVertical size={16}/>
                                </button>
                            )}
                        </div>
                        <span className="chats__header-members">{activeChat.membersCount} участников</span>
                    </div>
                </div>

                <div className="chats__header-actions">
                    <button className="chats__header-btn" onClick={() => setShowSearch(v => !v)} title="Поиск">
                        <Search size={18}/>
                    </button>
                    <button className="chats__header-btn" onClick={() => setShowPinned(v => !v)} title="Закреплённые">
                        <Pin size={18}/>
                        {pinned.length > 0 && <span className="chats__header-badge">{pinned.length}</span>}
                    </button>
                    <button className="chats__header-btn" title="Голосовой звонок">
                        <Phone size={18}/>
                    </button>
                    <button className="chats__header-btn" title="Видеозвонок">
                        <Video size={18}/>
                    </button>
                </div>
            </div>

            {showSearch && (
                <div className="chats__search">
                    <Search size={16} className="chats__search-icon"/>
                    <input
                        className="chats__search-input"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Поиск по сообщениям..."
                        autoFocus
                    />
                    {search && (
                        <button onClick={() => setSearch("")}>
                            <X size={16}/>
                        </button>
                    )}
                </div>
            )}
        </>
    );
}
