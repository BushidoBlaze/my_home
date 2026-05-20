import {type ChatUserLookupItem} from "@/api/chats.api.ts";
import {Check, Search, UserPlus, Users, X} from "lucide-react";

import type {CreateChatMode} from "../model/types.ts";
import {getInitials} from "../lib/text.ts";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    createChatMode: CreateChatMode;
    setCreateChatMode: (mode: CreateChatMode) => void;
    createName: string;
    setCreateName: (value: string) => void;
    createDescription: string;
    setCreateDescription: (value: string) => void;
    userQuery: string;
    searchUsers: (query: string) => Promise<void>;
    selectedUsers: ChatUserLookupItem[];
    toggleSelectUser: (user: ChatUserLookupItem) => void;
    userResults: ChatUserLookupItem[];
    createLoading: boolean;
    createChat: () => Promise<void>;
};

export function CreateChatModal(props: Props) {
    const {
        isOpen,
        onClose,
        createChatMode,
        setCreateChatMode,
        createName,
        setCreateName,
        createDescription,
        setCreateDescription,
        userQuery,
        searchUsers,
        selectedUsers,
        toggleSelectUser,
        userResults,
        createLoading,
        createChat,
    } = props;

    if (!isOpen) return null;

    const canCreate = !createLoading
        && selectedUsers.length > 0
        && (createChatMode === "direct" || createName.trim().length > 0);

    return (
        <div className="chats__settings-backdrop" onClick={onClose}>
            <div className="chats__create-modal" onClick={e => e.stopPropagation()}>

                {/* ── Заголовок ── */}
                <div className="chats__create-header">
                    <div>
                        <h3 className="chats__create-title">Новый чат</h3>
                        <p className="chats__create-subtitle">Создайте группу или начните личный диалог</p>
                    </div>
                    <button className="chats__settings-close" onClick={onClose}>
                        <X size={18}/>
                    </button>
                </div>

                {/* ── Режим ── */}
                <div className="chats__create-tabs">
                    <button
                        className={`chats__create-tab ${createChatMode === "group" ? "chats__create-tab--active" : ""}`}
                        onClick={() => setCreateChatMode("group")}
                    >
                        <Users size={15}/> Группа
                    </button>
                    <button
                        className={`chats__create-tab ${createChatMode === "direct" ? "chats__create-tab--active" : ""}`}
                        onClick={() => {
                            setCreateChatMode("direct");
                            setCreateName("");
                            setCreateDescription("");
                        }}
                    >
                        <UserPlus size={15}/> Личный чат
                    </button>
                </div>

                <div className="chats__create-body">

                    {/* ── Инфо группы ── */}
                    {createChatMode === "group" && (
                        <div className="chats__settings-section">
                            <div className="chats__settings-section-title">О группе</div>

                            <label className="chats__settings-label">
                                Название
                                <input
                                    className="chats__settings-input"
                                    value={createName}
                                    onChange={e => setCreateName(e.target.value)}
                                    placeholder="Например: Жители 4 подъезда"
                                    autoFocus
                                />
                            </label>

                            <label className="chats__settings-label">
                                Описание <span className="chats__create-optional">необязательно</span>
                                <textarea
                                    className="chats__settings-textarea"
                                    rows={2}
                                    value={createDescription}
                                    onChange={e => setCreateDescription(e.target.value)}
                                    placeholder="Описание группы..."
                                />
                            </label>
                        </div>
                    )}

                    {/* ── Поиск участников ── */}
                    <div className="chats__settings-section">
                        <div className="chats__settings-section-title">
                            {createChatMode === "group" ? "Добавить участников" : "Выбрать собеседника"}
                        </div>

                        <div className="chats__create-search-wrap">
                            <Search size={14} className="chats__create-search-icon"/>
                            <input
                                className="chats__create-search-input"
                                placeholder="Имя или email..."
                                value={userQuery}
                                onChange={e => void searchUsers(e.target.value)}
                                autoFocus={createChatMode === "direct"}
                            />
                        </div>

                        {/* Выбранные участники */}
                        {selectedUsers.length > 0 && (
                            <div className="chats__user-pills">
                                {selectedUsers.map(u => (
                                    <button key={u.id} className="chats__pill" onClick={() => toggleSelectUser(u)}>
                                        <span className="chats__pill-avatar">{getInitials(u.fullName)}</span>
                                        {u.fullName}
                                        <X size={11}/>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Результаты поиска */}
                        {userResults.length > 0 && (
                            <div className="chats__create-results">
                                {userResults.map(user => {
                                    const selected = selectedUsers.some(s => s.id === user.id);
                                    return (
                                        <button
                                            key={user.id}
                                            className={`chats__create-result ${selected ? "chats__create-result--selected" : ""}`}
                                            onClick={() => toggleSelectUser(user)}
                                        >
                                            <div className="chats__create-result-avatar">
                                                {getInitials(user.fullName)}
                                            </div>
                                            <div className="chats__create-result-info">
                                                <span className="chats__create-result-name">{user.fullName}</span>
                                                <span className="chats__create-result-email">{user.email}</span>
                                            </div>
                                            {selected && <Check size={15} className="chats__create-result-check"/>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {userQuery.trim() && userResults.length === 0 && (
                            <p className="chats__create-no-results">Пользователи не найдены</p>
                        )}
                    </div>
                </div>

                {/* ── Кнопка создания ── */}
                <div className="chats__create-footer">
                    <button
                        className="chats__create-submit"
                        disabled={!canCreate}
                        onClick={() => void createChat()}
                    >
                        {createLoading
                            ? "Создание..."
                            : createChatMode === "group"
                                ? `Создать группу${selectedUsers.length > 0 ? ` · ${selectedUsers.length} уч.` : ""}`
                                : "Начать диалог"
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
