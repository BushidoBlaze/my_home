// plugins
import {useCallback, useEffect, useMemo, useState, type JSX} from "react";
import {Inbox} from "lucide-react";

// api
import {requestsApi, type ManagerServiceRequest} from "@/api/requests.api.ts";

// data
import {buildKanban, buildSubtitle, filterRequests} from "./model/adapters.ts";

// hooks
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

// ui
import TopBar from "@/widgets/topBar/ui/TopBar.tsx";
import FilterBar, {type TicketsView} from "./ui/FilterBar.tsx";
import KanbanColumn from "./ui/KanbanColumn.tsx";
import KanbanCard from "./ui/KanbanCard.tsx";
import {DataError, DataLoading} from "@/apps/manager/pages/home/ui/DataState.tsx";

// styles
import "./Tickets.css";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function Tickets(): JSX.Element {
    useDocumentTitle('Входные заявки жителей');

    const [view, setView] = useState<TicketsView>("kanban");
    const [activeTab, setActiveTab] = useState("all");

    const [requests, setRequests] = useState<ManagerServiceRequest[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await requestsApi.getAllRequests();
            setRequests(list);
        } catch (e) {
            setError(e instanceof Error ? e : new Error(String(e)));
            setRequests(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void fetchRequests(); }, [fetchRequests]);

    const columns = useMemo(
        () => requests ? buildKanban(filterRequests(requests, activeTab)) : [],
        [requests, activeTab]
    );

    const subtitle = useMemo(() => {
        if (loading) return "загрузка…";
        if (error) return "ошибка загрузки";
        if (!requests || requests.length === 0) return "пока нет заявок";
        return buildSubtitle(requests);
    }, [requests, loading, error]);

    return (
        <>
            <TopBar
                title="Заявки"
                subtitle={subtitle}
            />

            <FilterBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                view={view}
                onViewChange={setView}
            />

            {loading && (
                <div style={{padding: 24}}>
                    <DataLoading label="Загружаем заявки…"/>
                </div>
            )}

            {!loading && error && (
                <div style={{padding: 24}}>
                    <DataError
                        title="Не удалось загрузить заявки"
                        message="Бэкенд недоступен. Проверьте подключение и попробуйте снова."
                        onRetry={fetchRequests}
                    />
                </div>
            )}

            {!loading && !error && requests && requests.length === 0 && (
                <div style={{padding: 48, textAlign: "center", color: "#64748b"}}>
                    <Inbox size={36} strokeWidth={1.5}/>
                    <div style={{marginTop: 8, fontWeight: 600, color: "#0f172a"}}>
                        Заявок пока нет
                    </div>
                    <div style={{marginTop: 4, fontSize: 13}}>
                        Когда жильцы создадут заявки, они появятся на этой доске.
                    </div>
                </div>
            )}

            {!loading && !error && requests && requests.length > 0 && view === "kanban" && (
                <div className="kanban-board">
                    {columns.map((col, i) => (
                        <KanbanColumn key={i} column={col}/>
                    ))}
                </div>
            )}

            {!loading && !error && requests && requests.length > 0 && view === "list" && (
                <div className="kanban-board kanban-board--list">
                    {columns.map((col, i) => (
                        <div key={i} className="kanban-list__group">
                            <div className="kanban-list__head">
                                <span className="kanban-col__dot" style={{background: col.tone}}/>
                                <span className="kanban-col__title">{col.title}</span>
                                <span className="kanban-col__count">· {col.count}</span>
                            </div>
                            <div className="kanban-list__items">
                                {col.tickets.map(t => (
                                    <KanbanCard key={t.id} ticket={t}/>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && !error && requests && requests.length > 0 && view === "calendar" && (
                <div className="kanban-board kanban-board--calendar">
                    {WEEKDAYS.map((day, dayIdx) => {
                        const dayTickets = columns.flatMap(c => c.tickets)
                            .filter((_, i) => i % 7 === dayIdx);
                        return (
                            <div key={day} className="kanban-cal__day">
                                <div className="kanban-cal__head">
                                    <span className="kanban-cal__weekday">{day}</span>
                                    <span className="kanban-cal__count">{dayTickets.length}</span>
                                </div>
                                <div className="kanban-cal__items">
                                    {dayTickets.map(t => (
                                        <KanbanCard key={t.id} ticket={t}/>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
