export interface ExpenseSummary {
    charged: number;
    paid: number;
    debt: number;
}

export interface UtilityBill {
    id: string;
    category: string;
    title: string;
    periodLabel: string;
    amount: number;
    dueDate: string;
    status: "Pending" | "Paid" | string;
    paidAt?: string | null;
    receiptUrl?: string | null;
}

export interface DistributionSlice {
    category: string;
    amount: number;
}

export interface PaymentHistoryItem {
    id: string;
    title: string;
    amount: number;
    paidAt?: string | null;
    receiptUrl?: string | null;
}

export interface AutoPaySettings {
    enabled: boolean;
    cardMask?: string | null;
    dayOfMonth: number;
    limitAmount: number;
}

export interface ExpensesDashboardResponse {
    summary: ExpenseSummary;
    bills: UtilityBill[];
    managementDistribution: DistributionSlice[];
    paymentHistory: PaymentHistoryItem[];
    autoPay: AutoPaySettings;
}

export interface MeterReadingPayload {
    meterType: string;
    value: number;
    readingDate?: string;
    comment?: string;
}
