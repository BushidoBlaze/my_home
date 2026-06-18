import type {JSX} from "react";
import {Send} from "lucide-react";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import type {BillingDebtor} from "@/api/managerBilling.api.ts";

interface Props {
    debtors: BillingDebtor[];
}

export default function TopDebtors({debtors}: Props): JSX.Element {
    return (
        <div className="card billing-debtors">
            <div className="billing-debtors__head">
                <div>
                    <div className="t-h3">Топ должников</div>
                    <div className="billing-debtors__sub">
                        {debtors.length > 0 ? "Долг более 30 дней" : "Должников нет"}
                    </div>
                </div>
                <button className="btn btn--sm btn--primary" disabled>Отправить уведомления</button>
            </div>

            <div className="billing-debtors__list">
                {debtors.map(d => (
                    <div key={d.userId} className="billing-debtors__item">
                        <Avatar name={d.fullName} size={32}/>
                        <div className="billing-debtors__main">
                            <div className="billing-debtors__name">{d.fullName}</div>
                            <div className="billing-debtors__addr">{d.addr}</div>
                        </div>
                        <div className="billing-debtors__amount">
                            <div className="tnum billing-debtors__debt">
                                {d.debt.toLocaleString("ru-RU", {maximumFractionDigits: 0})} ₽
                            </div>
                            <div className="billing-debtors__months">{d.monthsOverdue} мес.</div>
                        </div>
                        <button className="btn btn--icon btn--sm" disabled>
                            <Send size={13}/>
                        </button>
                    </div>
                ))}
                {debtors.length === 0 && (
                    <div style={{padding: 24, textAlign: "center", color: "#64748b", fontSize: 13}}>
                        В этом периоде должников нет 🎉
                    </div>
                )}
            </div>
        </div>
    );
}
