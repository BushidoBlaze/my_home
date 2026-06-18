import type {JSX} from "react";
import {useNavigate} from "react-router-dom";
import {ArrowUpDown, Flame, ShieldAlert, Wind, ChevronRight, type LucideIcon} from "lucide-react";
import type {ComplianceDeadline, ComplianceStatus} from "../model/types.ts";
import {managerDashboardApi} from "@/api/managerDashboard.api.ts";
import {useDashboardData} from "../hooks/useDashboardData.ts";
import {adaptCompliance} from "../model/adapters.ts";
import {DataError, DataLoading} from "./DataState.tsx";

const CATEGORY_ICON: Record<ComplianceDeadline["category"], LucideIcon> = {
    lift: ArrowUpDown,
    gas: Flame,
    fire: ShieldAlert,
    duct: Wind,
};

const STATUS_STYLE: Record<ComplianceStatus, { bg: string; fg: string; label: string }> = {
    burning: {bg: "#fee2e2", fg: "#ef4444", label: "Горит"},
    soon: {bg: "#fef3c7", fg: "#f59e0b", label: "Скоро"},
    ok: {bg: "#d1fae5", fg: "#047857", label: "В норме"},
};

export default function ComplianceCard(): JSX.Element {
    const navigate = useNavigate();
    const {data: items, loading, error, retry} = useDashboardData(
        () => managerDashboardApi.getCompliance(5),
        adaptCompliance,
    );

    return (
        <div className="card home-compliance">
            <div className="home-compliance__head">
                <div>
                    <div style={{fontWeight: 600, fontSize: 14}}>Регуляторные сроки</div>
                    <div className="home-section-sub">ближайшие проверки и обязательные работы</div>
                </div>
                <button
                    type="button"
                    className="home-compliance__link"
                    onClick={() => navigate("/manager/buildings")}
                >
                    Все <ChevronRight size={12}/>
                </button>
            </div>

            {loading && <DataLoading compact label="Загрузка сроков…"/>}
            {!loading && (error || !items) && (
                <DataError compact title="Сроки недоступны" onRetry={retry}/>
            )}
            {!loading && !error && items && items.length === 0 && (
                <div className="home-compliance__empty">Ближайших сроков нет</div>
            )}
            {!loading && !error && items && items.length > 0 && (
                <ul className="home-compliance__list">
                    {items.map(item => {
                        const Icon = CATEGORY_ICON[item.category];
                        const s = STATUS_STYLE[item.status];
                        return (
                            <li key={item.id} className="home-compliance__row">
                                <div className="home-compliance__icon" style={{background: s.bg, color: s.fg}}>
                                    <Icon size={14}/>
                                </div>
                                <div className="home-compliance__main">
                                    <div className="home-compliance__title">{item.title}</div>
                                    <div className="home-compliance__addr">{item.addr}</div>
                                </div>
                                <div className="home-compliance__due">
                                    <div className="home-compliance__due-label" style={{color: s.fg}}>{item.dueLabel}</div>
                                    <div className="home-compliance__status">{s.label}</div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
