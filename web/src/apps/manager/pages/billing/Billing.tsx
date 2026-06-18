// plugins
import {useCallback, useEffect, useState, type JSX} from "react";
import {RussianRuble, CheckCircle2, AlertTriangle, TrendingUp, FileText} from "lucide-react";

// api
import {
    managerBillingApi,
    type BillingSummary, type BillingHouseRow, type BillingDebtor,
    type BillingRecentPayment, type BillingStructureItem, type BillingChartPoint
} from "@/api/managerBilling.api.ts";

// hooks
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

// ui
import TopBar from "@/widgets/topBar/ui/TopBar.tsx";
import PeriodSwitcher from "./ui/PeriodSwitcher.tsx";
import BigStat from "./ui/BigStat.tsx";
import ChargesCard from "./ui/ChargesCard.tsx";
import StructureCard from "./ui/StructureCard.tsx";
import HousesTable from "./ui/HousesTable.tsx";
import TopDebtors from "./ui/TopDebtors.tsx";
import RecentPayments from "./ui/RecentPayments.tsx";
import {DataError, DataLoading} from "@/apps/manager/pages/home/ui/DataState.tsx";

// styles
import "./Billing.css";

interface BillingData {
    summary: BillingSummary;
    houses: BillingHouseRow[];
    debtors: BillingDebtor[];
    payments: BillingRecentPayment[];
    structure: BillingStructureItem[];
    chart: BillingChartPoint[];
}

// Иконки для KPI-карточек, выбираются по id из summary.stats.
const STAT_META: Record<string, {icon: typeof RussianRuble; tone: "info" | "emerald" | "danger"}> = {
    charged: {icon: RussianRuble, tone: "info"},
    received: {icon: CheckCircle2, tone: "emerald"},
    debt: {icon: AlertTriangle, tone: "danger"},
    collection: {icon: TrendingUp, tone: "emerald"},
    bills: {icon: FileText, tone: "info"},
};

export default function Billing(): JSX.Element {
    useDocumentTitle('Начисления и платежи');

    const [data, setData] = useState<BillingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Выбранный период начислений. По умолчанию — текущий месяц.
    const [period, setPeriod] = useState(() => {
        const d = new Date();
        return {year: d.getFullYear(), month: d.getMonth() + 1};
    });

    // Листание месяца с переносом года.
    const shiftPeriod = (delta: number) => setPeriod(p => {
        const idx = p.year * 12 + (p.month - 1) + delta;
        return {year: Math.floor(idx / 12), month: (idx % 12) + 1};
    });

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [summary, houses, debtors, payments, structure, chart] = await Promise.all([
                managerBillingApi.summary(period.year, period.month),
                managerBillingApi.houses(period.year, period.month),
                managerBillingApi.debtors(10),
                managerBillingApi.recentPayments(20),
                managerBillingApi.structure(period.year, period.month),
                managerBillingApi.chart(12),
            ]);
            setData({summary, houses, debtors, payments, structure, chart});
        } catch (e) {
            setError(e instanceof Error ? e : new Error(String(e)));
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => { void fetchAll(); }, [fetchAll]);

    return (
        <>
            <TopBar
                title="Начисления и платежи"
                subtitle={data ? data.summary.periodLabel : (loading ? "загрузка…" : "ошибка")}
            />

            <div className="billing">
                <PeriodSwitcher
                    year={period.year}
                    month={period.month}
                    onPrev={() => shiftPeriod(-1)}
                    onNext={() => shiftPeriod(1)}
                />

                {loading && <DataLoading label="Загружаем сводку…"/>}

                {!loading && error && (
                    <DataError
                        title="Не удалось загрузить данные"
                        message="Бэкенд недоступен. Попробуйте обновить страницу."
                        onRetry={fetchAll}
                    />
                )}

                {!loading && !error && data && (
                    <>
                        <div className="billing-stats">
                            {data.summary.stats.map(s => {
                                const meta = STAT_META[s.id] ?? STAT_META.charged;
                                return (
                                    <BigStat
                                        key={s.id}
                                        label={s.label.toUpperCase()}
                                        value={formatStat(s.value, s.unit)}
                                        sub={formatSub(s)}
                                        tone={meta.tone}
                                        icon={meta.icon}
                                    />
                                );
                            })}
                        </div>

                        <div className="billing-mid">
                            <ChargesCard data={data.chart}/>
                            <StructureCard items={data.structure}/>
                        </div>

                        <HousesTable houses={data.houses}/>

                        <div className="billing-bottom">
                            <TopDebtors debtors={data.debtors}/>
                            <RecentPayments payments={data.payments}/>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

function formatStat(value: number, unit: "money" | "percent" | "count"): string {
    if (unit === "percent") return `${value.toFixed(1)}%`;
    if (unit === "count")   return value.toLocaleString("ru-RU");
    return `${value.toLocaleString("ru-RU", {maximumFractionDigits: 0})} ₽`;
}

function formatSub(s: {previous?: number | null; unit: string; id: string}): string {
    if (s.previous == null) return "";
    if (s.id === "bills" && s.unit === "count") {
        return `${s.previous.toLocaleString("ru-RU")} оплачено`;
    }
    if (s.unit === "percent") {
        const delta = (s.previous as number);
        return `прошлый месяц: ${delta.toFixed(1)}%`;
    }
    const delta = (s.previous as number);
    return `прошлый месяц: ${delta.toLocaleString("ru-RU", {maximumFractionDigits: 0})} ₽`;
}
