import type {PresenceMap} from "./types.ts";

export function getUserOnline(presence: PresenceMap, userId: string): boolean {
    return presence[userId]?.isOnline ?? false;
}