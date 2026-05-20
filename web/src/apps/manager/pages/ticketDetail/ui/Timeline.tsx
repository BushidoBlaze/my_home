import type {JSX} from "react";
import {TIMELINE_EVENTS} from "../model/data.ts";
import type {TimelineEvent} from "../model/types.ts";

function TimelineItem({event}: { event: TimelineEvent }): JSX.Element {
    const EventIcon = event.icon;
    return (
        <div className="td-tl__item">
            <div
                className="td-tl__icon"
                style={{background: event.iconBg, color: event.iconFg}}
            >
                <EventIcon size={13}/>
            </div>
            <div className="td-tl__head">
                <span className="td-tl__actor">{event.actor}</span>
                <span className="td-tl__title">{event.title}</span>
                <span className="tnum td-tl__time">{event.time}</span>
            </div>
            {event.body && <div className="td-tl__body">{event.body}</div>}
        </div>
    );
}

export default function Timeline(): JSX.Element {
    return (
        <section>
            <div className="t-eyebrow td-tl__heading">Журнал</div>
            <div className="td-tl">
                <div className="td-tl__rail"/>
                {TIMELINE_EVENTS.map((e, i) => (
                    <TimelineItem key={i} event={e}/>
                ))}
            </div>
        </section>
    );
}
