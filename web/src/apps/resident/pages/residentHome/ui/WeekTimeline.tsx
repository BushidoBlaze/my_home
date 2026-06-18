import {useEffect, useState, type JSX} from "react";
import {CalendarClock, CreditCard, Gauge, BellRing} from "lucide-react";
import type {WeekDay, WeekEvent} from "../model/types.ts";
import {expensesApi, type ExpensesTimelineEvent} from "@/apps/resident/pages/expenses/model/expensesApi.ts";

const WEEKDAY_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function money(n: number): string {
    return new Intl.NumberFormat("ru-RU", {style: "currency", currency: "RUB", maximumFractionDigits: 0}).format(n);
}

function timeShort(iso: string): string {
    return new Date(iso).toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"});
}

function mapEvent(e: ExpensesTimelineEvent): WeekEvent {
    if (e.kind === "payment") {
        return {
            icon: CreditCard, bg: "#d1fae5", fg: "#047857",
            title: e.amount ? `Оплачено: ${e.title} · ${money(e.amount)}` : e.title,
            time: timeShort(e.at),
        };
    }
    if (e.kind === "reading") {
        return {
            icon: Gauge, bg: "#e0f2fe", fg: "#0ea5e9",
            title: e.title + (e.meta ? ` · ${e.meta}` : ""),
            time: timeShort(e.at),
        };
    }
    return {
        icon: BellRing, bg: "#fef3c7", fg: "#b45309",
        title: e.amount ? `${e.title} · ${money(e.amount)}` : e.title,
        time: timeShort(e.at),
    };
}

/**
 * Раскладывает плоские события из /expenses/timeline по дням недели,
 * начиная с понедельника текущей недели и на 7 дней вперёд.
 */
function bucketByWeek(events: ExpensesTimelineEvent[], anchor = new Date()): WeekDay[] {
    const today = startOfDay(anchor);
    const dayOfWeek = (today.getDay() + 6) % 7; // 0 = Пн
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);

    const days: WeekDay[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const isCurrent = d.getTime() === today.getTime();

        const dayEvents: WeekEvent[] = events
            .filter(e => startOfDay(new Date(e.at)).getTime() === d.getTime())
            .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
            .map(mapEvent);

        days.push({
            label: WEEKDAY_SHORT[(d.getDay()) % 7],
            date: d.getDate(),
            current: isCurrent,
            events: dayEvents,
        });
    }
    return days;
}

interface WeekTimelineProps {
    days?: WeekDay[];
}

// Карточка "На этой неделе" — реальные события жителя: платежи, поданные показания,
// предстоящие сроки оплаты. Берётся из /expenses/timeline?days=14.
export function WeekTimeline({days: propsDays}: WeekTimelineProps): JSX.Element {
    const [days, setDays] = useState<WeekDay[]>(propsDays ?? []);
    const [loading, setLoading] = useState(propsDays == null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (propsDays != null) return;
        let active = true;
        expensesApi.getTimeline(14)
            .then(events => active && setDays(bucketByWeek(events)))
            .catch(() => active && setError(true))
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, [propsDays]);

    const hasAnyEvents = days.some(d => d.events.length > 0);

    return (
        <div className="card resident-home__week">
            <div className="resident-home__section-head">
                <div>
                    <div className="t-h3">На этой неделе</div>
                    <div className="resident-home__section-sub">
                        Платежи, показания и приближающиеся сроки
                    </div>
                </div>
            </div>

            {loading && (
                <div className="resident-home__empty">
                    <CalendarClock size={28} strokeWidth={1.5}/>
                    <div className="resident-home__empty-text">Загружаем события…</div>
                </div>
            )}

            {!loading && (error || !hasAnyEvents) && (
                <div className="resident-home__empty">
                    <CalendarClock size={28} strokeWidth={1.5}/>
                    <div className="resident-home__empty-text">
                        {error ? "Не удалось загрузить события" : "Запланированных событий нет"}
                    </div>
                </div>
            )}

            {!loading && !error && hasAnyEvents && (
                <ul className="resident-home__week-list">
                    {days.filter(d => d.events.length > 0).map((day, i) => (
                        <li key={i} className="resident-home__week-row">
                            <div
                                className={
                                    "resident-home__week-day" +
                                    (day.current ? " resident-home__week-day--current" : "")
                                }
                            >
                                <div className="resident-home__week-day-name">{day.label}</div>
                                <div className="tnum resident-home__week-day-num">{day.date}</div>
                            </div>

                            <div className="resident-home__week-events">
                                {day.events.map((e, j) => {
                                    const EventIcon = e.icon;
                                    return (
                                        <div key={j} className="resident-home__week-event">
                                            <div
                                                className="resident-home__week-event-icon"
                                                style={{background: e.bg, color: e.fg}}
                                            >
                                                <EventIcon size={13}/>
                                            </div>
                                            <div className="resident-home__week-event-text">
                                                <div className="resident-home__week-event-title">{e.title}</div>
                                                <div className="resident-home__week-event-time">{e.time}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
