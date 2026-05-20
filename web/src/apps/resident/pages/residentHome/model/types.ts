import {type ServiceRequest} from "@/api/requests.api.ts";
import {type NotificationItem} from "@/api/notifications.api.ts";


export type ResidentRequest = ServiceRequest;
export type ResidentNotification = NotificationItem;

export type QuickService = {
    id: string;
    label: string;
    to: string;
    icon: "wrench" | "chat" | "wallet" | "marketplace";
};
