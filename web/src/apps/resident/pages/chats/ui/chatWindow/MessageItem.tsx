import {Check, CheckCheck, Edit3, Pin, Reply, Save, Smile, Trash2, X} from "lucide-react";

import type {ChatMessageUi} from "../../model/types.ts";
import {formatTime} from "../../lib/date.ts";
import {isAudioFile, isMediaFile, isVideoFile} from "../../lib/files.ts";
import {getInitials} from "../../lib/text.ts";
import {toApiFileUrl} from "../../lib/url.ts";
import {EMOJIS} from "../../data/constants.ts";

type Props = {
    msg: ChatMessageUi;
    isOwn: boolean;
    isAdmin: boolean;
    canManageMessages: boolean;
    canPinMessages: boolean;
    replyMsg?: ChatMessageUi;
    online: boolean;
    editingMessage: ChatMessageUi | null;
    text: string;
    setText: (value: string) => void;
    handleSend: () => Promise<void>;
    cancelEdit: () => void;
    handleReaction: (messageId: string, emoji: string) => Promise<void>;
    handlePin: (messageId: string) => Promise<void>;
    setReplyTo: (msg: ChatMessageUi | null) => void;
    startEdit: (msg: ChatMessageUi) => void;
    handleDelete: (messageId: string) => Promise<void>;
    emojiPicker: string | null;
    setEmojiPicker: (value: string | null) => void;
};

export function MessageItem({
                                msg,
                                isOwn,
                                isAdmin,
                                canManageMessages,
                                canPinMessages,
                                replyMsg,
                                online,
                                editingMessage,
                                text,
                                setText,
                                handleSend,
                                cancelEdit,
                                handleReaction,
                                handlePin,
                                setReplyTo,
                                startEdit,
                                handleDelete,
                                emojiPicker,
                                setEmojiPicker,
                            }: Props) {
    const reactions = msg.reactions ?? [];

    return (
        <div className={`chats__msg ${isOwn ? "chats__msg--own" : ""} ${msg.isPinned ? "chats__msg--pinned" : ""}`}>
            {!isOwn && (
                <div className="chats__msg-avatar">
                    {msg.sender.avatarUrl ? (
                        <img src={toApiFileUrl(msg.sender.avatarUrl)} alt={msg.sender.fullName}/>
                    ) : (
                        <span>{getInitials(msg.sender.fullName)}</span>
                    )}
                </div>
            )}

            <div className="chats__msg-body">
                {!isOwn && (
                    <span className="chats__msg-sender">
                        {msg.sender.fullName}
                        <span
                            className={`chats__presence-dot ${online ? "chats__presence-dot--online" : "chats__presence-dot--offline"}`}/>
                    </span>
                )}

                {replyMsg && (
                    <div className="chats__msg-reply">
                        <span className="chats__msg-reply-name">{replyMsg.sender.fullName}</span>
                        <span className="chats__msg-reply-text">{replyMsg.text}</span>
                    </div>
                )}

                <div className="chats__msg-bubble">
                    {msg.isPinned && <Pin size={12} className="chats__msg-pin-icon"/>}

                    {editingMessage?.id === msg.id ? (
                        <div className="chats__msg-editing">
                            <textarea className="chats__msg-edit-input" value={text}
                                      onChange={e => setText(e.target.value)} rows={3}/>
                            <div className="chats__msg-edit-actions">
                                <button className="chats__msg-edit-btn" onClick={() => void handleSend()}>
                                    <Save size={14}/> Сохранить
                                </button>
                                <button className="chats__msg-edit-btn chats__msg-edit-btn--ghost" onClick={cancelEdit}>
                                    <X size={14}/> Отмена
                                </button>
                            </div>
                        </div>
                    ) : isVideoFile(msg.fileName, msg.fileUrl) ? (
                        <video className="chats__media" controls src={toApiFileUrl(msg.fileUrl)}/>
                    ) : isAudioFile(msg.fileName, msg.fileUrl) ? (
                        <audio className="chats__media" controls src={toApiFileUrl(msg.fileUrl)}/>
                    ) : isMediaFile(msg.fileName, msg.fileUrl) ? (
                        <img className="chats__media-image" src={toApiFileUrl(msg.fileUrl)}
                             alt={msg.fileName ?? "media"}/>
                    ) : (
                        <p className="chats__msg-text">{msg.text}</p>
                    )}

                    <div className="chats__msg-meta">
                        <span className="chats__msg-time">{formatTime(msg.createdAt)}</span>
                        {isOwn && (
                            (msg.isRead ?? false)
                                ? <CheckCheck size={14} className="chats__msg-read"/>
                                : <Check size={14} className="chats__msg-read"/>
                        )}
                    </div>
                </div>

                {reactions.length > 0 && (
                    <div className="chats__msg-reactions">
                        {reactions.map(r => (
                            <button key={r.emoji} className="chats__reaction"
                                    onClick={() => void handleReaction(msg.id, r.emoji)}>
                                {r.emoji} {r.count}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className={`chats__msg-actions ${isOwn ? "chats__msg-actions--own" : ""}`}>
                <button className="chats__msg-action" onClick={() => setReplyTo(msg)} title="Ответить">
                    <Reply size={14}/>
                </button>
                <button className="chats__msg-action"
                        onClick={() => setEmojiPicker(emojiPicker === msg.id ? null : msg.id)} title="Реакция">
                    <Smile size={14}/>
                </button>
                {canPinMessages && (
                    <button className="chats__msg-action" onClick={() => void handlePin(msg.id)} title="Закрепить">
                        <Pin size={14}/>
                    </button>
                )}

                {isOwn && canManageMessages && (
                    <button className="chats__msg-action" onClick={() => startEdit(msg)} title="Редактировать">
                        <Edit3 size={14}/>
                    </button>
                )}

                {(isOwn || isAdmin) && canManageMessages && (
                    <button className="chats__msg-action chats__msg-action--danger"
                            onClick={() => void handleDelete(msg.id)} title="Удалить">
                        <Trash2 size={14}/>
                    </button>
                )}

                {emojiPicker === msg.id && (
                    <div className="chats__emoji-picker">
                        {EMOJIS.map(emoji => (
                            <button key={emoji} className="chats__emoji-btn"
                                    onClick={() => void handleReaction(msg.id, emoji)}>
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
