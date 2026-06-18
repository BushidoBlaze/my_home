import type {
    AutoPaySettings,
    ExpensesDashboardResponse,
    MeterReadingPayload,
} from "./types.ts";
import {requestJson} from "@/api/httpClient.ts";

/** Один счётчик с историей — то, что отдаёт GET /expenses/meter-readings. */
export interface MeterReadingGroup {
    meterType: string;
    lastValue: number;
    lastReadingDate: string;
    history: Array<{
        id: string;
        value: number;
        readingDate: string;
        comment?: string | null;
    }>;
}

/** Событие в timeline жителя — платёж / показание / приближающийся срок. */
export interface ExpensesTimelineEvent {
    at: string;
    kind: "payment" | "reading" | "due";
    title: string;
    amount?: number | null;
    meta?: string | null;
}

/** Точка месячного графика «начислено / оплачено». */
export interface ExpensesChartPoint {
    month: string;
    label: string;
    year: number;
    charged: number;
    paid: number;
}

export const expensesApi = {
    getDashboard: () => requestJson<ExpensesDashboardResponse>("/expenses/dashboard"),
    payBill: (billId: string) =>
        requestJson<{ id: string; status: string; paidAt: string; receiptUrl: string }>(`/expenses/bills/${billId}/pay`, {
            method: "POST",
        }),
    submitMeterReading: (payload: MeterReadingPayload) =>
        requestJson<{ id: string; createdAt: string }>("/expenses/meter-readings", {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    getMeterReadings: () =>
        requestJson<MeterReadingGroup[]>("/expenses/meter-readings"),
    getTimeline: (days = 14) =>
        requestJson<ExpensesTimelineEvent[]>(`/expenses/timeline?days=${days}`),
    getChart: (months = 12) =>
        requestJson<ExpensesChartPoint[]>(`/expenses/chart?months=${months}`),
    updateAutoPay: (payload: AutoPaySettings) =>
        requestJson<AutoPaySettings>("/expenses/autopay", {
            method: "PUT",
            body: JSON.stringify(payload),
        }),
};
