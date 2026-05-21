import type {JSX} from "react";
import {useNavigate} from "react-router-dom";
import {ChevronRight} from "lucide-react";
import {managerDashboardApi} from "@/api/managerDashboard.api.ts";
import {useDashboardData} from "../hooks/useDashboardData.ts";
import {adaptActivity} from "../model/adapters.ts";
import {DataError, DataLoading} from "./DataState.tsx";

export default function ActivityFeed(): JSX.Element {
    const navigate = useNavigate();
    const {data: events, loading, error, retry} = useDashboardData(
        () => managerDashboardApi.getActivity(6),
        adaptActivity,
    );

    return (
        <div className="card home-activity">
            <div className="home-section-head">
                <div className="t-h3">Лента событий</div>
                <button
                    className="btn btn--sm btn--ghost"
                    onClick={() => navigate("/manager/chat")}
                >
                    Открыть журнал <ChevronRight size={12}/>
                </button>
            </div>

            {loading && <div style={{padding: 18}}><DataLoading compact label="Загрузка ленты…"/></div>}
            {!loading && (error || !events) && (
                <div style={{padding: 18}}>
                    <DataError compact title="Лента недоступна" onRetry={retry}/>
                </div>
            )}
            {!loading && !error && events && (
                <div className="home-activity__list">
                    {events.map((event, i) => {
                        const EventIcon = event.icon;
                        return (
                            <div
                                key={i}
                                className="home-activity__item"
                                style={{borderBottom: i < events.length - 1 ? "1px solid #f1f5f9" : "none"}}
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
            )}
        </div>
    );
}
