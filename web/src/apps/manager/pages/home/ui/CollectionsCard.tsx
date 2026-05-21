import type {JSX} from "react";
import {useNavigate} from "react-router-dom";
import {ChevronRight} from "lucide-react";
import {Donut} from "@/shared/ui/Donut/Donut.tsx";
import {Spark} from "@/shared/ui/Spark/Spark.tsx";
import {managerDashboardApi} from "@/api/managerDashboard.api.ts";
import {useDashboardData} from "../hooks/useDashboardData.ts";
import {adaptCollections} from "../model/adapters.ts";
import {DataError, DataLoading} from "./DataState.tsx";

export default function CollectionsCard(): JSX.Element {
    const navigate = useNavigate();
    const {data, loading, error, retry} = useDashboardData(
        () => managerDashboardApi.getCollections(),
        adaptCollections,
    );

    return (
        <div className="card home-collections">
            <div className="home-collections__head">
                <div>
                    <div className="t-h3">Сборы за месяц</div>
                    <div className="home-section-sub">Начисления / поступления</div>
                </div>
                <button
                    className="btn btn--sm btn--ghost"
                    onClick={() => navigate("/manager/billing")}
                >
                    Подробнее <ChevronRight size={12}/>
                </button>
            </div>

            {loading && <DataLoading compact label="Загрузка сборов…"/>}
            {!loading && (error || !data) && (
                <DataError compact title="Сборы недоступны" onRetry={retry}/>
            )}
            {!loading && !error && data && (
                <div className="home-collections__body">
                    <Donut
                        segments={[
                            {value: data.actualPct, color: "#10b981"},
                            {value: 100 - data.actualPct, color: "#f1f5f9"},
                        ]}
                        center={{value: `${data.actualPct}%`, label: `ПЛАН ${data.plan}%`}}
                        size={130}
                        thickness={14}
                    />

                    <div className="home-collections__rows">
                        <div className="home-collections__row">
                            <span className="home-collections__label">Начислено</span>
                            <span className="tnum home-collections__value">{data.accrued}</span>
                        </div>
                        <div className="home-collections__row">
                            <span className="home-collections__label">Поступило</span>
                            <span className="tnum home-collections__value" style={{color: "#047857"}}>
                                {data.received}
                            </span>
                        </div>
                        <div className="home-collections__row">
                            <span className="home-collections__label">Задолженность</span>
                            <span className="tnum home-collections__value" style={{color: "#ef4444"}}>
                                {data.debt}
                            </span>
                        </div>
                        <div className="home-collections__spark">
                            <Spark data={data.trend} w={220} h={28}/>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
