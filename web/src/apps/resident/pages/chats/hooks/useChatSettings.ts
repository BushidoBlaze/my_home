import {chatsApi, type Chat, type ChatDetails, type ChatMemberItem} from "@/api/chats.api.ts";
import {useEffect} from "react";




type Params = {
    settingsOpen: boolean;
    activeChat: Chat | null;
    setSettingsOpen: (v: boolean) => void;
    setMenuOpen: (v: boolean) => void;
    setSettingsLoading: (v: boolean) => void;
    setChatDetails: (v: ChatDetails | null | ((prev: ChatDetails | null) => ChatDetails | null)) => void;
    setMembers: (v: ChatMemberItem[] | ((prev: ChatMemberItem[]) => ChatMemberItem[])) => void;
    setGroupName: (v: string) => void;
    setGroupDescription: (v: string) => void;
    setInviteLink: (v: string) => void;
};

export function useChatSettings(params: Params) {
    const {
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
    } = params;

    function openSettings() {
        setSettingsOpen(true);
        setMenuOpen(false);
    }

    // Детали и участники нужны не только модалке настроек, но и правой context-панели,
    // поэтому грузим их при каждой смене активного чата
    useEffect(() => {
        if (!activeChat) {
            setChatDetails(null);
            setMembers([]);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                setSettingsLoading(true);

                const [details, memberList] = await Promise.all([
                    chatsApi.getChatDetails(activeChat.id),
                    chatsApi.getChatMembers(activeChat.id)
                ]);

                if (cancelled) return;

                setChatDetails(details);
                setMembers(memberList);
                setGroupName(details.name ?? "");
                setGroupDescription(details.description ?? "");
                setInviteLink(details.inviteCode ? `${window.location.origin}/invite/${details.inviteCode}` : "");
            } catch (error) {
                console.error(error);
            } finally {
                if (!cancelled) setSettingsLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [activeChat]);

    return {
        openSettings,
    };
}
