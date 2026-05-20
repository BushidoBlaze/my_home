import type {JSX} from "react";
import {ChevronRight} from "lucide-react";
import {PAYMENTS} from "../model/data.ts";

export default function RecentPayments(): JSX.Element {
    return (
        <div className="card billing-payments">
            <div className="billing-payments__head">
                <div>
                    <div className="t-h3">Последние поступления</div>
                    <div className="billing-payments__sub">Сегодня · 142 платежа</div>
                </div>
                <button className="btn btn--sm btn--ghost">
                    Все платежи <ChevronRight size={12}/>
                </button>
            </div>

            <table className="billing-payments__table">
                <tbody>
                    {PAYMENTS.map((p, i) => (
                        <tr key={i}>
                            <td className="tnum billing-payments__time">{p.time}</td>
                            <td>
                                <div className="billing-payments__payer">{p.payer}</div>
                                <div className="billing-payments__addr">{p.addr}</div>
                            </td>
                            <td className="billing-payments__sum-cell">
                                <div className="tnum billing-payments__sum">{p.sum}</div>
                                <div className="billing-payments__channel">{p.channel}</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
