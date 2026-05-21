import type {JSX} from "react";
import {useNavigate} from "react-router-dom";
import {ChevronRight} from "lucide-react";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import {managerDashboardApi} from "@/api/managerDashboard.api.ts";
import {useDashboardData} from "../hooks/useDashboardData.ts";
import {adaptPriorityTickets} from "../model/adapters.ts";
import {DataError, DataLoading} from "./DataState.tsx";

export default function PriorityQueue(): JSX.Element {
    const navigate = useNavigate();
    const {data: tickets, loading, error, retry} = useDashboardData(
        () => managerDashboardApi.getPriorityTickets(6),
        adaptPriorityTickets,
    );

    const openTicket = (rowId: string) => {
        const id = rowId.replace(/^Т-/, "");
        navigate(`/manager/tickets/${id}`);
    };

    return (
        <div className="card home-pq">
            <div className="home-section-head">
                <div>
                    <div className="t-h3">Приоритетная очередь</div>
                    <div className="home-section-sub">Заявки, требующие реакции в ближайший час</div>
                </div>
                <div className="home-section-actions">
                    <button
                        className="btn btn--sm"
                        onClick={() => navigate("/manager/tickets")}
                    >
                        Все заявки <ChevronRight size={12}/>
                    </button>
                </div>
            </div>

            {loading && <div style={{padding: 16}}><DataLoading compact label="Загрузка очереди…"/></div>}
            {!loading && (error || !tickets) && (
                <div style={{padding: 16}}>
                    <DataError title="Очередь заявок недоступна" onRetry={retry}/>
                </div>
            )}
            {!loading && !error && tickets && (
                <table className="home-pq__table">
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>Заявка</th>
                            <th>Адрес</th>
                            <th>Исполнитель</th>
                            <th>SLA</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(row => {
                            const RowIcon = row.icon;
                            return (
                                <tr
                                    key={row.id}
                                    onClick={() => openTicket(row.id)}
                                    style={{cursor: "pointer"}}
                                >
                                    <td>
                                        <span className="mono home-pq__id">{row.id}</span>
                                    </td>
                                    <td>
                                        <div className="home-pq__title-cell">
                                            <div
                                                className="home-pq__title-icon"
                                                style={{background: row.iconBg, color: row.iconFg}}
                                            >
                                                <RowIcon size={16}/>
                                            </div>
                                            <div>
                                                <div className="home-pq__title">{row.title}</div>
                                                <div className="home-pq__subtitle">{row.subTitle}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="home-pq__addr">{row.addr}</td>
                                    <td>
                                        <div className="home-pq__assignee">
                                            {row.assignee === "—" ? (
                                                <span className="home-pq__assignee-empty">не назначен</span>
                                            ) : (
                                                <>
                                                    <Avatar name={row.assignee} size={22}/>
                                                    <span>{row.assignee}</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={"chip" + (row.slaTone ? " chip--" + row.slaTone : "")}>
                                            {row.sla}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={"chip" + (row.statusTone ? " chip--" + row.statusTone : "")}>
                                            <span className="chip__dot"/>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}
