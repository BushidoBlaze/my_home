import {useCallback, useEffect, useMemo, useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {expensesApi, type ExpensesChartPoint, type MeterReadingGroup} from "../model/expensesApi.ts";
import type {
    AutoPaySettings,
    DistributionSlice,
    ExpenseSummary,
    MeterReadingPayload,
    PaymentHistoryItem,
    UtilityBill,
} from "../model/types.ts";

const EMPTY_SUMMARY: ExpenseSummary = {charged: 0, paid: 0, debt: 0};

export function useExpensesPage() {
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);

    const [summary, setSummary] = useState<ExpenseSummary>(EMPTY_SUMMARY);
    const [bills, setBills] = useState<UtilityBill[]>([]);
    const [distribution, setDistribution] = useState<DistributionSlice[]>([]);
    const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
    const [autoPay, setAutoPay] = useState<AutoPaySettings>({
        enabled: false,
        cardMask: null,
        dayOfMonth: 10,
        limitAmount: 15000,
    });

    const [meterForm, setMeterForm] = useState<MeterReadingPayload>({
        meterType: "Холодная вода",
        value: 0,
        readingDate: new Date().toISOString().slice(0, 10),
        comment: "",
    });

    const [payingBillId, setPayingBillId] = useState<string | null>(null);
    const [meterSubmitting, setMeterSubmitting] = useState(false);
    const [autoPaySubmitting, setAutoPaySubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const dashboardQuery = useQuery({
        queryKey: ["expenses-dashboard"],
        queryFn: expensesApi.getDashboard,
    });

    const chartQuery = useQuery({
        queryKey: ["expenses-chart"],
        queryFn: () => expensesApi.getChart(12),
    });

    const meterReadingsQuery = useQuery({
        queryKey: ["expenses-meter-readings"],
        queryFn: expensesApi.getMeterReadings,
    });

    const loadDashboard = useCallback(async () => {
        setError(null);
        try {
            const data = await dashboardQuery.refetch({throwOnError: true}).then(result => result.data);
            if (!data) return;
            setSummary(data.summary);
            setBills(data.bills);
            setDistribution(data.managementDistribution);
            setPayments(data.paymentHistory);
            setAutoPay(data.autoPay);
        } catch (e) {
            setError((e as Error).message || "Не удалось загрузить раздел расходов");
        }
    }, [dashboardQuery]);

    useEffect(() => {
        if (!dashboardQuery.data) return;

        setSummary(dashboardQuery.data.summary);
        setBills(dashboardQuery.data.bills);
        setDistribution(dashboardQuery.data.managementDistribution);
        setPayments(dashboardQuery.data.paymentHistory);
        setAutoPay(dashboardQuery.data.autoPay);
    }, [dashboardQuery.data]);

    const payBillMutation = useMutation({
        mutationFn: expensesApi.payBill,
        onMutate: (billId) => {
            setPayingBillId(billId);
            setSuccessMessage(null);
            setError(null);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["expenses-dashboard"]});
            await queryClient.invalidateQueries({queryKey: ["expenses-chart"]});
            setSuccessMessage("Счет успешно оплачен.");
        },
        onError: (e) => {
            setError((e as Error).message || "Ошибка оплаты");
        },
        onSettled: () => {
            setPayingBillId(null);
        },
    });

    const submitMeterMutation = useMutation({
        mutationFn: expensesApi.submitMeterReading,
        onMutate: () => {
            setMeterSubmitting(true);
            setSuccessMessage(null);
            setError(null);
        },
        onSuccess: async () => {
            setSuccessMessage("Показания ИПУ переданы.");
            setMeterForm((prev) => ({
                meterType: prev.meterType,
                value: prev.value,
                readingDate: new Date().toISOString().slice(0, 10),
                comment: "",
            }));
            // После приёма показаний — обновляем агрегат, чтобы карточки счётчиков увидели новое значение.
            await queryClient.invalidateQueries({queryKey: ["expenses-meter-readings"]});
        },
        onError: (e) => {
            setError((e as Error).message || "Ошибка отправки показаний");
        },
        onSettled: () => {
            setMeterSubmitting(false);
        },
    });

    const autoPayMutation = useMutation({
        mutationFn: expensesApi.updateAutoPay,
        onMutate: () => {
            setAutoPaySubmitting(true);
            setSuccessMessage(null);
            setError(null);
        },
        onSuccess: (updated) => {
            setAutoPay(updated);
            setSuccessMessage("Автоплатеж обновлен.");
        },
        onError: (e) => {
            setError((e as Error).message || "Ошибка сохранения автоплатежа");
        },
        onSettled: () => {
            setAutoPaySubmitting(false);
        },
    });

    const payBill = useCallback(async (billId: string) => {
        await payBillMutation.mutateAsync(billId);
    }, [payBillMutation]);

    const submitMeterReading = useCallback(async (payload?: MeterReadingPayload) => {
        await submitMeterMutation.mutateAsync(payload ?? meterForm);
    }, [meterForm, submitMeterMutation]);

    const saveAutoPay = useCallback(async () => {
        await autoPayMutation.mutateAsync(autoPay);
    }, [autoPay, autoPayMutation]);

    const chartBackground = useMemo(() => {
        const total = distribution.reduce((acc, item) => acc + item.amount, 0);
        if (!total) return "conic-gradient(#e8f0ec 0deg 360deg)";

        const palette = ["#1f7a5a", "#2ecc71", "#10b981", "#34d399", "#86efac", "#14532d"];
        let start = 0;
        const parts = distribution.map((item, index) => {
            const angle = (item.amount / total) * 360;
            const end = start + angle;
            const segment = `${palette[index % palette.length]} ${start}deg ${end}deg`;
            start = end;
            return segment;
        });
        return `conic-gradient(${parts.join(", ")})`;
    }, [distribution]);

    const chart: ExpensesChartPoint[] = chartQuery.data ?? [];
    const meterReadings: MeterReadingGroup[] = meterReadingsQuery.data ?? [];

    return {
        loading: dashboardQuery.isLoading || dashboardQuery.isFetching,
        error,
        summary,
        bills,
        distribution,
        payments,
        autoPay,
        setAutoPay,
        meterForm,
        setMeterForm,
        payingBillId,
        meterSubmitting,
        autoPaySubmitting,
        successMessage,
        chartBackground,
        chart,
        chartLoading: chartQuery.isLoading,
        meterReadings,
        meterReadingsLoading: meterReadingsQuery.isLoading,
        loadDashboard,
        payBill,
        submitMeterReading,
        saveAutoPay,
    };
}
