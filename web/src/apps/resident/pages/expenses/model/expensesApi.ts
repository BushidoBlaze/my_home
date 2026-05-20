import type {
    AutoPaySettings,
    ExpensesDashboardResponse,
    MeterReadingPayload,
} from "./types.ts";
import {requestJson} from "@/api/httpClient.ts";

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
    updateAutoPay: (payload: AutoPaySettings) =>
        requestJson<AutoPaySettings>("/expenses/autopay", {
            method: "PUT",
            body: JSON.stringify(payload),
        }),
};
