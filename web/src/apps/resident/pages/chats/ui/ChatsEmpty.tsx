import {MessageSquare} from "lucide-react";

export function ChatsEmpty() {
    return (
        <div className="chats__empty">
            <div className="chats__empty-icon-wrap">
                <MessageSquare size={32}/>
            </div>
            <h3 className="chats__empty-title">Выберите чат</h3>
            <p className="chats__empty-subtitle">
                Выберите чат из списка слева, чтобы начать общение
            </p>
        </div>
    );
}