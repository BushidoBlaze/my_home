import {type Chat, type ChatDetails, type ChatMemberItem} from "@/api/chats.api.ts";
import {Camera, Copy, LogOut, RefreshCw, Save, Shield, UserPlus, Users, Volume2, VolumeX, X} from "lucide-react";


import type {PresenceMap} from "../model/types.ts";
import {getInitials} from "../lib/text.ts";
import {toApiFileUrl} from "../lib/url.ts";

type Props = {
    isOpen: boolean;
    activeChat: Chat | null;
    settingsLoading: boolean;
    setSettingsOpen: (v: boolean) => void;
    setMenuOpen: (v: boolean) => void;
    chatDetails: ChatDetails | null;
    groupName: string;
    setGroupName: (value: string) => void;
    groupDescription: string;
    setGroupDescription: (value: string) => void;
    canEditGroup: boolean;
    groupAvatarInputRef: React.RefObject<HTMLInputElement | null>;
    uploadGroupAvatar: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    settingsSaving: boolean;
    saveGroupSettings: () => Promise<void>;
    toggleMute: () => Promise<void>;
    inviteLink: string;
    copyInvite: () => Promise<void>;
    generateInvite: () => Promise<void>;
    newMemberEmail: string;
    setNewMemberEmail: (value: string) => void;
    addMember: () => Promise<void>;
    members: ChatMemberItem[];
    currentUserId: string;
    presence: PresenceMap;
    toggleRole: (member: ChatMemberItem) => Promise<void>;
    removeMember: (member: ChatMemberItem) => Promise<void>;
    leaveGroup: () => Promise<void>;
};

export function GroupSettingsModal(props: Props) {
    const {
        isOpen,
        activeChat,
        settingsLoading,
        setSettingsOpen,
        setMenuOpen,
        chatDetails,
        groupName,
        setGroupName,
        groupDescription,
        setGroupDescription,
        canEditGroup,
        groupAvatarInputRef,
        uploadGroupAvatar,
        settingsSaving,
        saveGroupSettings,
        toggleMute,
        inviteLink,
        copyInvite,
        generateInvite,
        newMemberEmail,
        setNewMemberEmail,
        addMember,
        members,
        currentUserId,
        presence,
        toggleRole,
        removeMember,
        leaveGroup,
    } = props;

    if (!isOpen || !activeChat) return null;

    const isDirectChat = activeChat.type === "Direct";
    const isAdmin = chatDetails?.currentUserRole === "Admin";

    function close() {
        setSettingsOpen(false);
        setMenuOpen(false);
    }

    return (
        <div className="chats__settings-backdrop" onClick={close}>
            <div className="chats__settings-modal" onClick={e => e.stopPropagation()}>

                {/* ── Hero header ── */}
                <div className="chats__sm-hero">
                    <div
                        className={`chats__sm-hero-avatar ${canEditGroup && !isDirectChat ? "chats__sm-hero-avatar--editable" : ""}`}
                        onClick={canEditGroup && !isDirectChat ? () => groupAvatarInputRef.current?.click() : undefined}
                        title={canEditGroup && !isDirectChat ? "Изменить фото группы" : undefined}
                    >
                        {activeChat.avatarUrl
                            ? <img src={toApiFileUrl(activeChat.avatarUrl)} alt={activeChat.name}/>
                            : <span>{getInitials(activeChat.name)}</span>
                        }
                        {canEditGroup && !isDirectChat && (
                            <div className="chats__sm-hero-avatar-overlay"><Camera size={14}/></div>
                        )}
                        <input
                            ref={groupAvatarInputRef}
                            type="file"
                            accept="image/*"
                            style={{display: "none"}}
                            onChange={e => void uploadGroupAvatar(e)}
                        />
                    </div>

                    <div className="chats__sm-hero-info">
                        <h3 className="chats__sm-hero-name">{activeChat.name}</h3>
                        <div className="chats__sm-hero-meta">
                            {isDirectChat ? "Личный чат" : `${members.length} участников`}
                            {isAdmin && !isDirectChat && (
                                <span className="chats__sm-hero-badge">
                                    <Shield size={10}/> Администратор
                                </span>
                            )}
                        </div>
                    </div>

                    <button className="chats__settings-close" onClick={close}>
                        <X size={18}/>
                    </button>
                </div>

                {settingsLoading ? (
                    <div className="chats__sm-loading">Загрузка данных...</div>
                ) : (
                    <div className={`chats__sm-body ${isDirectChat ? "chats__sm-body--single" : ""}`}>

                        {/* ── Left column: settings ── */}
                        <div className="chats__sm-col">

                            {/* Основное */}
                            <div className="chats__settings-section">
                                <div className="chats__settings-section-title">Основное</div>

                                <label className="chats__settings-label">
                                    Название
                                    <input
                                        className="chats__settings-input"
                                        value={groupName}
                                        onChange={e => setGroupName(e.target.value)}
                                        disabled={!canEditGroup}
                                    />
                                </label>

                                {!isDirectChat && (
                                    <label className="chats__settings-label">
                                        Описание
                                        <textarea
                                            className="chats__settings-textarea"
                                            value={groupDescription}
                                            onChange={e => setGroupDescription(e.target.value)}
                                            disabled={!canEditGroup}
                                            rows={3}
                                        />
                                    </label>
                                )}

                                <div className="chats__sm-row">
                                    <button
                                        className="chats__sm-btn chats__sm-btn--primary"
                                        onClick={() => void saveGroupSettings()}
                                        disabled={settingsSaving || !canEditGroup}
                                    >
                                        <Save size={14}/>
                                        {settingsSaving ? "Сохраняем..." : "Сохранить"}
                                    </button>

                                    <button
                                        className="chats__sm-btn"
                                        onClick={() => void toggleMute()}
                                    >
                                        {chatDetails?.isMuted
                                            ? <><Volume2 size={14}/> Включить звук</>
                                            : <><VolumeX size={14}/> Без звука</>
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* Ссылка-приглашение */}
                            {!isDirectChat && (
                                <div className="chats__settings-section">
                                    <div className="chats__settings-section-title">Ссылка-приглашение</div>

                                    <div className="chats__sm-invite-row">
                                        <input
                                            className="chats__settings-input"
                                            value={inviteLink}
                                            readOnly
                                            placeholder="Нет активной ссылки"
                                        />
                                        <button
                                            className="chats__sm-icon-btn"
                                            onClick={() => void copyInvite()}
                                            disabled={!inviteLink}
                                            title="Скопировать"
                                        >
                                            <Copy size={15}/>
                                        </button>
                                    </div>

                                    <button
                                        className="chats__sm-btn"
                                        style={{marginTop: 8}}
                                        onClick={() => void generateInvite()}
                                        disabled={!canEditGroup}
                                    >
                                        <RefreshCw size={13}/> Сгенерировать новую
                                    </button>
                                </div>
                            )}

                            {/* Добавить участника */}
                            {!isDirectChat && canEditGroup && (
                                <div className="chats__settings-section">
                                    <div className="chats__settings-section-title">
                                        Добавить участника
                                    </div>

                                    <div className="chats__sm-invite-row">
                                        <input
                                            className="chats__settings-input"
                                            value={newMemberEmail}
                                            onChange={e => setNewMemberEmail(e.target.value)}
                                            placeholder="Email пользователя"
                                            onKeyDown={e => e.key === "Enter" && void addMember()}
                                        />
                                        <button
                                            className="chats__sm-icon-btn chats__sm-icon-btn--primary"
                                            onClick={() => void addMember()}
                                            disabled={!newMemberEmail.trim()}
                                            title="Добавить"
                                        >
                                            <UserPlus size={15}/>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="chats__sm-footer">
                                <button
                                    className="chats__settings-leave"
                                    onClick={() => void leaveGroup()}
                                >
                                    <LogOut size={15}/>
                                    {isDirectChat ? "Скрыть чат" : "Покинуть группу"}
                                </button>
                            </div>
                        </div>

                        {/* ── Right column: members (group only) ── */}
                        {!isDirectChat && (
                            <div className="chats__sm-col chats__sm-col--members">
                                <div className="chats__sm-members-header">
                                    <span className="chats__sm-members-title">
                                        <Users size={14}/> Участники
                                    </span>
                                    <span className="chats__sm-members-count">{members.length}</span>
                                </div>

                                <div className="chats__members-list">
                                    {members.map(member => {
                                        const isMe = member.userId === currentUserId;
                                        const online = presence[member.userId]?.isOnline ?? false;

                                        return (
                                            <div key={member.id} className="chats__member-item">
                                                <div className="chats__member-left">
                                                    <div className="chats__sm-member-avatar-wrap">
                                                        <div className="chats__member-avatar">
                                                            {member.avatarUrl
                                                                ? <img src={toApiFileUrl(member.avatarUrl)} alt={member.fullName}/>
                                                                : <span>{getInitials(member.fullName)}</span>
                                                            }
                                                        </div>
                                                        <span className={`chats__sm-online-dot ${online ? "chats__sm-online-dot--on" : ""}`}/>
                                                    </div>

                                                    <div>
                                                        <div className="chats__member-name">
                                                            {member.fullName}
                                                            {isMe && <span className="chats__sm-you-tag">вы</span>}
                                                        </div>
                                                        <div className="chats__member-meta">{member.email}</div>
                                                    </div>
                                                </div>

                                                <div className="chats__member-right">
                                                    <span className={`chats__member-role ${member.role === "Admin" ? "chats__member-role--admin" : ""}`}>
                                                        {member.role === "Admin"
                                                            ? <><Shield size={11}/> Адм</>
                                                            : "Уч."
                                                        }
                                                    </span>

                                                    {canEditGroup && !isMe && (
                                                        <div className="chats__member-actions">
                                                            <button
                                                                className="chats__member-action"
                                                                onClick={() => void toggleRole(member)}
                                                                title={member.role === "Admin" ? "Убрать права" : "Назначить админом"}
                                                            >
                                                                <Shield size={13}/>
                                                            </button>
                                                            <button
                                                                className="chats__member-action chats__member-action--danger"
                                                                onClick={() => void removeMember(member)}
                                                                title="Удалить из группы"
                                                            >
                                                                <X size={13}/>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
