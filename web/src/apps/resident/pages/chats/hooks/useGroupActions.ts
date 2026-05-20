import {chatsApi, type Chat, type ChatDetails, type ChatMemberItem} from "@/api/chats.api.ts";
import type {ChangeEvent, Dispatch, SetStateAction} from "react";




type Params = {
    activeChat: Chat | null;
    chatDetails: ChatDetails | null;
    groupName: string;
    groupDescription: string;
    inviteLink: string;
    newMemberEmail: string;
    setSettingsSaving: Dispatch<SetStateAction<boolean>>;
    setChatDetails: Dispatch<SetStateAction<ChatDetails | null>>;
    setActiveChat: Dispatch<SetStateAction<Chat | null>>;
    setChats: Dispatch<SetStateAction<Chat[]>>;
    setInviteLink: Dispatch<SetStateAction<string>>;
    setNewMemberEmail: Dispatch<SetStateAction<string>>;
    setMembers: Dispatch<SetStateAction<ChatMemberItem[]>>;
    setSettingsOpen: Dispatch<SetStateAction<boolean>>;
};

export function useGroupActions(params: Params) {
    const {
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
    } = params;

    async function saveGroupSettings() {
        if (!activeChat) return;
        try {
            setSettingsSaving(true);
            const updated = await chatsApi.updateChat(activeChat.id, {
                name: groupName,
                description: groupDescription,
            });

            setChatDetails(updated);
            setActiveChat(prev => prev && prev.id === updated.id ? {...prev, ...updated} : prev);
            setChats(prev => prev.map(c => c.id === updated.id ? {...c, ...updated} : c));
        } catch (error) {
            console.error(error);
        } finally {
            setSettingsSaving(false);
        }
    }

    async function generateInvite() {
        if (!activeChat) return;
        try {
            const res = await chatsApi.generateInviteLink(activeChat.id);
            setInviteLink(`${window.location.origin}/invite/${res.inviteCode}`);
            setChatDetails(prev => prev ? {...prev, inviteCode: res.inviteCode} : prev);
            setChats(prev => prev.map(c => c.id === activeChat.id ? {...c, inviteCode: res.inviteCode} : c));
        } catch (error) {
            console.error(error);
        }
    }

    async function addMember() {
        if (!activeChat || !newMemberEmail.trim()) return;
        try {
            await chatsApi.addChatMemberByEmail(activeChat.id, newMemberEmail.trim());
            setNewMemberEmail("");
            const refreshed = await chatsApi.getChatMembers(activeChat.id);
            setMembers(refreshed);
            const updatedChat = await chatsApi.getChatDetails(activeChat.id);
            setChatDetails(updatedChat);
            setChats(prev => prev.map(c => c.id === updatedChat.id ? {
                ...c,
                membersCount: updatedChat.membersCount
            } : c));
        } catch (error) {
            console.error(error);
        }
    }

    async function removeMember(member: ChatMemberItem) {
        if (!activeChat) return;
        try {
            await chatsApi.removeChatMember(activeChat.id, member.userId);
            setMembers(await chatsApi.getChatMembers(activeChat.id));
            const updatedChat = await chatsApi.getChatDetails(activeChat.id);
            setChatDetails(updatedChat);
            setChats(prev => prev.map(c => c.id === updatedChat.id ? {
                ...c,
                membersCount: updatedChat.membersCount
            } : c));
        } catch (error) {
            console.error(error);
        }
    }

    async function toggleRole(member: ChatMemberItem) {
        if (!activeChat) return;
        try {
            const nextRole = member.role === "Admin" ? "Member" : "Admin";
            await chatsApi.setChatMemberRole(activeChat.id, member.userId, nextRole);
            setMembers(await chatsApi.getChatMembers(activeChat.id));
        } catch (error) {
            console.error(error);
        }
    }

    async function toggleMute() {
        if (!activeChat || !chatDetails) return;
        try {
            const nextMuted = !(chatDetails.isMuted ?? false);
            const res = await chatsApi.setChatMuted(activeChat.id, nextMuted);
            setChatDetails(prev => prev ? {...prev, isMuted: res.isMuted} : prev);
            setChats(prev => prev.map(c => c.id === activeChat.id ? {...c, isMuted: res.isMuted} : c));
        } catch (error) {
            console.error(error);
        }
    }

    async function leaveGroup() {
        if (!activeChat) return;
        try {
            await chatsApi.leaveChat(activeChat.id);
            setSettingsOpen(false);
            setActiveChat(null);
            setChats(await chatsApi.getMyChats());
        } catch (error) {
            console.error(error);
        }
    }

    async function copyInvite() {
        if (!inviteLink) return;
        await navigator.clipboard.writeText(inviteLink);
    }

    async function uploadGroupAvatar(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !activeChat) return;
        try {
            const res = await chatsApi.uploadGroupAvatar(activeChat.id, file);
            setChatDetails(prev => prev ? {...prev, avatarUrl: res.url} : prev);
            setActiveChat(prev => prev ? {...prev, avatarUrl: res.url} : prev);
            setChats(prev => prev.map(c => c.id === activeChat.id ? {...c, avatarUrl: res.url} : c));
        } catch (error) {
            console.error(error);
        } finally {
            e.target.value = "";
        }
    }

    return {
        saveGroupSettings,
        generateInvite,
        addMember,
        removeMember,
        toggleRole,
        toggleMute,
        leaveGroup,
        copyInvite,
        uploadGroupAvatar,
    };
}
