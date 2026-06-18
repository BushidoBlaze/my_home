import type {RefObject} from "react";
import {MessageSquarePlus} from "lucide-react";

import type {ChatMessageUi, PresenceMap} from "../../model/types.ts";
import {formatDate} from "../../lib/date.ts";
import {shouldShowDateDivider} from "../../model/message.model.ts";
import {MessageItem} from "./MessageItem.tsx";

type Props = {
    filteredMessages: ChatMessageUi[];
    messages: ChatMessageUi[];
    loadingMore: boolean;
    messagesLoading: boolean;
    searchLoading: boolean;
    currentUserId: string;
    replyTo: ChatMessageUi | null;
    setReplyTo: (msg: ChatMessageUi | null) => void;
    presence: PresenceMap;
    editingMessage: ChatMessageUi | null;
    text: string;
    setText: (value: string) => void;
    handleSend: () => Promise<void>;
    cancelEdit: () => void;
    handleReaction: (messageId: string, emoji: string) => Promise<void>;
    handlePin: (messageId: string) => Promise<void>;
    startEdit: (msg: ChatMessageUi) => void;
    isAdmin: boolean;
    canManageMessages: boolean;
    canPinMessages: boolean;
    handleDelete: (messageId: string) => Promise<void>;
    emojiPicker: string | null;
    setEmojiPicker: (value: string | null) => void;
    typingUser: string | null;
    messagesRef: RefObject<HTMLDivElement | null>;
    bottomRef: RefObject<HTMLDivElement | null>;
};

export function MessageList({
                                filteredMessages,
                                messages,
                                loadingMore,
                                messagesLoading,
                                searchLoading,
                                currentUserId,
                                replyTo,
                                setReplyTo,
                                presence,
                                editingMessage,
                                text,
                                setText,
                                handleSend,
                                cancelEdit,
                                handleReaction,
                                handlePin,
                                startEdit,
                                isAdmin,
                                canManageMessages,
                                canPinMessages,
                                handleDelete,
                                emojiPicker,
                                setEmojiPicker,
                                typingUser,
                                messagesRef,
                                bottomRef,
                            }: Props) {
    // Пустое состояние: сообщений ещё нет и сейчас ничего не подгружается
    const showEmptyState =
        !messagesLoading && !loadingMore && !searchLoading && filteredMessages.length === 0;

    return (
        <div className="chats__messages" ref={messagesRef}>
            {loadingMore && <div className="chats__loading">Загрузка старых сообщений...</div>}
            {messagesLoading && <div className="chats__loading">Загрузка сообщений...</div>}
            {searchLoading && <div className="chats__loading">Поиск по истории...</div>}

            {showEmptyState && (
                <div className="chats__empty-card">
                    {/* Декоративные мягкие кольца за иконкой */}
                    <div className="chats__empty-card-glow"/>

                    <div className="chats__empty-card-icon">
                        <MessageSquarePlus size={26} strokeWidth={1.6}/>
                    </div>

                    <h3 className="chats__empty-card-title">Здесь пока ничего нет</h3>
                    <p className="chats__empty-card-text">
                        Отправьте сообщение, чтобы начать диалог
                    </p>
                </div>
            )}

            {filteredMessages.map((msg, i) => {
                const isOwn = msg.sender.id === currentUserId;
                const replyMsg = replyTo?.id === msg.id ? undefined : messages.find(m => m.id === msg.replyToId);
                const online = presence[msg.sender.id]?.isOnline ?? false;

                return (
                    <div key={msg.id} id={`msg-${msg.id}`}>
                        {shouldShowDateDivider(filteredMessages, i) && (
                            <div className="chats__date-divider">
                                <span>{formatDate(msg.createdAt)}</span>
                            </div>
                        )}

                        <MessageItem
                            msg={msg}
                            isOwn={isOwn}
                            isAdmin={isAdmin}
                            canManageMessages={canManageMessages}
                            canPinMessages={canPinMessages}
                            replyMsg={replyMsg}
                            online={online}
                            editingMessage={editingMessage}
                            text={text}
                            setText={setText}
                            handleSend={handleSend}
                            cancelEdit={cancelEdit}
                            handleReaction={handleReaction}
                            handlePin={handlePin}
                            setReplyTo={setReplyTo}
                            startEdit={startEdit}
                            handleDelete={handleDelete}
                            emojiPicker={emojiPicker}
                            setEmojiPicker={setEmojiPicker}
                        />
                    </div>
                );
            })}

            {typingUser && (
                <div className="chats__typing">
                    <div className="chats__typing-dots">
                        <span/><span/><span/>
                    </div>
                    <span>{typingUser} печатает</span>
                </div>
            )}
            <div ref={bottomRef}/>
        </div>
    );
}
