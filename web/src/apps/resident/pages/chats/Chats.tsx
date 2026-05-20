import {chatsApi, type Chat, type ChatDetails, type ChatMemberItem, type ChatMessageItem, type ChatUserLookupItem} from "@/api/chats.api.ts";
import {useEffect, useRef, useState} from "react";
import {jwtDecode} from "jwt-decode";

import type {ChatMessageUi, CreateChatMode, PresenceMap} from "./model/types.ts";
import {useChatDerived} from "./hooks/useChatDerived.ts";
import {useGroupActions} from "./hooks/useGroupActions.ts";
import {useCreateChatActions} from "./hooks/useCreateChatActions.ts";
import {useChatConnection} from "./hooks/useChatConnection.ts";
import {useChatSettings} from "./hooks/useChatSettings.ts";
import {useMediaRecord} from "./hooks/useMediaRecord.ts";
import {useMessageActions} from "./hooks/useMessageActions.ts";
import {API_ORIGIN} from "./data/constants.ts";
import {ChatsSidebar} from "./ui/ChatsSidebar.tsx";
import {ChatsEmpty} from "./ui/ChatsEmpty.tsx";
import {ChatMainWindow} from "./ui/ChatMainWindow.tsx";
import {ChatSettingsModal} from "./ui/ChatSettingsModal.tsx";
import {CreateChatModal} from "./ui/CreateChatModal.tsx";

import "./Chats.css";

const CHAT_READ_STATE_KEY = "chatLastReadById";

function normalizeMessage(msg: ChatMessageItem): ChatMessageUi {
    return {
        ...msg,
        reactions: msg.reactions ?? [],
    };
}

type TokenPayload = {
    role?: string;
    sub?: string;
    nameid?: string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
};

export default function Chats() {
    const token = localStorage.getItem("token");
    const localRole = (localStorage.getItem("role") ?? "").toLowerCase();
    let tokenPayload: TokenPayload | null = null;

    if (token) {
        try {
            tokenPayload = jwtDecode<TokenPayload>(token);
        } catch {
            tokenPayload = null;
        }
    }

    const tokenRole = String(tokenPayload?.role ?? tokenPayload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? "").toLowerCase();
    const isPlatformAdmin = localRole === "admin" || localRole === "manager" || tokenRole === "admin" || tokenRole === "manager";
    const currentUserId = token
        ? String(tokenPayload?.nameid ?? tokenPayload?.sub ?? "")
        : "";

    const [chats, setChats] = useState<Chat[]>([]);
    const [lastReadByChat, setLastReadByChat] = useState<Record<string, string>>(() => {
        try {
            const raw = localStorage.getItem(CHAT_READ_STATE_KEY);
            if (!raw) return {};
            return JSON.parse(raw) as Record<string, string>;
        } catch {
            return {};
        }
    });
    const [unreadByChat, setUnreadByChat] = useState<Record<string, number>>({});
    const [activeChat, setActiveChat] = useState<Chat | null>(null);

    const [messages, setMessages] = useState<ChatMessageUi[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [text, setText] = useState("");
    const [replyTo, setReplyTo] = useState<ChatMessageUi | null>(null);
    const [editingMessage, setEditingMessage] = useState<ChatMessageUi | null>(null);

    const [pinned, setPinned] = useState<ChatMessageUi[]>([]);
    const [showPinned, setShowPinned] = useState(false);

    const [search, setSearch] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchedMessages, setSearchedMessages] = useState<ChatMessageUi[]>([]);
    const [showSearch, setShowSearch] = useState(false);

    const [emojiPicker, setEmojiPicker] = useState<string | null>(null);

    const [typingUser, setTypingUser] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesRef = useRef<HTMLDivElement>(null);
    const scrollAnchorRef = useRef<{ top: number; height: number } | null>(null);
    const lastMarkedReadMessageRef = useRef<string | null>(null);

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);
    const [members, setMembers] = useState<ChatMemberItem[]>([]);
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [inviteLink, setInviteLink] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    const [dragActive, setDragActive] = useState(false);

    const [presence, setPresence] = useState<PresenceMap>({});

    const [createChatOpen, setCreateChatOpen] = useState(false);
    const [createChatMode, setCreateChatMode] = useState<CreateChatMode>("group");
    const [createName, setCreateName] = useState("");
    const [createDescription, setCreateDescription] = useState("");
    const [userQuery, setUserQuery] = useState("");
    const [userResults, setUserResults] = useState<ChatUserLookupItem[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<ChatUserLookupItem[]>([]);
    const [createLoading, setCreateLoading] = useState(false);

    const groupAvatarInputRef = useRef<HTMLInputElement>(null);
    const messagesSnapshotRef = useRef<ChatMessageUi[]>([]);
    const latestLoadRequestIdRef = useRef(0);
    const latestSearchRequestIdRef = useRef(0);

    const isAdmin = (chatDetails?.currentUserRole ?? activeChat?.type) ? chatDetails?.currentUserRole === "Admin" : false;

    const {visibleChats, filteredMessages} = useChatDerived({
        chats,
        messages,
        search,
    });

    const {hubConnected, connectionRef, activeChatIdRef} = useChatConnection({
        apiOrigin: API_ORIGIN,
        currentUserId,
        setChats,
        setMessages,
        setPinned,
        getMessageById: (messageId: string) =>
            messagesSnapshotRef.current.find(m => m.id === messageId) ?? null,
        setTypingUser,
        setPresence,
    });

    const composerDisabled = !activeChat || !hubConnected;

    const {openSettings} = useChatSettings({
        settingsOpen,
        activeChat,
        setSettingsOpen,
        setMenuOpen,
        setSettingsLoading,
        setChatDetails,
        setMembers,
        setGroupName,
        setGroupDescription,
        setInviteLink,
    });

    async function loadMessages(chatId: string, nextPage = 1, append = false) {
        const requestId = ++latestLoadRequestIdRef.current;
        if (append) {
            setLoadingMore(true);
        } else {
            setMessagesLoading(true);
        }

        try {
            const [msgs, pinnedMsgs] = await Promise.all([
                chatsApi.getChatMessages(chatId, nextPage),
                nextPage === 1 ? chatsApi.getPinnedMessages(chatId) : Promise.resolve([])
            ]);

            const normalized = (msgs ?? []).map(normalizeMessage);
            const isStaleRequest =
                requestId !== latestLoadRequestIdRef.current ||
                activeChatIdRef.current !== chatId;
            if (isStaleRequest) return;

            if (append) {
                setMessages(prev => {
                    const ids = new Set(prev.map(item => item.id));
                    const uniqueOlder = normalized.filter(item => !ids.has(item.id));
                    return [...uniqueOlder, ...prev];
                });
            } else {
                setMessages(normalized);
            }

            if (nextPage === 1) {
                setPinned((pinnedMsgs ?? []).map(normalizeMessage));
            }

            setHasMore((msgs?.length ?? 0) >= 50);
            setPage(nextPage);
        } catch (error) {
            console.error(error);
        } finally {
            if (append) {
                setLoadingMore(false);
            } else {
                setMessagesLoading(false);
            }
        }
    }

    useEffect(() => {
        messagesSnapshotRef.current = messages;
    }, [messages]);

    useEffect(() => {
        localStorage.setItem(CHAT_READ_STATE_KEY, JSON.stringify(lastReadByChat));
    }, [lastReadByChat]);

    useEffect(() => {
        setUnreadByChat(() => {
            const next: Record<string, number> = {};
            for (const chat of chats) {
                const lastMessage = chat.lastMessage;
                if (!lastMessage) {
                    next[chat.id] = 0;
                    continue;
                }

                if (lastMessage.senderId && lastMessage.senderId === currentUserId) {
                    next[chat.id] = 0;
                    continue;
                }

                const readAt = lastReadByChat[chat.id];
                if (!readAt) {
                    next[chat.id] = 1;
                    continue;
                }

                next[chat.id] = new Date(lastMessage.createdAt).getTime() > new Date(readAt).getTime() ? 1 : 0;
            }
            return next;
        });
    }, [chats, currentUserId, lastReadByChat]);

    useEffect(() => {
        if (!activeChat || !search.trim()) {
            setSearchedMessages([]);
            setSearchLoading(false);
            return;
        }

        const requestId = ++latestSearchRequestIdRef.current;
        setSearchLoading(true);
        const handle = setTimeout(() => {
            chatsApi.searchChatMessages(activeChat.id, search.trim(), 100)
                .then((result) => {
                    if (requestId !== latestSearchRequestIdRef.current) return;
                    setSearchedMessages((result ?? []).map(normalizeMessage));
                })
                .catch((error) => {
                    if (requestId !== latestSearchRequestIdRef.current) return;
                    console.error(error);
                    setSearchedMessages([]);
                })
                .finally(() => {
                    if (requestId !== latestSearchRequestIdRef.current) return;
                    setSearchLoading(false);
                });
        }, 250);

        return () => clearTimeout(handle);
    }, [activeChat, search]);

    useEffect(() => {
        if (!activeChat) return;
        activeChatIdRef.current = activeChat.id;
        lastMarkedReadMessageRef.current = null;

        const activeLastMessage = chats.find(c => c.id === activeChat.id)?.lastMessage?.createdAt;
        if (activeLastMessage) {
            setLastReadByChat(prev => {
                const previous = prev[activeChat.id];
                if (previous && new Date(previous).getTime() >= new Date(activeLastMessage).getTime()) {
                    return prev;
                }
                return {...prev, [activeChat.id]: activeLastMessage};
            });
        }

        latestLoadRequestIdRef.current += 1;
        setMessages([]);
        setPinned([]);
        setText("");
        setReplyTo(null);
        setEditingMessage(null);
        setShowSearch(false);
            setSearch("");
            setSearchedMessages([]);
            setSearchLoading(false);
        setShowPinned(false);
        setEmojiPicker(null);
        setPage(1);
        setHasMore(true);

        void loadMessages(activeChat.id, 1, false);

        return () => {
            void connectionRef.current?.invoke("LeaveChat", activeChat.id).catch(console.error);
            if (activeChatIdRef.current === activeChat.id) {
                activeChatIdRef.current = null;
            }
        };
    }, [activeChat]);

    useEffect(() => {
        if (!activeChat) return;
        if (!hubConnected) return;
        if (!connectionRef.current) return;

        activeChatIdRef.current = activeChat.id;
        void connectionRef.current.invoke("JoinChat", activeChat.id).catch(console.error);
    }, [hubConnected, activeChat]);

    useEffect(() => {
        if (!activeChat || messages.length === 0) return;
        const latest = messages[messages.length - 1];
        if (!latest) return;

        setLastReadByChat(prev => {
            const previous = prev[activeChat.id];
            if (previous && new Date(previous).getTime() >= new Date(latest.createdAt).getTime()) {
                return prev;
            }
            return {...prev, [activeChat.id]: latest.createdAt};
        });
    }, [activeChat, messages]);

    useEffect(() => {
        if (!activeChat || !hubConnected || !currentUserId || messages.length === 0) return;

        const latestIncoming = [...messages]
            .reverse()
            .find(m => m.sender.id !== currentUserId);

        if (!latestIncoming) return;
        if (lastMarkedReadMessageRef.current === latestIncoming.id) return;

        const timer = window.setTimeout(() => {
            void chatsApi.markChatRead(activeChat.id, latestIncoming.id)
                .then(() => {
                    lastMarkedReadMessageRef.current = latestIncoming.id;
                })
                .catch(console.error);
        }, 250);

        return () => window.clearTimeout(timer);
    }, [activeChat, currentUserId, hubConnected, messages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    useEffect(() => {
        const el = messagesRef.current;
        if (!el) return;

        const onScroll = () => {
            if (!activeChat || loadingMore || !hasMore) return;
            if (el.scrollTop > 20) return;

            const previousScrollHeight = el.scrollHeight;
            const nextPage = page + 1;

            scrollAnchorRef.current = {top: el.scrollTop, height: previousScrollHeight};
            void loadMessages(activeChat.id, nextPage, true).then(() => {
                requestAnimationFrame(() => {
                    const current = messagesRef.current;
                    if (!current || !scrollAnchorRef.current) return;
                    const delta = current.scrollHeight - scrollAnchorRef.current.height;
                    current.scrollTop = delta + scrollAnchorRef.current.top;
                    scrollAnchorRef.current = null;
                });
            });
        };

        el.addEventListener("scroll", onScroll);
        return () => el.removeEventListener("scroll", onScroll);
    }, [activeChat, page, hasMore, loadingMore]);

    const {
        handleSend,
        handleKeyDown,
        handleTyping,
        handleFileUpload,
        handleFileInputChange,
        handleReaction,
        handlePin,
        handleDelete,
        startEdit,
        cancelEdit,
        handleDrop,
    } = useMessageActions({
        activeChat,
        hubConnected,
        connectionRef,
        text,
        setText,
        replyTo,
        setReplyTo,
        editingMessage,
        setEditingMessage,
        setMessages,
        setEmojiPicker,
        setDragActive,
    });

    const {
        recordingMode,
        mediaDraft,
        startRecording,
        stopRecording,
        sendDraftMedia,
        cancelDraftMedia,
    } = useMediaRecord({
        activeChatId: activeChat?.id,
        onSendFile: handleFileUpload,
    });

    const {
        saveGroupSettings,
        generateInvite,
        addMember,
        removeMember,
        toggleRole,
        toggleMute,
        leaveGroup,
        copyInvite,
        uploadGroupAvatar,
    } = useGroupActions({
        activeChat,
        chatDetails,
        groupName,
        groupDescription,
        inviteLink,
        newMemberEmail,
        setSettingsSaving,
        setChatDetails,
        setActiveChat,
        setChats,
        setInviteLink,
        setNewMemberEmail,
        setMembers,
        setSettingsOpen,
    });

    const {
        openCreateChat,
        switchCreateChatMode,
        toggleSelectUser,
        searchUsers,
        createChat,
    } = useCreateChatActions({
        createChatMode,
        createName,
        createDescription,
        selectedUsers,
        setCreateChatMode,
        setCreateChatOpen,
        setCreateName,
        setCreateDescription,
        setUserQuery,
        setUserResults,
        setSelectedUsers,
        setCreateLoading,
        setChats,
        setActiveChat,
    });

    const currentRole = chatDetails?.currentUserRole;
    const canEditGroup = activeChat?.type === "Direct" ? true : (isPlatformAdmin || currentRole === "Admin");
    const canManageMessages = activeChat?.type === "Direct" || isPlatformAdmin || currentRole === "Admin" || currentRole === "Member";
    const canPinMessages = isPlatformAdmin || currentRole === "Admin";

    return (
        <div className="chats">
            <ChatsSidebar
                visibleChats={visibleChats}
                activeChat={activeChat}
                setActiveChat={setActiveChat}
                unreadByChat={unreadByChat}
                openCreateChat={openCreateChat}
            />

            {activeChat ? (
                <ChatMainWindow
                    activeChat={activeChat}
                    dragActive={dragActive}
                    setDragActive={setDragActive}
                    openSettings={openSettings}
                    showSearch={showSearch}
                    setShowSearch={setShowSearch}
                    showPinned={showPinned}
                    setShowPinned={setShowPinned}
                    pinned={pinned}
                    search={search}
                    setSearch={setSearch}
                    searchLoading={searchLoading}
                    loadingMore={loadingMore}
                    messagesLoading={messagesLoading}
                    filteredMessages={search.trim() ? searchedMessages : filteredMessages}
                    currentUserId={currentUserId}
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                    messages={messages}
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
                    bottomRef={bottomRef}
                    messagesRef={messagesRef}
                    recordingMode={recordingMode}
                    stopRecording={stopRecording}
                    mediaDraft={mediaDraft}
                    sendDraftMedia={sendDraftMedia}
                    cancelDraftMedia={cancelDraftMedia}
                    fileInputRef={fileInputRef}
                    handleFileInputChange={handleFileInputChange}
                    handleTyping={handleTyping}
                    handleKeyDown={handleKeyDown}
                    handleDrop={handleDrop}
                    startRecording={startRecording}
                    composerDisabled={composerDisabled}
                />
            ) : (
                <ChatsEmpty/>
            )}

            <ChatSettingsModal
                isOpen={settingsOpen || menuOpen}
                activeChat={activeChat}
                settingsLoading={settingsLoading}
                setSettingsOpen={setSettingsOpen}
                setMenuOpen={setMenuOpen}
                chatDetails={chatDetails}
                groupName={groupName}
                setGroupName={setGroupName}
                groupDescription={groupDescription}
                setGroupDescription={setGroupDescription}
                canEditGroup={canEditGroup}
                groupAvatarInputRef={groupAvatarInputRef}
                uploadGroupAvatar={uploadGroupAvatar}
                settingsSaving={settingsSaving}
                saveGroupSettings={saveGroupSettings}
                toggleMute={toggleMute}
                inviteLink={inviteLink}
                copyInvite={copyInvite}
                generateInvite={generateInvite}
                newMemberEmail={newMemberEmail}
                setNewMemberEmail={setNewMemberEmail}
                addMember={addMember}
                members={members}
                currentUserId={currentUserId}
                presence={presence}
                toggleRole={toggleRole}
                removeMember={removeMember}
                leaveGroup={leaveGroup}
            />

            <CreateChatModal
                isOpen={createChatOpen}
                onClose={() => setCreateChatOpen(false)}
                createChatMode={createChatMode}
                setCreateChatMode={switchCreateChatMode}
                createName={createName}
                setCreateName={setCreateName}
                createDescription={createDescription}
                setCreateDescription={setCreateDescription}
                userQuery={userQuery}
                searchUsers={searchUsers}
                selectedUsers={selectedUsers}
                toggleSelectUser={toggleSelectUser}
                userResults={userResults}
                createLoading={createLoading}
                createChat={createChat}
            />
        </div>
    );
}