import {useState} from "react";
import type {JSX} from "react";
import ChatList from "./ui/ChatList.tsx";
import ChatThread from "./ui/ChatThread.tsx";
import ChatContext from "./ui/ChatContext.tsx";
import "./Chat.css";

export default function Chat(): JSX.Element {
    const [contextOpen, setContextOpen] = useState(true);
    const [listCollapsed, setListCollapsed] = useState(false);

    return (
        <div className={
            "chat-layout" +
            (listCollapsed ? " chat-layout--list-collapsed" : "") +
            (!contextOpen ? " chat-layout--no-context" : "")
        }>
            <ChatList collapsed={listCollapsed} onToggle={() => setListCollapsed(c => !c)}/>
            <ChatThread contextOpen={contextOpen} onToggleContext={() => setContextOpen(c => !c)}/>
            <ChatContext open={contextOpen} onClose={() => setContextOpen(false)}/>
        </div>
    );
}
