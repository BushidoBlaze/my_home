import type {JSX, ReactNode} from "react";
import type {LucideIcon} from "lucide-react";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";

interface MsgProps {
    side: "me" | "them";
    name: string;
    time: string;
    through?: boolean;
    children: ReactNode;
}

export function Msg({side, name, time, through, children}: MsgProps): JSX.Element {
    const isMe = side === "me";
    return (
        <div className={"chat-msg" + (isMe ? " chat-msg--me" : " chat-msg--them")}>
            <div className="chat-msg__head">
                {!isMe && <Avatar name={name} size={18}/>}
                <span className="chat-msg__name">{name}</span>
                {through && (
                    <span className="chip chat-msg__through">через УК</span>
                )}
                <span>· {time}</span>
            </div>
            <div className={"chat-msg__bubble" + (isMe ? " chat-msg__bubble--me" : "")}>
                {children}
            </div>
        </div>
    );
}

interface SystemMsgProps {
    icon: LucideIcon;
    iconFg: string;
    text: ReactNode;
}

export function SystemMsg({icon: Icon, iconFg, text}: SystemMsgProps): JSX.Element {
    return (
        <div className="chat-sysmsg">
            <Icon size={12} style={{color: iconFg}}/>
            <span>{text}</span>
        </div>
    );
}

export function DateSeparator({label}: { label: string }): JSX.Element {
    return (
        <div className="chat-date">
            <div className="chat-date__rail"/>
            <span>{label}</span>
            <div className="chat-date__rail"/>
        </div>
    );
}
