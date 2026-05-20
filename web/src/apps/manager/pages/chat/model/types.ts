import type {ReactNode} from "react";
import type {LucideIcon} from "lucide-react";
import type {ChipTone} from "@/apps/manager/pages/home/model/types.ts";

export type ConversationTag = {
    label: string;
    tone: ChipTone;
};

export type Conversation = {
    id: string;
    name: string;
    addr: string;
    last: string;
    time: string;
    unread: number;
    selected?: boolean;
    group?: boolean;
    tag?: ConversationTag;
    status: "live" | "waiting";
};

export type MessageSide = "me" | "them";

export type Message =
    | {
        kind: "msg";
        side: MessageSide;
        name: string;
        time: string;
        through?: boolean;
        text: string;
        photo?: string;
    }
    | {
        kind: "system";
        icon: LucideIcon;
        iconFg: string;
        text: ReactNode;
    }
    | {
        kind: "date";
        label: string;
    };

export type ProfileRow = {
    k: string;
    v: string;
    tone?: "ok";
};

export type OpenTicket = {
    id: string;
    title: string;
    assignee: string;
    icon: LucideIcon;
    iconBg: string;
    iconFg: string;
};

export type HistoryItem = {
    id: string;
    title: string;
    date: string;
    tone: string;
};
