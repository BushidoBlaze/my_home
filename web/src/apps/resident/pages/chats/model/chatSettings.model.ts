import {type ChatDetails} from "@/api/chats.api.ts";


export function canEditGroupSettings(details: ChatDetails | null, isPlatformAdmin: boolean) {
    const currentRole = details?.currentUserRole;
    return isPlatformAdmin || currentRole === "Admin";
}