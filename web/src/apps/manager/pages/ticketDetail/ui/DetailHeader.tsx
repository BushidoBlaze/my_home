import type {JSX} from "react";
import {ChevronRight, Bell, MoreHorizontal, Check} from "lucide-react";
import {TICKET_INFO} from "../model/data.ts";

export default function DetailHeader(): JSX.Element {
    return (
        <header className="td-header">
            <div className="td-header__title-wrap">
                <div className="td-header__breadcrumb">
                    <span>Заявки</span>
                    <ChevronRight size={11}/>
                    <span className="mono">{TICKET_INFO.id}</span>
                </div>
                <div className="td-header__title-row">
                    <span className="td-header__title">{TICKET_INFO.title}</span>
                    <span className="chip chip--danger"><span className="chip__dot"/>АВАРИЯ</span>
                    <span className="chip chip--info"><span className="chip__dot"/>В работе</span>
                </div>
            </div>

            <div className="td-header__actions">
                <button className="btn btn--sm btn--ghost">
                    <Bell size={14}/>Подписаться
                </button>
                <button className="btn btn--sm btn--ghost btn--icon">
                    <MoreHorizontal size={14}/>
                </button>
                <div className="td-header__divider"/>
                <button className="btn btn--sm">Передать</button>
                <button className="btn btn--sm btn--primary">
                    <Check size={13}/>Закрыть
                </button>
            </div>
        </header>
    );
}
