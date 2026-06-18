import type {JSX} from "react";
import {ChevronRight} from "lucide-react";
import type {BillingRecentPayment} from "@/api/managerBilling.api.ts";

function formatTime(iso: string): string {
    const d = new Date(iso);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) return d.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"});
    return d.toLocaleDateString("ru-RU", {day: "2-digit", month: "short"});
}

interface Props {
    payments: BillingRecentPayment[];
}

export default function RecentPayments({payments}: Props): JSX.Element {
    return (
        <div className="card billing-payments">
            <div className="billing-payments__head">
                <div>
                    <div className="t-h3">Последние поступления</div>
                    <div className="billing-payments__sub">
                        {payments.length > 0 ? `${payments.length} платежей` : "Платежей пока нет"}
                    </div>
                </div>
                <button className="btn btn--sm btn--ghost" disabled>
                    Все платежи <ChevronRight size={12}/>
                </button>
            </div>

            <table className="billing-payments__table">
                <tbody>
                    {payments.map(p => (
                        <tr key={p.id}>
                            <td className="tnum billing-payments__time">{formatTime(p.paidAt)}</td>
                            <td>
                                <div className="billing-payments__payer">{p.payerName}</div>
                                <div className="billing-payments__addr">{p.addr}</div>
                            </td>
                            <td className="billing-payments__sum-cell">
                                <div className="tnum billing-payments__sum">
                                    {p.amount.toLocaleString("ru-RU", {maximumFractionDigits: 0})} ₽
                                </div>
                                <div className="billing-payments__channel">{p.channel}</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {payments.length === 0 && (
                <div style={{padding: 24, textAlign: "center", color: "#64748b", fontSize: 13}}>
                    Поступлений пока не зафиксировано.
                </div>
            )}
        </div>
    );
}
