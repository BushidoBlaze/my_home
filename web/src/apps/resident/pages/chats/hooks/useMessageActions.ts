import {chatsApi, type Chat} from "@/api/chats.api.ts";
import type {ChangeEvent} from "react";
import * as signalR from "@microsoft/signalr";



import type {ChatMessageUi} from "../model/types.ts";

type Params = {
    activeChat: Chat | null;
    hubConnected: boolean;
    connectionRef: React.RefObject<signalR.HubConnection | null>;
    text: string;
    setText: (value: string) => void;
    replyTo: ChatMessageUi | null;
    setReplyTo: (value: ChatMessageUi | null) => void;
    editingMessage: ChatMessageUi | null;
    setEditingMessage: (value: ChatMessageUi | null) => void;
    setMessages: React.Dispatch<React.SetStateAction<ChatMessageUi[]>>;
    setEmojiPicker: (value: string | null) => void;
    setDragActive: (value: boolean) => void;
};

// Хук с действиями над сообщениями в чате
export function useMessageActions(params: Params) {
    const {
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
    } = params;

    // Проверяем что соединение активно
    function isConnected(): boolean {
        return hubConnected &&
            !!connectionRef.current &&
            connectionRef.current.state === signalR.HubConnectionState.Connected;
    }

    // Отправить текстовое сообщение или сохранить редактирование
    async function handleSend() {
        if (!text.trim() || !activeChat) return;
        if (!isConnected()) return;

        const content = text.trim();

        try {
            // Режим редактирования сообщения
            if (editingMessage) {
                const previousText = editingMessage.text;
                setMessages(prev => prev.map(m =>
                    m.id === editingMessage.id ? {...m, text: content} : m
                ));
                try
                {
                    await connectionRef.current!.invoke("EditMessage", editingMessage.id, content);
                }
                catch (error)
                {
                    setMessages(prev => prev.map(m =>
                        m.id === editingMessage.id ? {...m, text: previousText} : m
                    ));
                    throw error;
                }
                setEditingMessage(null);
                setText("");
                return;
            }

            // Обычная отправка
            await connectionRef.current!.invoke(
                "SendMessage",
                activeChat.id,
                content,
                replyTo?.id ?? null,
                null,
                null,
                null
            );

            setText("");
            setReplyTo(null);
        } catch (error) {
            console.error("[chats] SendMessage failed", error);
        }
    }

    // Отправка по Enter (Shift+Enter — перенос строки)
    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleSend();
        }
    }

    // Уведомление что пользователь печатает
    function handleTyping() {
        if (!activeChat || !isConnected()) return;
        void connectionRef.current!.invoke("Typing", activeChat.id).catch(console.error);
    }

    // Загрузка и отправка файла
    async function handleFileUpload(file: File) {
        if (!file || !activeChat || !isConnected()) return;

        try {
            const res = await chatsApi.uploadChatFile(activeChat.id, file);
            await connectionRef.current!.invoke(
                "SendMessage",
                activeChat.id,
                res.fileName,
                null,
                res.url,
                res.fileName,
                res.type
            );
        } catch (error) {
            console.error("[chats] FileUpload failed", error);
        }
    }

    // Обработчик input[type=file]
    async function handleFileInputChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        await handleFileUpload(file);
        e.target.value = "";
    }

    // Добавить или убрать реакцию
    async function handleReaction(messageId: string, emoji: string) {
        if (!isConnected()) return;
        try {
            await connectionRef.current!.invoke("AddReaction", messageId, emoji);
            setEmojiPicker(null);
        } catch (error) {
            console.error("[chats] AddReaction failed", error);
        }
    }

    // Закрепить или открепить сообщение
    async function handlePin(messageId: string) {
        if (!isConnected()) return;
        try {
            await connectionRef.current!.invoke("PinMessage", messageId);
        } catch (error) {
            console.error("[chats] PinMessage failed", error);
        }
    }

    // Удалить сообщение
    async function handleDelete(messageId: string) {
        if (!isConnected()) return;
        let snapshot: ChatMessageUi[] = [];
        try {
            setMessages(prev => {
                snapshot = prev;
                return prev.filter(m => m.id !== messageId);
            });
            await connectionRef.current!.invoke("DeleteMessage", messageId);
        } catch (error) {
            if (snapshot.length > 0) {
                setMessages(snapshot);
            }
            console.error("[chats] DeleteMessage failed", error);
        }
    }

    // Начать редактирование сообщения
    function startEdit(msg: ChatMessageUi) {
        setEditingMessage(msg);
        setText(msg.text);
        setReplyTo(null);
    }

    // Отменить редактирование
    function cancelEdit() {
        setEditingMessage(null);
        setText("");
    }

    // Drag & drop файла в чат
    async function handleDrop(e: React.DragEvent<HTMLElement>) {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        await handleFileUpload(file);
    }

    return {
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
    };
}