import {requestJson} from "@/api/httpClient.ts";

export interface BillingStat {
    id: string;
    label: string;
    value: number;
    previous?: number | null;
    unit: "money" | "percent" | "count";
}

export interface BillingSummary {
    periodLabel: string;
    stats: BillingStat[];
}

export interface BillingHouseRow {
    id: string;
    addr: string;
    apartments: number;
    charged: number;
    paid: number;
    debt: number;
    collectionPct: number;
    tone: "ok" | "warning" | "danger";
}

export interface BillingDebtor {
    userId: string;
    fullName: string;
    avatarUrl?: string | null;
    addr: string;
    phone?: string | null;
    debt: number;
    monthsOverdue: number;
}

export interface BillingRecentPayment {
    id: string;
    paidAt: string;
    amount: number;
    title: string;
    category: string;
    payerName: string;
    addr: string;
    channel: string;
}

export interface BillingStructureItem {
    label: string;
    amount: number;
    pct: number;
    color: string;
}

export interface BillingChartPoint {
    month: string;
    label: string;
    charged: number;
    paid: number;
}

// ?year=&month= для эндпоинтов, зависящих от периода.
function periodQs(year?: number, month?: number): string {
    if (year == null || month == null) return "";
    return `?year=${year}&month=${month}`;
}

export const managerBillingApi = {
    summary: (year?: number, month?: number) =>
        requestJson<BillingSummary>(`/manager/billing/summary${periodQs(year, month)}`),
    houses: (year?: number, month?: number) =>
        requestJson<BillingHouseRow[]>(`/manager/billing/houses${periodQs(year, month)}`),
    debtors: (limit = 10) => requestJson<BillingDebtor[]>(`/manager/billing/debtors?limit=${limit}`),
    recentPayments: (limit = 20) => requestJson<BillingRecentPayment[]>(`/manager/billing/payments/recent?limit=${limit}`),
    structure: (year?: number, month?: number) =>
        requestJson<BillingStructureItem[]>(`/manager/billing/structure${periodQs(year, month)}`),
    chart: (months = 12) => requestJson<BillingChartPoint[]>(`/manager/billing/chart?months=${months}`),
};
