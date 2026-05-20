import type {JSX} from "react";
import {ChevronRight} from "lucide-react";
import {ACTIVITY_EVENTS} from "../model/data.ts";

export default function ActivityFeed(): JSX.Element {
    return (
        <div className="card home-activity">
            <div className="home-section-head">
                <div className="t-h3">Лента событий</div>
                <button className="btn btn--sm btn--ghost">
                    Открыть журнал <ChevronRight size={12}/>
                </button>
            </div>

            <div className="home-activity__list">
                {ACTIVITY_EVENTS.map((event, i) => {
                    const EventIcon = event.icon;
                    return (
                        <div
                            key={i}
                            className="home-activity__item"
                            style={{borderBottom: i < ACTIVITY_EVENTS.length - 1 ? "1px solid #f1f5f9" : "none"}}
                        >
                            <div className="tnum home-activity__time">{event.time}</div>
                            <div className="home-activity__icon" style={{color: event.iconFg}}>
                                <EventIcon size={16}/>
                            </div>
                            <div className="home-activity__text">
                                {event.textParts.map((part, j) => (
                                    <span
                                        key={j}
                                        style={{
                                            color: part.muted ? "#64748b" : undefined,
                                            fontWeight: part.bold ? 600 : undefined,
                                        }}
                                    >
                                        {part.text}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
