import {useLayoutEffect, useRef} from "react";
import type {ChangeEvent, KeyboardEvent, RefObject} from "react";
import {Edit3, Paperclip, Reply, SendHorizontal, X} from "lucide-react";

import type {ChatMessageUi} from "../../model/types.ts";

type Props = {
    replyTo: ChatMessageUi | null;
    setReplyTo: (msg: ChatMessageUi | null) => void;
    editingMessage: ChatMessageUi | null;
    cancelEdit: () => void;
    fileInputRef: RefObject<HTMLInputElement | null>;
    handleFileInputChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
    text: string;
    setText: (value: string) => void;
    handleTyping: () => void;
    handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLElement>) => Promise<void>;
    setDragActive: (value: boolean) => void;
    handleSend: () => Promise<void>;
    composerDisabled: boolean;
};

export function ChatInput({
                              replyTo,
                              setReplyTo,
                              editingMessage,
                              cancelEdit,
                              fileInputRef,
                              handleFileInputChange,
                              text,
                              setText,
                              handleTyping,
                              handleKeyDown,
                              handleDrop,
                              setDragActive,
                              handleSend,
                              composerDisabled,
                          }: Props) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Авто-рост высоты textarea по содержимому — поведение как в Telegram.
    // Высоту сбрасываем в auto, чтобы scrollHeight давал актуальное значение,
    // потом подставляем его обратно. Потолок задан CSS через max-height.
    useLayoutEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [text]);

    return (
        <div className="chats__input-area">
            {replyTo && (
                <div className="chats__reply-bar">
                    <div className="chats__reply-bar-content">
                        <Reply size={14}/>
                        <div>
                            <span className="chats__reply-bar-name">{replyTo.sender.fullName}</span>
                            <span className="chats__reply-bar-text">{replyTo.text}</span>
                        </div>
                    </div>
                    <button className="chats__reply-bar-close" onClick={() => setReplyTo(null)}>
                        <X size={16}/>
                    </button>
                </div>
            )}

            {editingMessage && (
                <div className="chats__editing-banner">
                    <Edit3 size={14}/>
                    Редактирование сообщения
                    <button onClick={cancelEdit}>
                        <X size={14}/>
                    </button>
                </div>
            )}

            <div className="chats__input-row">
                <button className="chats__input-btn" onClick={() => fileInputRef.current?.click()}
                        title="Прикрепить файл" disabled={composerDisabled}>
                    <Paperclip size={20}/>
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    style={{display: "none"}}
                    onChange={(e) => void handleFileInputChange(e)}
                />

                <textarea
                    ref={textareaRef}
                    className="chats__input"
                    value={text}
                    onChange={e => {
                        setText(e.target.value);
                        handleTyping();
                    }}
                    onKeyDown={handleKeyDown}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                    }}
                    onDrop={(e) => void handleDrop(e)}
                    placeholder={editingMessage ? "Редактировать сообщение..." : "Написать сообщение..."}
                    rows={1}
                    disabled={composerDisabled}
                />

                <button
                    className={`chats__send-btn ${text.trim() ? "chats__send-btn--active" : ""}`}
                    onClick={() => void handleSend()}
                    disabled={!text.trim() || composerDisabled}
                >
                    <SendHorizontal size={20}/>
                </button>
            </div>
        </div>
    );
}
