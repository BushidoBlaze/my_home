import type {JSX, ReactNode} from "react";
import {Droplet, Phone, Map, Building2, MessageCircle, Check} from "lucide-react";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import {BuildingSwatch} from "@/shared/ui/BuildingSwatch/BuildingSwatch.tsx";
import {Progress} from "@/shared/ui/Progress/Progress.tsx";
import {
    PROPERTIES,
    ADDRESS_INFO,
    RESIDENT_INFO,
    ASSIGNEE_INFO,
    RELATED_TICKETS,
    SOP_CHECKLIST,
} from "../model/data.ts";

function Prop({label, value}: { label: string; value: ReactNode }): JSX.Element {
    return (
        <div className="td-prop">
            <div className="td-prop__label">{label}</div>
            <div className="td-prop__value">{value}</div>
        </div>
    );
}

export default function SidePanel(): JSX.Element {
    return (
        <aside className="td-side">
            <div>
                <div className="t-eyebrow">Свойства</div>
                <div className="td-props">
                    <Prop
                        label="Категория"
                        value={<><Droplet size={13} style={{color: "#0ea5e9"}}/> {PROPERTIES.category}</>}
                    />
                    <Prop
                        label="Приоритет"
                        value={<span className="chip chip--danger"><span className="chip__dot"/>Аварийный</span>}
                    />
                    <Prop
                        label="Канал"
                        value={<><Phone size={13}/> {PROPERTIES.channel}</>}
                    />
                    <Prop label="Создана" value={PROPERTIES.created}/>
                    <Prop
                        label="Дедлайн"
                        value={<span className="tnum" style={{color: "#ef4444"}}>{PROPERTIES.deadline}</span>}
                    />
                    <Prop
                        label="ID шаблона"
                        value={<span className="mono" style={{color: "#64748b"}}>{PROPERTIES.sopId}</span>}
                    />
                </div>
            </div>

            <div>
                <div className="t-eyebrow">Адрес</div>
                <div className="td-card">
                    <BuildingSwatch size={36} color="#ef4444" label="A"/>
                    <div className="td-card__main">
                        <div className="td-card__title">{ADDRESS_INFO.addr}</div>
                        <div className="td-card__sub">{ADDRESS_INFO.sub}</div>
                        <div className="td-card__actions">
                            <button className="btn btn--sm btn--ghost">
                                <Map size={12}/>На карте
                            </button>
                            <button className="btn btn--sm btn--ghost">
                                <Building2 size={12}/>Карточка дома
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="t-eyebrow">Жилец</div>
                <div className="td-card td-card--row">
                    <Avatar name={RESIDENT_INFO.name} size={36}/>
                    <div className="td-card__main">
                        <div className="td-card__title">{RESIDENT_INFO.name}</div>
                        <div className="td-card__sub">{RESIDENT_INFO.role}</div>
                    </div>
                    <button className="btn btn--icon btn--sm">
                        <Phone size={13}/>
                    </button>
                    <button className="btn btn--icon btn--sm">
                        <MessageCircle size={13}/>
                    </button>
                </div>
                <div className="td-resident__meta">
                    <span>{RESIDENT_INFO.debt}</span><span>·</span>
                    <span>{RESIDENT_INFO.ticketsPerYear}</span><span>·</span>
                    <span>{RESIDENT_INFO.nps}</span>
                </div>
            </div>

            <div>
                <div className="td-side__head">
                    <div className="t-eyebrow">Исполнитель</div>
                    <button className="btn btn--sm btn--ghost">Сменить</button>
                </div>
                <div className="td-card td-card--row">
                    <Avatar name={ASSIGNEE_INFO.fullName} size={36}/>
                    <div className="td-card__main">
                        <div className="td-card__title">{ASSIGNEE_INFO.name}</div>
                        <div className="td-card__sub">{ASSIGNEE_INFO.role}</div>
                    </div>
                    <span className="td-status-dot" title="на выезде"/>
                </div>
                <div className="td-load">
                    <div className="td-load__label">Нагрузка сегодня</div>
                    <Progress value={ASSIGNEE_INFO.loadCurrent} max={ASSIGNEE_INFO.loadMax} h={4} color="#0ea5e9"/>
                    <div className="td-load__row">
                        <span>{ASSIGNEE_INFO.loadCurrent} из {ASSIGNEE_INFO.loadMax} заявок</span>
                        <span>{ASSIGNEE_INFO.avgTime}</span>
                    </div>
                </div>
            </div>

            <div>
                <div className="t-eyebrow">Связанные</div>
                <div className="td-related">
                    {RELATED_TICKETS.map(r => (
                        <div key={r.id} className="td-related__item">
                            <span className="mono td-related__id">{r.id}</span>
                            <div className="td-related__title">{r.title}</div>
                            <span className="td-related__date">{r.date}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="t-eyebrow">Чек-лист SOP</div>
                <div className="td-sop">
                    {SOP_CHECKLIST.map((item, i) => (
                        <div key={i} className="td-sop__item">
                            <div
                                className={"td-sop__box" + (item.done ? " td-sop__box--done" : "")}
                            >
                                {item.done && <Check size={10} strokeWidth={3}/>}
                            </div>
                            <span className={"td-sop__text" + (item.done ? " td-sop__text--done" : "")}>
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
                <div style={{marginTop: 10}}>
                    <Progress
                        value={SOP_CHECKLIST.filter(s => s.done).length}
                        max={SOP_CHECKLIST.length}
                        h={4}
                        color="#10b981"
                    />
                </div>
            </div>
        </aside>
    );
}
