import {useEffect, useState, type JSX} from "react";
import {Link} from "react-router-dom";
import {CreditCard, ShieldCheck, Sparkles} from "lucide-react";
import {Donut} from "@/shared/ui/Donut/Donut.tsx";
import {expensesApi} from "@/apps/resident/pages/expenses/model/expensesApi.ts";

function money(value: number): string {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDueChip(dueDateIso: string): {label: string; tone: "warning" | "danger" | "emerald"} {
    const due = new Date(dueDateIso);
    const days = Math.ceil((due.getTime() - Date.now()) / 86_400_000);
    const dateLabel = due.toLocaleDateString("ru-RU", {day: "numeric", month: "long"});
    if (days < 0) return {label: `просрочен с ${dateLabel}`, tone: "danger"};
    if (days <= 5) return {label: `срок до ${dateLabel}`, tone: "warning"};
    return {label: `срок до ${dateLabel}`, tone: "emerald"};
}

// Карточка ближайшего платежа: тянет из /expenses/dashboard ближайший Pending счёт
// + считает прогресс оплаты по итогам месяца.
export function PaymentCard(): JSX.Element {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [data, setData] = useState<{
        title: string;
        amount: number;
        dueDate: string;
        paidPct: number;
    } | null>(null);

    useEffect(() => {
        let active = true;
        expensesApi.getDashboard()
            .then(res => {
                if (!active) return;
                // Ближайший неоплаченный счёт = первый Pending с самым ранним dueDate.
                const pending = res.bills.filter(b => b.status !== "Paid");
                const upcoming = pending.length > 0
                    ? pending.slice().sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]
                    : null;

                const total = res.summary.charged;
                const paid = res.summary.paid;
                const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0;

                if (upcoming) {
                    setData({
                        title: upcoming.title,
                        amount: upcoming.amount,
                        dueDate: upcoming.dueDate,
                        paidPct,
                    });
                } else {
                    // Всё оплачено — карточка покажет «нет долга», но компонент всё равно рисует прогресс
                    setData({
                        title: "Долгов по ЖКУ нет",
                        amount: 0,
                        dueDate: new Date().toISOString(),
                        paidPct: 100,
                    });
                }
            })
            .catch(() => active && setError(true))
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, []);

    if (loading) {
        return (
            <div className="card resident-home__payment">
                <div style={{padding: 24, color: "#64748b"}}>Загружаем платежи…</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="card resident-home__payment">
                <div className="resident-home__payment-head">
                    <div>
                        <div className="t-eyebrow">Ближайший платёж</div>
                        <div className="resident-home__payment-name">Нет данных</div>
                    </div>
                </div>
                <div style={{padding: 12, color: "#64748b", fontSize: 13}}>
                    Не удалось загрузить счета. Попробуйте обновить страницу.
                </div>
            </div>
        );
    }

    const noDebt = data.amount === 0;
    const chip = noDebt
        ? {label: "оплачено", tone: "emerald" as const}
        : formatDueChip(data.dueDate);

    return (
        <div className="card resident-home__payment">
            <div className="resident-home__payment-head">
                <div>
                    <div className="t-eyebrow">Ближайший платёж</div>
                    <div className="resident-home__payment-name">{data.title}</div>
                </div>
                <span className={`chip chip--${chip.tone}`}>
                    <span className="chip__dot"/> {chip.label}
                </span>
            </div>

            <div className="resident-home__payment-body">
                <div className="resident-home__payment-main">
                    <div className="tnum resident-home__payment-amount">
                        {noDebt ? "0 ₽" : money(data.amount)}
                    </div>
                    <div className="resident-home__payment-sub">
                        {noDebt ? "все счета закрыты" : "автоплатёж не настроен"}
                    </div>

                    <div className="resident-home__payment-buttons">
                        <Link to="/resident/expenses" className="btn btn--primary">
                            <CreditCard size={14}/> {noDebt ? "Открыть расходы" : "Оплатить"}
                        </Link>
                        <Link to="/resident/expenses?tab=autopay" className="btn">
                            <Sparkles size={14}/> Подключить автоплатёж
                        </Link>
                    </div>

                    <div className="resident-home__payment-hint">
                        <ShieldCheck size={12}/> СберPay · СБП · банковская карта · комиссия 0 ₽
                    </div>
                </div>

                <Donut
                    segments={[
                        {value: data.paidPct, color: "#10b981"},
                        {value: 100 - data.paidPct, color: "#f1f5f9"},
                    ]}
                    center={{value: `${data.paidPct}%`, label: "ОПЛАЧЕНО"}}
                    size={110}
                    thickness={12}
                />
            </div>
        </div>
    );
}
