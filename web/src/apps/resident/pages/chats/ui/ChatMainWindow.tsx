import {type Chat} from "@/api/chats.api.ts";
import type {ChangeEvent, KeyboardEvent, RefObject} from "react";
import {Pin} from "lucide-react";


import type {ChatMessageUi, MediaDraft, PresenceMap} from "../model/types.ts";
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
    recordingMode: "voice" | "video" | null;
    stopRecording: () => void;
    mediaDraft: MediaDraft | null;
    sendDraftMedia: () => Promise<void>;
    cancelDraftMedia: () => void;
    fileInputRef: RefObject<HTMLInputElement | null>;
    handleFileInputChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleTyping: () => void;
    handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLElement>) => Promise<void>;
    startRecording: (mode: "voice" | "video") => Promise<void>;
    composerDisabled: boolean;
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
        recordingMode,
        stopRecording,
        mediaDraft,
        sendDraftMedia,
        cancelDraftMedia,
        fileInputRef,
        handleFileInputChange,
        handleTyping,
        handleKeyDown,
        handleDrop,
        startRecording,
        composerDisabled,
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
            />

            {showPinned && pinned.length > 0 && (
                <div className="chats__pinned">
                    <div className="chats__pinned-header">
                        <Pin size={14}/> Закреплённые сообщения
                    </div>
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
                recordingMode={recordingMode}
                stopRecording={stopRecording}
                mediaDraft={mediaDraft}
                sendDraftMedia={sendDraftMedia}
                cancelDraftMedia={cancelDraftMedia}
                fileInputRef={fileInputRef}
                handleFileInputChange={handleFileInputChange}
                text={text}
                setText={setText}
                handleTyping={handleTyping}
                handleKeyDown={handleKeyDown}
                handleDrop={handleDrop}
                setDragActive={setDragActive}
                startRecording={startRecording}
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
