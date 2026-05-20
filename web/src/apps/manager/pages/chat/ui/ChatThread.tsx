import type {JSX} from "react";
import {AlertTriangle, Phone, Search, MoreHorizontal, Plus, Wrench, Sparkles, X, Paperclip, Send, PanelRightOpen, PanelRightClose} from "lucide-react";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import {Msg, SystemMsg, DateSeparator} from "./ChatMessage.tsx";
import {ACTIVE_CONTACT} from "../model/data.ts";

interface Props {
    contextOpen: boolean;
    onToggleContext: () => void;
}

export default function ChatThread({contextOpen, onToggleContext}: Props): JSX.Element {
    return (
        <section className="chat-thread">
            <div className="chat-thread__head">
                <Avatar name={ACTIVE_CONTACT.name} size={36}/>
                <div className="chat-thread__head-text">
                    <div className="chat-thread__name">{ACTIVE_CONTACT.name}</div>
                    <div className="chat-thread__status">
                        <span className="chat-thread__status-dot"/>
                        онлайн · {ACTIVE_CONTACT.addr}
                    </div>
                </div>
                <span className="chip chip--danger">
                    <AlertTriangle size={11}/>Связана с Т-4471
                </span>
                <div className="chat-thread__divider"/>
                <button className="btn btn--icon btn--sm btn--ghost">
                    <Phone size={15}/>
                </button>
                <button className="btn btn--icon btn--sm btn--ghost">
                    <Search size={15}/>
                </button>
                <button className="btn btn--icon btn--sm btn--ghost">
                    <MoreHorizontal size={15}/>
                </button>
                <div className="chat-thread__divider"/>
                <button
                    className="btn btn--icon btn--sm btn--ghost"
                    onClick={onToggleContext}
                    title={contextOpen ? "Скрыть профиль" : "Показать профиль"}
                >
                    {contextOpen ? <PanelRightClose size={15}/> : <PanelRightOpen size={15}/>}
                </button>
            </div>

            <div className="chat-thread__messages">
                <DateSeparator label="Сегодня"/>

                <Msg side="them" name="Ольга Кузнецова" time="09:34">
                    Здравствуйте, у меня капает с потолка в санузле. Соседи сверху не открывают. Подъезд 4, кв. 56.
                    <div className="chat-photo">
                        <span className="mono chat-photo__name">фото-1.jpg</span>
                    </div>
                </Msg>

                <SystemMsg
                    icon={Plus}
                    iconFg="#0ea5e9"
                    text={<>Создана заявка <b className="mono">Т-4471</b> · «Течь стояка ХВС»</>}
                />

                <Msg side="me" name="Ирина Петрова" time="09:48">
                    Ольга, добрый день. Аварийную заявку зарегистрировали. Назначаем сантехника, бригада выедет в течение часа. Дайте, пожалуйста, контакт — позвоним при подходе.
                </Msg>

                <Msg side="them" name="Ольга Кузнецова" time="09:51">
                    +7 902 145-77-83. Я дома до 14:00.
                </Msg>

                <SystemMsg
                    icon={Wrench}
                    iconFg="#0ea5e9"
                    text={<>А. Громов взял заявку <b className="mono">Т-4471</b> · SLA 4 ч</>}
                />

                <Msg side="me" name="А. Громов" time="11:10" through>
                    Ольга, выехал. Буду через 30 минут. Перекрою стояк по подъезду — у соседей какое-то время не будет холодной воды, предупредите если что.
                </Msg>

                <Msg side="them" name="Ольга Кузнецова" time="11:12">
                    Хорошо, жду 🙏
                </Msg>

                <Msg side="them" name="Ольга Кузнецова" time="11:41">
                    Спасибо! Бригада уже работает.
                </Msg>

                <div className="chat-ai">
                    <div className="chat-ai__head">
                        <Sparkles size={13}/> Помощник предлагает ответ
                    </div>
                    <div className="chat-ai__text">
                        Ольга, пожалуйста. После завершения работ оставлю запись в заявке и закрою её — вам придёт акт в приложении. Если будут вопросы — пишите сюда.
                    </div>
                    <div className="chat-ai__actions">
                        <button className="btn btn--sm chat-ai__accept">Принять и отправить</button>
                        <button className="btn btn--sm btn--ghost">Редактировать</button>
                        <button className="btn btn--sm btn--ghost btn--icon">
                            <X size={12}/>
                        </button>
                    </div>
                </div>
            </div>

            <div className="chat-composer">
                <div className="chat-composer__inner">
                    <textarea
                        className="chat-composer__textarea"
                        placeholder="Написать сообщение..."
                    />
                    <div className="chat-composer__toolbar">
                        <button className="btn btn--icon btn--sm btn--ghost">
                            <Paperclip size={14}/>
                        </button>
                        <button className="btn btn--icon btn--sm btn--ghost">
                            <Sparkles size={14}/>
                        </button>
                        <button className="btn btn--sm btn--ghost">Шаблоны</button>

                        <span className="chat-composer__spacer"/>

                        <button className="btn btn--sm btn--primary">
                            <Send size={12}/>Отправить
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
