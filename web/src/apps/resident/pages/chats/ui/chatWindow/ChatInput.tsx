import type {ChangeEvent, KeyboardEvent, RefObject} from "react";
import {Edit3, Mic, MicOff, Paperclip, Reply, Send, Video, X} from "lucide-react";

import type {ChatMessageUi, MediaDraft} from "../../model/types.ts";

type Props = {
    replyTo: ChatMessageUi | null;
    setReplyTo: (msg: ChatMessageUi | null) => void;
    editingMessage: ChatMessageUi | null;
    cancelEdit: () => void;
    recordingMode: "voice" | "video" | null;
    stopRecording: () => void;
    mediaDraft: MediaDraft | null;
    sendDraftMedia: () => Promise<void>;
    cancelDraftMedia: () => void;
    fileInputRef: RefObject<HTMLInputElement | null>;
    handleFileInputChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
    text: string;
    setText: (value: string) => void;
    handleTyping: () => void;
    handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLElement>) => Promise<void>;
    setDragActive: (value: boolean) => void;
    startRecording: (mode: "voice" | "video") => Promise<void>;
    handleSend: () => Promise<void>;
    composerDisabled: boolean;
};

export function ChatInput({
                              replyTo,
                              setReplyTo,
                              editingMessage,
                              cancelEdit,
                              recordingMode,
                              stopRecording,
                              mediaDraft,
                              sendDraftMedia,
                              cancelDraftMedia,
                              fileInputRef,
                              handleFileInputChange,
                              text,
                              setText,
                              handleTyping,
                              handleKeyDown,
                              handleDrop,
                              setDragActive,
                              startRecording,
                              handleSend,
                              composerDisabled,
                          }: Props) {
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

            {recordingMode && (
                <div className="chats__recording-bar">
                    <span className="chats__recording-dot"/>
                    <span>Запись {recordingMode === "voice" ? "голосового" : "видео"} сообщения...</span>
                    <button onClick={stopRecording}>
                        <MicOff size={14}/> Остановить
                    </button>
                </div>
            )}

            {mediaDraft && (
                <div className="chats__recording-bar">
                    <span>{mediaDraft.mode === "voice" ? "Предпросмотр голосового" : "Предпросмотр видео"}</span>
                    {mediaDraft.mode === "voice"
                        ? <audio className="chats__media" controls src={mediaDraft.previewUrl}/>
                        : <video className="chats__media" controls src={mediaDraft.previewUrl}/>}
                    <div className="chats__recording-actions">
                        <button onClick={() => void sendDraftMedia()}>
                            <Send size={14}/> Отправить
                        </button>
                        <button onClick={cancelDraftMedia}>
                            <X size={14}/> Отмена
                        </button>
                    </div>
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

                <div className="chats__input-tools">
                    <button
                        className="chats__input-btn"
                        onClick={() => void (recordingMode === "voice" ? stopRecording() : startRecording("voice"))}
                        title="Голосовое сообщение"
                        disabled={composerDisabled}
                    >
                        {recordingMode === "voice" ? <MicOff size={20}/> : <Mic size={20}/>}
                    </button>

                    <button
                        className="chats__input-btn"
                        onClick={() => void (recordingMode === "video" ? stopRecording() : startRecording("video"))}
                        title="Видео сообщение"
                        disabled={composerDisabled}
                    >
                        {recordingMode === "video" ? <MicOff size={20}/> : <Video size={20}/>}
                    </button>
                </div>

                <button
                    className={`chats__send-btn ${text.trim() ? "chats__send-btn--active" : ""}`}
                    onClick={() => void handleSend()}
                    disabled={!text.trim() || composerDisabled}
                >
                    <Send size={20}/>
                </button>
            </div>
        </div>
    );
}
