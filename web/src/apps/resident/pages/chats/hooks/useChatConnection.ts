import {chatsApi, type Chat, type ChatMessageItem} from "@/api/chats.api.ts";
import {useEffect, useRef, useState} from "react";
import * as signalR from "@microsoft/signalr";

import type {ChatMessageUi, PresenceMap} from "../model/types.ts";
import {getMediaPreviewLabel} from "../model/utils.ts";

type Params = {
    apiOrigin: string;
    currentUserId: string;
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
    setMessages: React.Dispatch<React.SetStateAction<ChatMessageUi[]>>;
    setPinned: React.Dispatch<React.SetStateAction<ChatMessageUi[]>>;
    getMessageById: (messageId: string) => ChatMessageUi | null;
    setTypingUser: React.Dispatch<React.SetStateAction<string | null>>;
    setPresence: React.Dispatch<React.SetStateAction<PresenceMap>>;
};

function normalizeMessage(msg: ChatMessageItem): ChatMessageUi {
    return {
        ...msg,
        reactions: msg.reactions ?? [],
    };
}

export function useChatConnection({
                                      apiOrigin,
                                      currentUserId,
                                      setChats,
                                      setMessages,
                                      setPinned,
                                      getMessageById,
                                      setTypingUser,
                                      setPresence,
                                  }: Params) {
    const [hubConnected, setHubConnected] = useState(false);
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const activeChatIdRef = useRef<string | null>(null);
    const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        let mounted = true;
        // Флаг для защиты от двойного запуска в React StrictMode
        let stopped = false;

        // Инициализируем дефолтные чаты и загружаем список
        chatsApi.initChats()
            .then(() => chatsApi.getMyChats())
            .then(data => { if (mounted) setChats(data); })
            .catch(console.error);

        // Создаём SignalR соединение с negotiate/fallback для сетей без WS
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${apiOrigin}/hubs/chat`, {
                accessTokenFactory: () => localStorage.getItem("token") || "",
            })
            .withAutomaticReconnect()
            .build();

        // Новое сообщение пришло
        connection.on("ReceiveMessage", (msg: ChatMessageItem) => {
            const normalized = normalizeMessage(msg);
            const activeChatId = activeChatIdRef.current;

            // Показываем только в активном чате
            if (normalized.chatId && activeChatId === normalized.chatId) {
                setMessages(prev => {
                    const exists = prev.some(m => m.id === normalized.id);
                    if (exists) return prev.map(m => m.id === normalized.id ? normalized : m);
                    return [...prev, normalized];
                });
            }

            // Обновляем превью последнего сообщения в списке чатов
            setChats(prev => {
                const senderName = normalized.sender?.fullName ?? "Сообщение";
                const messagePreview = normalized.type === "text"
                    ? normalized.text
                    : getMediaPreviewLabel(normalized.type);

                return prev.map(c => c.id === normalized.chatId
                    ? {
                        ...c,
                        lastMessage: {
                            text: messagePreview,
                            type: normalized.type,
                            createdAt: normalized.createdAt,
                            senderId: normalized.sender?.id,
                            senderName
                        }
                    }
                    : c
                );
            });
        });

        // Сообщение отредактировано
        connection.on("MessageUpdated", (data: { messageId: string; text: string }) => {
            setMessages(prev => prev.map(m =>
                m.id === data.messageId ? {...m, text: data.text} : m
            ));
        });

        // Сообщение удалено
        connection.on("MessageDeleted", (data: { messageId: string }) => {
            setMessages(prev => prev.filter(m => m.id !== data.messageId));
        });

        // Реакции обновились
        connection.on("ReactionsUpdated", (data: { messageId: string; reactions: { emoji: string; count: number }[] }) => {
            setMessages(prev => prev.map(m =>
                m.id === data.messageId ? {...m, reactions: data.reactions ?? []} : m
            ));
        });

        // Сообщение закреплено или откреплено
        connection.on("MessagePinned", (data: { messageId: string; isPinned: boolean }) => {
            setMessages(prev => prev.map(m =>
                m.id === data.messageId ? {...m, isPinned: data.isPinned} : m
            ));
            setPinned(prev => {
                const updated = prev.map(m =>
                    m.id === data.messageId ? {...m, isPinned: data.isPinned} : m
                ).filter(m => m.isPinned);

                if (!data.isPinned) return updated;

                const alreadyPinned = updated.some(m => m.id === data.messageId);
                if (alreadyPinned) return updated;

                const messageToPin = getMessageById(data.messageId);
                if (!messageToPin) return updated;
                return [messageToPin, ...updated];
            });
        });

        // Кто-то печатает — показываем 2 секунды
        connection.on("UserTyping", (data: { fullName: string }) => {
            setTypingUser(data.fullName);
            if (typingTimer.current) clearTimeout(typingTimer.current);
            typingTimer.current = setTimeout(() => setTypingUser(null), 2000);
        });

        // Статус пользователя изменился (онлайн/оффлайн)
        connection.on("UserStatusChanged", (data: { userId: string; isOnline: boolean; lastSeen?: string }) => {
            setPresence(prev => ({
                ...prev,
                [data.userId]: {isOnline: data.isOnline, lastSeen: data.lastSeen}
            }));
        });

        // Начальный снимок онлайн пользователей
        connection.on("PresenceSnapshot", (data: { userId: string; isOnline: boolean; lastSeen?: string }[]) => {
            const next: PresenceMap = {};
            for (const item of data ?? []) {
                next[item.userId] = {isOnline: item.isOnline, lastSeen: item.lastSeen};
            }
            setPresence(next);
        });

        connection.on("ChatReadUpdated", (data: { chatId: string; userId: string; readAt: string }) => {
            const activeChatId = activeChatIdRef.current;
            if (!activeChatId || data.chatId !== activeChatId) return;
            if (data.userId === currentUserId) return;

            const readAtMs = new Date(data.readAt).getTime();
            if (Number.isNaN(readAtMs)) return;

            setMessages(prev => prev.map(m => {
                if (m.sender.id !== currentUserId) return m;
                if ((m.isRead ?? false) || new Date(m.createdAt).getTime() > readAtMs) return m;
                return {...m, isRead: true};
            }));
        });

        // Идёт переподключение
        connection.onreconnecting(() => {
            setHubConnected(false);
        });

        // Переподключились — заходим обратно в активный чат
        connection.onreconnected(() => {
            setHubConnected(true);
            const chatId = activeChatIdRef.current;
            if (chatId) {
                void connection.invoke("JoinChat", chatId).catch(console.error);
            }
        });

        // Соединение закрыто
        connection.onclose(() => {
            setHubConnected(false);
        });

        // Запускаем соединение
        connection.start()
            .then(() => {
                // Если cleanup уже сработал (StrictMode) — игнорируем
                if (stopped) return;
                setHubConnected(true);
                const chatId = activeChatIdRef.current;
                if (chatId) {
                    return connection.invoke("JoinChat", chatId).catch(console.error);
                }
                return Promise.resolve();
            })
            .catch((error) => {
                if (stopped) return;
                setHubConnected(false);
                console.error("[SignalR] connection.start failed", error);
            });

        connectionRef.current = connection;

        // Очистка при размонтировании
        return () => {
            stopped = true;
            mounted = false;
            setHubConnected(false);

            if (typingTimer.current) {
                clearTimeout(typingTimer.current);
                typingTimer.current = null;
            }

            void connection.stop().catch(() => {});
        };
    }, []);

    return {
        hubConnected,
        connectionRef,
        activeChatIdRef,
    };
}