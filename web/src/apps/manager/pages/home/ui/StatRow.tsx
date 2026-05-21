import type {JSX} from "react";
import {useNavigate} from "react-router-dom";
import {Stat} from "@/shared/ui/Stat/Stat.tsx";
import {managerDashboardApi} from "@/api/managerDashboard.api.ts";
import {useDashboardData} from "../hooks/useDashboardData.ts";
import {adaptKpi} from "../model/adapters.ts";
import {DataError, DataLoading} from "./DataState.tsx";

const KPI_DESTINATION: Record<string, string> = {
    tickets: "/manager/tickets",
    unassigned: "/manager/tickets",
    alerts: "/manager/tickets",
    collection: "/manager/billing",
    meters: "/manager/meter",
};

export default function StatRow(): JSX.Element {
    const navigate = useNavigate();
    const {data, loading, error, retry} = useDashboardData(
        () => managerDashboardApi.getKpi(),
        adaptKpi,
    );

    if (loading) return <DataLoading label="Загрузка показателей…"/>;
    if (error || !data) return <DataError title="Показатели недоступны" onRetry={retry}/>;

    return (
        <div className="home-stats">
            {data.map(stat => {
                const to = KPI_DESTINATION[stat.id];
                return (
                    <Stat
                        key={stat.id}
                        icon={stat.icon}
                        accent={stat.accent}
                        label={stat.label}
                        value={stat.value}
                        delta={stat.delta}
                        deltaDir={stat.deltaDir}
                        sub={stat.sub}
                        onClick={to ? () => navigate(to) : undefined}
                    />
                );
            })}
        </div>
    );
}
