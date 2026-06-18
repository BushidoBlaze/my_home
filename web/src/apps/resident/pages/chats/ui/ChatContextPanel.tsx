import {type Chat, type ChatDetails, type ChatMemberItem} from "@/api/chats.api.ts";
import {Bell, BellOff, Pin, Settings2, Users} from "lucide-react";

import type {ChatMessageUi, PresenceMap} from "../model/types.ts";
import {getChatFallback} from "../model/utils.ts";
import {toApiFileUrl} from "../lib/url.ts";
import {getInitials} from "../lib/text.ts";

type Props = {
    activeChat: Chat;
    chatDetails: ChatDetails | null;
    members: ChatMemberItem[];
    pinned: ChatMessageUi[];
    currentUserId: string;
    presence: PresenceMap;
    openSettings: () => void;
    setShowPinned: (v: boolean | ((prev: boolean) => boolean)) => void;
};

// Правая context-панель чата. Показывает профиль собеседника (личный чат)
// либо состав группы, плюс закреплённые сообщения и быстрые действия.
// Данные (chatDetails, members) подгружает useChatSettings при смене активного чата.
export function ChatContextPanel({
                                     activeChat,
                                     chatDetails,
                                     members,
                                     pinned,
                                     currentUserId,
                                     presence,
                                     openSettings,
                                     setShowPinned,
                                 }: Props) {
    const isDirect = activeChat.type === "Direct";
    const isMuted = chatDetails?.isMuted ?? activeChat.isMuted ?? false;

    // Для личного чата — собеседник, для группы — null. Нужен для онлайн-статуса.
    const otherMember = isDirect
        ? members.find(m => m.userId !== currentUserId) ?? null
        : null;

    const otherPresence = otherMember ? presence[otherMember.userId] : null;
    const isOnline = !!otherPresence?.isOnline;

    // Количество онлайн-участников в группе
    const onlineCount = !isDirect
        ? members.filter(m => presence[m.userId]?.isOnline).length
        : 0;

    return (
        <aside className="chats__context">

            {/* Профиль: аватар, имя, статус, быстрые действия */}
            <div className="chats__context-profile">
                <div className="chats__context-avatar">
                    {activeChat.avatarUrl ? (
                        <img src={toApiFileUrl(activeChat.avatarUrl)} alt={activeChat.name}/>
                    ) : (
                        getChatFallback(activeChat)
                    )}
                </div>
                <h3 className="chats__context-name">{activeChat.name}</h3>
                <div className="chats__context-status">
                    {isDirect ? (
                        <>
                            <span className={`chats__context-dot${isOnline ? " chats__context-dot--online" : ""}`}/>
                            {isOnline ? "в сети" : "не в сети"}
                        </>
                    ) : (
                        <>
                            <Users size={12}/>
                            {activeChat.membersCount} участников
                            {onlineCount > 0 && <span className="chats__context-status-online"> · {onlineCount} онлайн</span>}
                        </>
                    )}
                </div>

                <div className="chats__context-actions">
                    <button
                        className={`chats__context-action-btn${isMuted ? " chats__context-action-btn--active" : ""}`}
                        title={isMuted ? "Включить уведомления" : "Отключить уведомления"}
                        onClick={openSettings}
                    >
                        {isMuted ? <BellOff size={16}/> : <Bell size={16}/>}
                    </button>
                </div>
            </div>

            {/* Описание группы — только если задано */}
            {!isDirect && chatDetails?.description && (
                <section className="chats__context-section">
                    <h4 className="chats__context-section-title">О чате</h4>
                    <p className="chats__context-description">{chatDetails.description}</p>
                </section>
            )}

            {/* Закреплённые сообщения — превью + переход к полному списку */}
            {pinned.length > 0 && (
                <section className="chats__context-section">
                    <h4 className="chats__context-section-title">
                        <Pin size={12}/> Закреплённые · {pinned.length}
                    </h4>
                    <div className="chats__context-pinned-list">
                        {pinned.slice(0, 3).map(msg => (
                            <button
                                key={msg.id}
                                type="button"
                                className="chats__context-pinned-item"
                                onClick={() => setShowPinned(true)}
                            >
                                <span className="chats__context-pinned-sender">{msg.sender.fullName}</span>
                                <span className="chats__context-pinned-text">{msg.text || "Вложение"}</span>
                            </button>
                        ))}
                    </div>
                    {pinned.length > 3 && (
                        <button
                            type="button"
                            className="chats__context-show-all"
                            onClick={() => setShowPinned(true)}
                        >
                            Показать все →
                        </button>
                    )}
                </section>
            )}

            {/* Участники группы — первые 6, дальше «показать всех» открывает настройки */}
            {!isDirect && members.length > 0 && (
                <section className="chats__context-section">
                    <h4 className="chats__context-section-title">Участники · {members.length}</h4>
                    <div className="chats__context-members">
                        {members.slice(0, 6).map(member => {
                            const memberOnline = presence[member.userId]?.isOnline ?? false;
                            const isYou = member.userId === currentUserId;
                            return (
                                <div key={member.id} className="chats__context-member">
                                    <div className="chats__context-member-avatar">
                                        {member.avatarUrl ? (
                                            <img src={toApiFileUrl(member.avatarUrl)} alt={member.fullName}/>
                                        ) : (
                                            getInitials(member.fullName)
                                        )}
                                        {memberOnline && <span className="chats__context-member-online"/>}
                                    </div>
                                    <div className="chats__context-member-info">
                                        <div className="chats__context-member-name">
                                            {member.fullName}{isYou && <span className="chats__context-member-you"> (вы)</span>}
                                        </div>
                                        {member.role === "Admin" && (
                                            <div className="chats__context-member-role">админ</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {members.length > 6 && (
                        <button
                            type="button"
                            className="chats__context-show-all"
                            onClick={openSettings}
                        >
                            Показать всех →
                        </button>
                    )}
                </section>
            )}

            {/* Кнопка настроек чата — открывает существующую модалку */}
            <div className="chats__context-footer">
                <button type="button" className="chats__context-settings" onClick={openSettings}>
                    <Settings2 size={14}/>
                    {isDirect ? "Настройки" : "Управление группой"}
                </button>
            </div>
        </aside>
    );
}
