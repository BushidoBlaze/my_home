import {type Chat} from "@/api/chats.api.ts";
import type {ChangeEvent, KeyboardEvent, RefObject} from "react";
import {Pin} from "lucide-react";


import type {ChatMessageUi, PresenceMap} from "../model/types.ts";
import {ChatHeader} from "./chatWindow/ChatHeader.tsx";
import {MessageList} from "./chatWindow/MessageList.tsx";
import {ChatInput} from "./chatWindow/ChatInput.tsx";

type Props = {
    activeChat: Chat;
    dragActive: boolean;
    setDragActive: (value: boolean) => void;
    openSettings: () => void;
    showSearch: boolean;
    setShowSearch: (v: boolean | ((prev: boolean) => boolean)) => void;
    showPinned: boolean;
    setShowPinned: (v: boolean | ((prev: boolean) => boolean)) => void;
    pinned: ChatMessageUi[];
    search: string;
    setSearch: (value: string) => void;
    loadingMore: boolean;
    messagesLoading: boolean;
    searchLoading: boolean;
    filteredMessages: ChatMessageUi[];
    currentUserId: string;
    replyTo: ChatMessageUi | null;
    setReplyTo: (msg: ChatMessageUi | null) => void;
    messages: ChatMessageUi[];
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
    bottomRef: RefObject<HTMLDivElement | null>;
    messagesRef: RefObject<HTMLDivElement | null>;
    fileInputRef: RefObject<HTMLInputElement | null>;
    handleFileInputChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleTyping: () => void;
    handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLElement>) => Promise<void>;
    composerDisabled: boolean;
    contextOpen: boolean;
    onToggleContext: () => void;
};

export function ChatMainWindow(props: Props) {
    const {
        activeChat,
        dragActive,
        setDragActive,
        openSettings,
        showSearch,
        setShowSearch,
        showPinned,
        setShowPinned,
        pinned,
        search,
        setSearch,
        loadingMore,
        messagesLoading,
        searchLoading,
        filteredMessages,
        currentUserId,
        replyTo,
        setReplyTo,
        messages,
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
        bottomRef,
        messagesRef,
        fileInputRef,
        handleFileInputChange,
        handleTyping,
        handleKeyDown,
        handleDrop,
        composerDisabled,
        contextOpen,
        onToggleContext,
    } = props;

    return (
        <div
            className={`chats__window ${dragActive ? "chats__window--drag" : ""}`}
            onDrop={handleDrop}
            onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
        >
            <ChatHeader
                activeChat={activeChat}
                openSettings={openSettings}
                showSearch={showSearch}
                setShowSearch={setShowSearch}
                showPinned={showPinned}
                setShowPinned={setShowPinned}
                pinned={pinned}
                search={search}
                setSearch={setSearch}
                contextOpen={contextOpen}
                onToggleContext={onToggleContext}
            />

            {/* Telegram-стиль: всегда показываем последний пин одной строкой.
                Клик скроллит к этому сообщению с короткой подсветкой. */}
            {pinned.length > 0 && (() => {
                const latest = pinned[pinned.length - 1];

                const jumpToPinned = () => {
                    const el = document.getElementById(`msg-${latest.id}`);
                    if (!el) return;

                    el.scrollIntoView({behavior: "smooth", block: "center"});

                    // Кратковременная подсветка, чтобы взгляд легко нашёл сообщение
                    el.classList.add("chats__msg-highlight");
                    window.setTimeout(() => {
                        el.classList.remove("chats__msg-highlight");
                    }, 1600);
                };

                return (
                    <button
                        type="button"
                        className="chats__pinned-bar"
                        onClick={jumpToPinned}
                        title="Перейти к закреплённому"
                    >
                        <Pin size={14} className="chats__pinned-bar-icon"/>
                        <div className="chats__pinned-bar-info">
                            <span className="chats__pinned-bar-label">
                                Закреплённое
                                {pinned.length > 1 && ` · ${pinned.length}`}
                            </span>
                            <span className="chats__pinned-bar-text">
                                {latest.text || "Вложение"}
                            </span>
                        </div>
                    </button>
                );
            })()}

            {/* Расширенный список — открывается по клику на бар или иконку пина в шапке */}
            {showPinned && pinned.length > 1 && (
                <div className="chats__pinned">
                    {pinned.map(msg => (
                        <div key={msg.id} className="chats__pinned-item">
                            <span className="chats__pinned-sender">{msg.sender.fullName}:</span>
                            <span className="chats__pinned-text">{msg.text}</span>
                        </div>
                    ))}
                </div>
            )}

            <MessageList
                filteredMessages={filteredMessages}
                messages={messages}
                loadingMore={loadingMore}
                messagesLoading={messagesLoading}
                searchLoading={searchLoading}
                currentUserId={currentUserId}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                presence={presence}
                editingMessage={editingMessage}
                text={text}
                setText={setText}
                handleSend={handleSend}
                cancelEdit={cancelEdit}
                handleReaction={handleReaction}
                handlePin={handlePin}
                startEdit={startEdit}
                isAdmin={isAdmin}
                canManageMessages={canManageMessages}
                canPinMessages={canPinMessages}
                handleDelete={handleDelete}
                emojiPicker={emojiPicker}
                setEmojiPicker={setEmojiPicker}
                typingUser={typingUser}
                messagesRef={messagesRef}
                bottomRef={bottomRef}
            />

            <ChatInput
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                editingMessage={editingMessage}
                cancelEdit={cancelEdit}
                fileInputRef={fileInputRef}
                handleFileInputChange={handleFileInputChange}
                text={text}
                setText={setText}
                handleTyping={handleTyping}
                handleKeyDown={handleKeyDown}
                handleDrop={handleDrop}
                setDragActive={setDragActive}
                handleSend={handleSend}
                composerDisabled={composerDisabled}
            />

            {dragActive && (
                <div className="chats__drop-overlay">
                    Отпустите файл, чтобы отправить
                </div>
            )}
        </div>
    );
}
